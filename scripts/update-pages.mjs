import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the TypeScript script
const scriptPath = resolve(__dirname, '../src/scripts/updatePageCounts.ts');

// Run the script with ts-node-esm
const child = spawn('node', [
  '--loader',
  'ts-node/esm',
  '--experimental-specifier-resolution=node',
  scriptPath
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TS_NODE_PROJECT: resolve(__dirname, '../tsconfig.scripts.json')
  }
});

child.on('error', (error) => {
  console.error('Failed to start script:', error);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
}); 