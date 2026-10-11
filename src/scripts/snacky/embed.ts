import 'dotenv/config';

import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import type { Content } from '@google/genai';
import { z } from 'zod';

import { getGeminiClient } from '../../config/gemini';
import {
  type SnackyChunk,
  type SnackyEmbeddingData,
  snackyChunkListSchema,
  snackyEmbeddingDataSchema,
} from '../../modules/snacky/snacky.type';

const MODEL = 'gemini-embedding-2';
const DIMENSION = 768;
const DOCUMENT_ID = 'general';
const SOURCE_PATH = path.join(
  __dirname,
  '../../../snacky/chunks',
  `${DOCUMENT_ID}.json`,
);
const OUTPUT_PATH = path.join(
  __dirname,
  '../../../snacky/embeddings',
  `${DOCUMENT_ID}.json`,
);

function readChunks(): SnackyChunk[] {
  const result = snackyChunkListSchema.safeParse(
    JSON.parse(readFileSync(SOURCE_PATH, 'utf8')),
  );

  if (!result.success) {
    throw new Error(
      `chunk 파일 구조가 올바르지 않습니다: ${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}

function toContents(chunks: SnackyChunk[]): Content[] {
  return chunks.map((chunk) => ({
    parts: [{ text: `title: ${chunk.sectionTitle} | text: ${chunk.text}` }],
  }));
}

function writeEmbeddingData(data: SnackyEmbeddingData): void {
  const tempPath = `${OUTPUT_PATH}.tmp`;

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`);
  renameSync(tempPath, OUTPUT_PATH);
}

async function main(): Promise<void> {
  const chunks = readChunks();
  const response = await getGeminiClient().models.embedContent({
    model: MODEL,
    contents: toContents(chunks),
    config: { outputDimensionality: DIMENSION },
  });
  const embeddings = response.embeddings;

  if (!embeddings || embeddings.length !== chunks.length) {
    throw new Error(
      `embedding 수(${embeddings?.length ?? 0})와 chunk 수(${chunks.length})가 다릅니다.`,
    );
  }

  const result = snackyEmbeddingDataSchema.safeParse({
    model: MODEL,
    dimension: DIMENSION,
    createdAt: new Date().toISOString(),
    chunks: chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index].values,
    })),
  });

  if (!result.success) {
    throw new Error(
      `embedding 결과가 올바르지 않습니다: ${z.prettifyError(result.error)}`,
    );
  }

  writeEmbeddingData(result.data);

  console.log(
    `${chunks.length}개 embedding 저장: ${path.relative(process.cwd(), OUTPUT_PATH)}`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
