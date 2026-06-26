import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_VOICE_ID = 'CIvegTlxTePhYSiBL1r4';

const args = new Map<string, string>();
for (const arg of process.argv.slice(2)) {
  const match = arg.replace(/^--/, '').match(/^([^=]+)=(.*)$/);
  if (match) {
    args.set(match[1], match[2]);
  }
}

const inputFile = args.get('file');

if (!inputFile) {
  console.error('Usage: npm run audio file=<input_file> [voice=<voice_id>] [name=<name>]');
  console.error('Example: npm run audio file=lala.txt');
  process.exit(1);
}

const voiceId = args.get('voice') || DEFAULT_VOICE_ID;
const folderName = args.get('name') || path.basename(inputFile, path.extname(inputFile));

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

const text = fs.readFileSync(inputPath, 'utf-8');

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

console.log(`Converting text to speech (voice: ${voiceId})...`);

const audio = await client.textToSpeech.convert(voiceId, {
  text,
  modelId: 'eleven_multilingual_v2',
  outputFormat: 'mp3_44100_128',
  voiceSettings: {
    stability: 0.7,
    similarityBoost: 0.75,
    style: 0,
    speed: 1,
    useSpeakerBoost: true,
  },
});

const outputPath = path.join(outputDir, `${folderName}.mp3`);
const chunks: Buffer[] = [];

for await (const chunk of audio) {
  chunks.push(Buffer.from(chunk));
}

fs.writeFileSync(outputPath, Buffer.concat(chunks));

console.log(`Done.`);
console.log(`  ${inputDest}`);
console.log(`  ${outputPath}`);
