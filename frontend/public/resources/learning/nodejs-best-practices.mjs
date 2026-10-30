// Kini learning library: asynchronous file processing example.
// Run: node nodejs-best-practices.mjs ./notes.txt
// Reference: https://nodejs.org/learn/asynchronous-work/dont-block-the-event-loop
// Keep request handlers short. Large CPU jobs can still block even in async functions.
// Process large files incrementally rather than loading everything into memory.
// Handle errors explicitly and keep sensitive data out of logs.
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

async function countLines(filePath) {
  const input = createReadStream(filePath, { encoding: 'utf8' });
  const lines = createInterface({ input, crlfDelay: Infinity });
  // Forward file read errors so the async loop can handle them.
  let readError;
  input.on('error', error => { readError = error; lines.close(); });
  let count = 0;
  try {
    for await (const _line of lines) count += 1;
    if (readError) throw readError;
    return count;
  } finally {
    lines.close();
    input.destroy();
  }
}
const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node nodejs-best-practices.mjs <text-file>');
  process.exitCode = 1;
} else {
  try { console.log('Lines:', await countLines(filePath)); }
  catch { console.error('Unable to read the file. Check its path and permissions.'); process.exitCode = 1; }
}
