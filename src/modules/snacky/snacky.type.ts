import { z } from 'zod';

const nonEmptyString = z.string().min(1);

const snackyChunkSchema = z.object({
  id: nonEmptyString,
  documentId: nonEmptyString,
  documentTitle: nonEmptyString,
  sectionTitle: nonEmptyString,
  text: nonEmptyString,
});

function hasUniqueIds(chunks: { id: string }[]): boolean {
  return new Set(chunks.map((chunk) => chunk.id)).size === chunks.length;
}

function vectorSchema(dimension: number) {
  return z
    .array(z.number())
    .length(dimension)
    .refine((vector) => vector.some((value) => value !== 0), '영벡터입니다.');
}

export const snackyChunkListSchema = z
  .array(snackyChunkSchema)
  .min(1)
  .refine(hasUniqueIds, 'chunk id가 중복됩니다.');

export const snackyEmbeddingDataSchema = z
  .object({
    model: nonEmptyString,
    dimension: z.number().int().positive(),
    createdAt: nonEmptyString,
    chunks: z
      .array(snackyChunkSchema.extend({ embedding: z.array(z.number()) }))
      .min(1)
      .refine(hasUniqueIds, 'chunk id가 중복됩니다.'),
  })
  .superRefine((data, ctx) => {
    data.chunks.forEach((chunk, index) => {
      const result = vectorSchema(data.dimension).safeParse(chunk.embedding);
      if (!result.success) {
        ctx.addIssue({
          code: 'custom',
          message: `${chunk.id}: ${z.prettifyError(result.error)}`,
          path: ['chunks', index, 'embedding'],
        });
      }
    });
  });

export function parseVector(
  values: unknown,
  dimension: number,
  label: string,
): number[] {
  const result = vectorSchema(dimension).safeParse(values);

  if (!result.success) {
    throw new Error(`${label}: ${z.prettifyError(result.error)}`);
  }

  return result.data;
}

export const snackyAnswerSchema = z.object({
  answer: nonEmptyString,
});

export type SnackyChunk = z.infer<typeof snackyChunkSchema>;

export type SnackyEmbeddingData = z.infer<typeof snackyEmbeddingDataSchema>;

export type SnackySearchResult = SnackyChunk & {
  similarity: number;
};

export type SnackySource = {
  documentId: string;
  section: string;
};

export type SnackyAnswer = {
  answer: string;
  sources: SnackySource[];
};
