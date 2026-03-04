/**
 * Generate Google Play feature graphic (1024x500) from SVG source.
 * Run: node scripts/generate-feature-graphic.mjs
 * Requires: sharp (npm install --save-dev sharp)
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INPUT = join(ROOT, 'resources', 'feature-graphic-source.svg');
const OUTPUT = join(ROOT, 'store-listing', 'google', 'feature-graphic.png');

async function main() {
  const svg = readFileSync(INPUT);

  await sharp(svg)
    .resize(1024, 500)
    .png()
    .toFile(OUTPUT);

  console.log(`Feature graphic generated: ${OUTPUT}`);
  console.log('Dimensions: 1024 x 500 px');
}

main().catch(console.error);
