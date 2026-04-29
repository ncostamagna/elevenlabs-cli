import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const [folderName, inputFile] = process.argv.slice(2);

if (!folderName || !inputFile) {
  console.error('Usage: npm run text <folder_name> <input_file>');
  console.error('Example: npm run text daily-1 my-file.mp3');
  process.exit(1);
}

const inputPath = path.join('input', inputFile);

if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

const timestamp = new Date()
  .toISOString()
  .replace(/[-T:.Z]/g, '')
  .slice(0, 14);

const outputDir = path.join('output', `${timestamp}-${folderName}`);
fs.mkdirSync(outputDir, { recursive: true });

const ext = path.extname(inputPath);
const inputDest = path.join(outputDir, `input${ext}`);
fs.copyFileSync(inputPath, inputDest);

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

console.log(`Transcribing ${inputFile}...`);

const transcript = await client.speechToText.convert({
  file: fs.createReadStream(inputPath),
  modelId: 'scribe_v2',
});

const outputPath = path.join(outputDir, 'output.txt');
fs.writeFileSync(outputPath, transcript.text);

console.log(`Done.`);
console.log(`  ${inputDest}`);
console.log(`  ${outputPath}`);
