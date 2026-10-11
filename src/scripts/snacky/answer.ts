import 'dotenv/config';

import { answerQuestion } from '../../modules/snacky/snacky.service';

async function main(): Promise<void> {
  const question = process.argv[2];

  if (!question) {
    throw new Error('사용법: npx tsx src/scripts/snacky/answer.ts "<질문>"');
  }

  console.log(JSON.stringify(await answerQuestion(question), null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
