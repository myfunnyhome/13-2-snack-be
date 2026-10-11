import 'dotenv/config';

import { searchChunks } from '../../modules/snacky/snacky.service';

async function main(): Promise<void> {
  const question = process.argv[2];

  if (!question) {
    throw new Error('사용법: npx tsx src/scripts/snacky/search.ts "<질문>"');
  }

  const results = await searchChunks(question);

  results.forEach((result, index) => {
    console.log(
      `${index + 1}. ${result.similarity.toFixed(4)} ${result.id} ${result.sectionTitle}`,
    );
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
