const fs = require('fs');
const path = require('path');

const baseDirs = [
  '/Users/linonetwo/Desktop/wiki/private-wiki',
  '/Users/linonetwo/Desktop/wiki/calendar',
];

// Binary types (encoding === "base64") from TiddlyWiki5 boot.js
const base64Types = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'image/heic', 'image/heif', 'image/avif',
  'image/vnd.microsoft.icon', 'image/x-icon',
  'application/wasm',
  'font/woff', 'font/woff2', 'font/ttf', 'font/otf',
  'audio/ogg', 'audio/mp4', 'audio/mp3', 'audio/mpeg',
  'video/ogg', 'video/webm', 'video/mp4',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/excel', 'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/mspowerpoint',
  'application/epub+zip',
  'application/octet-stream',
  'application/pdf',
]);

// Extension → MIME type
const extToMime = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.m4a': 'audio/mp4',
  '.webm': 'video/webm', '.ogv': 'video/ogg',
  '.mp3': 'audio/mpeg',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.doc': 'application/msword',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.ppt': 'application/mspowerpoint',
  '.epub': 'application/epub+zip',
  '.pdf': 'application/pdf',
  '.json': 'application/json',
  '.jks': 'application/octet-stream',
  '.p12': 'application/octet-stream',
  '.tldr': 'text/plain',
};

function getMimeType(filename) {
  const lower = filename.toLowerCase();
  for (const [ext, mime] of Object.entries(extToMime)) {
    if (lower.endsWith(ext)) return mime;
  }
  // Default: text
  return 'text/plain';
}

function isBase64Type(mimeType) {
  return base64Types.has(mimeType);
}

for (const baseDir of baseDirs) {
  if (!fs.existsSync(baseDir)) continue;

  const filesDir = path.join(baseDir, 'files');
  if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });

  console.log(`\n=== Fixing remaining in: ${baseDir} ===`);

  const allFiles = fs.readdirSync(baseDir).filter(f => !f.startsWith('.'));
  
  // Find .meta files that still need fixing
  const metaFiles = allFiles.filter(f => f.endsWith('.meta'));
  
  let fixed = 0;
  let skipped = 0;

  for (const metaFile of metaFiles) {
    const metaPath = path.join(baseDir, metaFile);
    const baseName = metaFile.slice(0, -5); // Remove .meta
    const tidPath = path.join(baseDir, baseName + '.tid');
    
    // Skip if already converted
    if (fs.existsSync(tidPath)) {
      fs.unlinkSync(metaPath);
      fixed++;
      continue;
    }

    // Check if the body file exists
    const bodyPath = path.join(baseDir, baseName);
    if (!fs.existsSync(bodyPath)) {
      console.log(`  ORPHAN: ${metaFile} (no body file)`);
      skipped++;
      continue;
    }

    const mimeType = getMimeType(baseName);
    const isBinary = isBase64Type(mimeType);
    
    // Read meta
    const metaContent = fs.readFileSync(metaPath, 'utf-8');
    
    if (isBinary) {
      // Binary: move to files/, create .tid with _canonical_uri
      const destPath = path.join(filesDir, baseName);
      fs.copyFileSync(bodyPath, destPath);
      fs.unlinkSync(bodyPath);
      
      const canonicalLine = `_canonical_uri: files/${baseName}`;
      const tidContent = canonicalLine + '\n' + metaContent;
      fs.writeFileSync(tidPath, tidContent);
      fs.unlinkSync(metaPath);
    } else {
      // Text: read body, create .tid, remove both
      let bodyContent;
      try {
        bodyContent = fs.readFileSync(bodyPath, 'utf-8');
      } catch (e) {
        // Try latin1 for binary-ish text
        bodyContent = fs.readFileSync(bodyPath, 'latin1');
      }
      
      // Ensure type is in meta
      let finalMeta = metaContent;
      if (!/^type:/m.test(finalMeta)) {
        finalMeta = `type: ${mimeType}\n` + finalMeta;
      }
      if (!/^title:/m.test(finalMeta)) {
        finalMeta = `title: ${baseName}\n` + finalMeta;
      }
      
      const tidContent = finalMeta + '\n' + bodyContent;
      fs.writeFileSync(tidPath, tidContent);
      fs.unlinkSync(metaPath);
      fs.unlinkSync(bodyPath);
    }
    
    fixed++;
  }

  console.log(`  Fixed: ${fixed}, Skipped: ${skipped}`);
}

console.log('\n=== Done ===');
