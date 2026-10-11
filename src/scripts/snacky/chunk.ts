import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  type SnackyChunk,
  snackyChunkListSchema,
} from '../../modules/snacky/snacky.type';

type Section = {
  title: string;
  lines: string[];
};

const DOCUMENT_ID = 'general';
const SOURCE_PATH = path.join(
  __dirname,
  '../../../snacky/guides',
  `${DOCUMENT_ID}.md`,
);
const OUTPUT_PATH = path.join(
  __dirname,
  '../../../snacky/chunks',
  `${DOCUMENT_ID}.json`,
);

function chunkGuide(markdown: string, documentId: string): SnackyChunk[] {
  const lines = markdown.split('\n');
  const titleLine = lines.find((line) => line.startsWith('# '));

  if (!titleLine) {
    throw new Error('# 제목이 없습니다.');
  }

  const documentTitle = titleLine.slice(2).trim();
  const sections: Section[] = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      sections.push({ title: line.slice(3).trim(), lines: [] });
      continue;
    }
    sections[sections.length - 1]?.lines.push(line);
  }

  return sections.map((section, index) => ({
    id: `${documentId}-${String(index + 1).padStart(3, '0')}`,
    documentId,
    documentTitle,
    sectionTitle: section.title,
    text: section.lines.join('\n').trim(),
  }));
}

function main(): void {
  const markdown = readFileSync(SOURCE_PATH, 'utf8');
  const chunks = chunkGuide(markdown, DOCUMENT_ID);

  snackyChunkListSchema.parse(chunks);

  mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(chunks, null, 2)}\n`);

  console.log(
    `${chunks.length}개 chunk 생성: ${path.relative(process.cwd(), OUTPUT_PATH)}`,
  );
}

main();
