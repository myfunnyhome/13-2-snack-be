import { ApiError } from '@google/genai';
import { z } from 'zod';

import { getGeminiClient } from '../../config/gemini';
import { AppError } from '../../types/errors';
import { getEmbeddingData } from './snacky.repository';
import {
  type SnackyAnswer,
  type SnackySearchResult,
  parseVector,
  snackyAnswerSchema,
} from './snacky.type';

const QUERY_PREFIX = 'task: search result | query: ';
const ANSWER_MODEL = 'gemini-3.5-flash-lite';
const ANSWER_INSTRUCTION =
  '[근거]에 있는 내용만으로 짧고 핵심만 답한다. 근거에 없는 내용은 만들지 말고, 근거로 답할 수 없으면 "Snacky는 SNACK 서비스 이용 안내를 도와드려요. 이 질문은 답변 범위를 벗어났어요."라고 답한다.';
const ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    answer: { type: 'string' },
  },
  required: ['answer'],
};
const SNACKY_BUSY_MESSAGE =
  'Snacky 사용량이 많아요. 잠시 후 다시 시도해주세요.';

async function embedQuery(
  text: string,
  model: string,
  dimension: number,
): Promise<number[]> {
  const response = await getGeminiClient()
    .models.embedContent({
      model,
      contents: text,
      config: { outputDimensionality: dimension },
    })
    .catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 429) {
        throw new AppError(SNACKY_BUSY_MESSAGE, 503, 'SNACKY_BUSY');
      }
      throw error;
    });

  return parseVector(response.embeddings?.[0]?.values, dimension, 'query');
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / Math.sqrt(normA * normB);
}

export async function searchChunks(
  question: string,
): Promise<SnackySearchResult[]> {
  const { model, dimension, chunks } = getEmbeddingData();
  const queryVector = await embedQuery(
    `${QUERY_PREFIX}${question}`,
    model,
    dimension,
  );

  return chunks
    .map(({ embedding, ...chunk }) => ({
      ...chunk,
      similarity: cosineSimilarity(queryVector, embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity);
}

export async function answerQuestion(question: string): Promise<SnackyAnswer> {
  const [top] = await searchChunks(question);
  const interaction = await getGeminiClient().interactions.create({
    model: ANSWER_MODEL,
    system_instruction: ANSWER_INSTRUCTION,
    input: `[근거]\n${top.text}\n\n[질문]\n${question}`,
    response_format: {
      type: 'text',
      mime_type: 'application/json',
      schema: ANSWER_SCHEMA,
    },
    store: false,
  });

  if (!interaction.output_text) {
    throw new Error('답변이 비어 있습니다.');
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(interaction.output_text);
  } catch {
    throw new Error('Gemini 응답이 JSON 형식이 아닙니다.');
  }

  const result = snackyAnswerSchema.safeParse(parsed);

  if (!result.success) {
    throw new Error(
      `답변 형식이 올바르지 않습니다: ${z.prettifyError(result.error)}`,
    );
  }

  return {
    answer: result.data.answer,
    sources: [
      {
        documentId: top.documentId,
        section: top.sectionTitle,
      },
    ],
  };
}
