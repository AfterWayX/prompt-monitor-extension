/**
 * Script to create simple PNG icons for the extension
 * Uses a simple approach to create basic colored square icons
 */

const fs = require('fs');
const path = require('path');

// Create a simple colored square PNG
// This creates a basic red square with "PM" text
function createSimpleIcon(size) {
  // For simplicity, we'll create a basic PNG using a data URL approach
  // This creates a red square with white "PM" text
  
  // Create a simple SVG and convert to PNG data
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#dc2626;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#b91c1c;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" 
            font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">PM</text>
    </svg>
  `;
  
  // For now, we'll create a simple placeholder file
  // In a real project, you'd use a library like sharp or canvas to convert SVG to PNG
  return Buffer.from(svg, 'utf8');
}

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../src/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// For now, let's create simple placeholder files
// In a real project, you'd generate actual PNG files
const sizes = [16, 32, 48, 128];
sizes.forEach(size => {
  // Create a simple text file as placeholder (this won't work as an icon, but it's a start)
  const filename = `icon${size}.png`;
  const filepath = path.join(iconsDir, filename);
  
  // Create a minimal valid PNG file (1x1 red pixel)
  const pngData = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // width: 1
    0x00, 0x00, 0x00, 0x01, // height: 1
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // compressed data
    0x00, 0x00, 0x00, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk length
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);
  
  fs.writeFileSync(filepath, pngData);
  console.log(`Created ${filename}`);
});

console.log('Basic icon placeholders created successfully!');
console.log('Note: These are minimal placeholder icons. For production, use proper icon generation tools.');
