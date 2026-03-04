/**
 * Generate all app icon and splash screen sizes for iOS and Android.
 * Run: node scripts/generate-icons.mjs
 * Requires: sharp (npm install --save-dev sharp)
 */

import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RESOURCES = join(ROOT, 'resources');

// iOS icon sizes (points × scale)
const IOS_ICONS = [
  { name: 'AppIcon-20@1x.png', size: 20 },
  { name: 'AppIcon-20@2x.png', size: 40 },
  { name: 'AppIcon-20@3x.png', size: 60 },
  { name: 'AppIcon-29@1x.png', size: 29 },
  { name: 'AppIcon-29@2x.png', size: 58 },
  { name: 'AppIcon-29@3x.png', size: 87 },
  { name: 'AppIcon-40@1x.png', size: 40 },
  { name: 'AppIcon-40@2x.png', size: 80 },
  { name: 'AppIcon-40@3x.png', size: 120 },
  { name: 'AppIcon-60@2x.png', size: 120 },
  { name: 'AppIcon-60@3x.png', size: 180 },
  { name: 'AppIcon-76@1x.png', size: 76 },
  { name: 'AppIcon-76@2x.png', size: 152 },
  { name: 'AppIcon-83.5@2x.png', size: 167 },
  { name: 'AppIcon-512@2x.png', size: 1024 },
];

// Android icon sizes
const ANDROID_ICONS = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

// Android adaptive icon sizes (foreground/background are 108dp with padding)
const ANDROID_ADAPTIVE = [
  { folder: 'mipmap-mdpi', size: 108 },
  { folder: 'mipmap-hdpi', size: 162 },
  { folder: 'mipmap-xhdpi', size: 216 },
  { folder: 'mipmap-xxhdpi', size: 324 },
  { folder: 'mipmap-xxxhdpi', size: 432 },
];

// Splash screen sizes
const SPLASH_SIZES = [
  { name: 'splash-2732x2732.png', width: 2732, height: 2732 },
  { name: 'splash-1284x2778.png', width: 1284, height: 2778 },
  { name: 'splash-1170x2532.png', width: 1170, height: 2532 },
  { name: 'splash-1125x2436.png', width: 1125, height: 2436 },
  { name: 'splash-1242x2688.png', width: 1242, height: 2688 },
  { name: 'splash-828x1792.png', width: 828, height: 1792 },
  { name: 'splash-750x1334.png', width: 750, height: 1334 },
  { name: 'splash-640x1136.png', width: 640, height: 1136 },
  { name: 'splash-1080x1920.png', width: 1080, height: 1920 },
  { name: 'splash-480x800.png', width: 480, height: 800 },
];

function ensureDir(dir) {
  mkdirSync(dir, { recursive: true });
}

async function generateIcons() {
  const iconSvg = readFileSync(join(RESOURCES, 'icon', 'icon-source.svg'));
  const fgSvg = readFileSync(join(RESOURCES, 'icon', 'icon-foreground.svg'));

  // iOS icons
  const iosDir = join(RESOURCES, 'ios');
  ensureDir(iosDir);
  for (const { name, size } of IOS_ICONS) {
    await sharp(iconSvg).resize(size, size).png().toFile(join(iosDir, name));
    console.log(`  iOS: ${name} (${size}x${size})`);
  }

  // Android legacy icons
  for (const { folder, size } of ANDROID_ICONS) {
    const dir = join(RESOURCES, 'android', folder);
    ensureDir(dir);
    await sharp(iconSvg).resize(size, size).png().toFile(join(dir, 'ic_launcher.png'));
    await sharp(iconSvg).resize(size, size).png().toFile(join(dir, 'ic_launcher_round.png'));
    console.log(`  Android: ${folder}/ic_launcher.png (${size}x${size})`);
  }

  // Android adaptive icon layers
  for (const { folder, size } of ANDROID_ADAPTIVE) {
    const dir = join(RESOURCES, 'android', folder);
    ensureDir(dir);

    // Foreground
    await sharp(fgSvg).resize(size, size).png().toFile(join(dir, 'ic_launcher_foreground.png'));

    // Background (solid dark color)
    await sharp({
      create: { width: size, height: size, channels: 4, background: { r: 10, g: 14, b: 23, alpha: 1 } },
    }).png().toFile(join(dir, 'ic_launcher_background.png'));

    console.log(`  Android adaptive: ${folder} (${size}x${size})`);
  }

  // Play Store high-res icon
  const playDir = join(RESOURCES, 'android', 'playstore');
  ensureDir(playDir);
  await sharp(iconSvg).resize(512, 512).png().toFile(join(playDir, 'icon.png'));
  console.log('  Android: playstore/icon.png (512x512)');
}

async function generateSplashScreens() {
  const splashSvg = readFileSync(join(RESOURCES, 'splash', 'splash-source.svg'));
  const outputDir = join(RESOURCES, 'splash');
  ensureDir(outputDir);

  for (const { name, width, height } of SPLASH_SIZES) {
    // Resize to the larger dimension, then crop to exact size
    await sharp(splashSvg)
      .resize(width, height, { fit: 'cover', position: 'center' })
      .png()
      .toFile(join(outputDir, name));
    console.log(`  Splash: ${name} (${width}x${height})`);
  }
}

async function main() {
  console.log('Generating app icons...');
  await generateIcons();
  console.log('\nGenerating splash screens...');
  await generateSplashScreens();
  console.log('\nDone! Assets in resources/');
}

main().catch(console.error);
