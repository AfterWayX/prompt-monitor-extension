/**
 * Script to copy manifest.json and icons to dist folder
 */

const fs = require('fs');
const path = require('path');

const srcManifest = path.join(__dirname, '../src/manifest.json');
const distManifest = path.join(__dirname, '../dist/manifest.json');
const srcIconsDir = path.join(__dirname, '../src/icons');
const distIconsDir = path.join(__dirname, '../dist/icons');

// Ensure dist directory exists
const distDir = path.dirname(distManifest);
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Ensure dist/icons directory exists
if (!fs.existsSync(distIconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });
}

// Copy manifest.json
fs.copyFileSync(srcManifest, distManifest);
console.log('Manifest copied to dist folder');

// Copy icon files
if (fs.existsSync(srcIconsDir)) {
  const iconFiles = fs.readdirSync(srcIconsDir).filter(file => file.endsWith('.png'));
  iconFiles.forEach(file => {
    const srcFile = path.join(srcIconsDir, file);
    const distFile = path.join(distIconsDir, file);
    fs.copyFileSync(srcFile, distFile);
    console.log(`Copied ${file} to dist/icons/`);
  });
} else {
  console.log('Warning: src/icons directory not found');
}
