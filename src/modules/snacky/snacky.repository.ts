import { readFileSync } from 'node:fs';
import path from 'node:path';

import { z } from 'zod';

import {
  type SnackyEmbeddingData,
  snackyEmbeddingDataSchema,
} from './snacky.type';

const EMBEDDING_DATA_PATH = path.join(
  __dirname,
  '../../../snacky/embeddings/general.json',
);

let embeddingData: SnackyEmbeddingData | null = null;

export function getEmbeddingData(): SnackyEmbeddingData {
  if (embeddingData) return embeddingData;

  const result = snackyEmbeddingDataSchema.safeParse(
    JSON.parse(readFileSync(EMBEDDING_DATA_PATH, 'utf8')),
  );

  if (!result.success) {
    throw new Error(
      `Snacky embedding 데이터가 올바르지 않습니다: ${z.prettifyError(result.error)}`,
    );
  }

  embeddingData = result.data;

  return embeddingData;
}
