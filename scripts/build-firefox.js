/**
 * Build script for Firefox compatibility
 * 
 * This script handles the differences between Chrome and Firefox extension manifests:
 * - Uses Manifest V2 for Firefox compatibility
 * - Changes 'action' to 'browser_action'
 * - Uses 'scripts' array instead of 'service_worker'
 * - Sets 'persistent: false' for background script
 */

const fs = require('fs');
const path = require('path');

const srcManifest = path.join(__dirname, '../src/manifest-firefox.json');
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

// Copy Firefox manifest
fs.copyFileSync(srcManifest, distManifest);
console.log('Firefox manifest copied to dist folder');

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

console.log('Firefox build completed successfully!');
