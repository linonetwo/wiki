const fs = require('fs');
const path = require('path');

const baseDirs = [
  '/Users/linonetwo/Desktop/wiki/private-wiki',
  '/Users/linonetwo/Desktop/wiki/calendar',
];

// Binary types from TiddlyWiki5 boot.js (encoding === "base64")
const binaryExtMap = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic', '.heif': 'image/heif',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4', '.m4a': 'audio/mp4',
  '.webm': 'video/webm', '.ogm': 'video/ogg', '.ogv': 'video/ogg', '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wasm': 'application/wasm',
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
  '.octet-stream': 'application/octet-stream',
};

function isBinaryExt(filename) {
  const lower = filename.toLowerCase();
  for (const ext of Object.keys(binaryExtMap)) {
    if (lower.endsWith(ext)) return true;
  }
  return false;
}

function getMimeType(filename) {
  const lower = filename.toLowerCase();
  for (const [ext, mime] of Object.entries(binaryExtMap)) {
    if (lower.endsWith(ext)) return mime;
  }
  return 'application/octet-stream';
}

function isBinaryMeta(metaFile) {
  // Remove .meta suffix to get the base filename
  const base = metaFile.slice(0, -5);
  return isBinaryExt(base);
}

for (const baseDir of baseDirs) {
  if (!fs.existsSync(baseDir)) {
    console.log(`Directory not found: ${baseDir}`);
    continue;
  }

  const filesDir = path.join(baseDir, 'files');
  console.log(`\n=== Processing: ${baseDir} ===`);

  const allFiles = fs.readdirSync(baseDir);
  const metaFiles = allFiles.filter(f => f.endsWith('.meta') && !f.startsWith('.'));
  
  let converted = 0;
  let skipped = 0;
  let needsFix = 0;
  let cleaned = 0;

  for (const metaFile of metaFiles) {
    const metaPath = path.join(baseDir, metaFile);
    const baseName = metaFile.slice(0, -5); // Remove .meta
    const tidPath = path.join(baseDir, baseName + '.tid');
    
    // Read meta content
    const metaContent = fs.readFileSync(metaPath, 'utf-8');
    
    // Check if it already has _canonical_uri
    const hasCanonicalUri = /^_canonical_uri:/m.test(metaContent);
    
    if (hasCanonicalUri) {
      // Already migrated - just rename .meta to .tid
      if (fs.existsSync(tidPath)) {
        // .tid already exists, remove duplicate .meta
        fs.unlinkSync(metaPath);
        cleaned++;
      } else {
        fs.writeFileSync(tidPath, metaContent);
        fs.unlinkSync(metaPath);
        converted++;
      }
    } else {
      // No _canonical_uri - need to check if binary exists in files/
      let foundInFiles = false;
      if (fs.existsSync(filesDir)) {
        const files = fs.readdirSync(filesDir);
        // Try to match by filename
        if (files.includes(baseName)) {
          foundInFiles = true;
        } else {
          // Try partial match (some filenames might differ slightly)
          for (const f of files) {
            if (f === baseName || f.startsWith(baseName)) {
              foundInFiles = true;
              break;
            }
          }
        }
      }
      
      if (foundInFiles) {
        // Add _canonical_uri and convert to .tid
        const lines = metaContent.split('\n');
        // Find title field
        const titleMatch = metaContent.match(/^title:\s*(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : baseName;
        
        const canonicalUri = `_canonical_uri: files/${baseName}`;
        const newContent = canonicalUri + '\n' + metaContent;
        
        fs.writeFileSync(tidPath, newContent);
        fs.unlinkSync(metaPath);
        converted++;
      } else {
        // Binary not found in files/ - check if binary exists in root
        if (fs.existsSync(path.join(baseDir, baseName))) {
          // Binary still in root, need to move it
          console.log(`  NEED FIX (binary in root): ${metaFile}`);
          needsFix++;
        } else {
          // Orphan meta file
          console.log(`  ORPHAN: ${metaFile} (no binary found)`);
          skipped++;
        }
      }
    }
  }

  // Also: clean up orphan binary files that have corresponding .tid with _canonical_uri
  // (i.e., remove duplicate binary files already in files/)
  let dupesRemoved = 0;
  for (const f of allFiles) {
    if (f.endsWith('.meta') || f.endsWith('.tid') || f.startsWith('.') || f.startsWith('$')) continue;
    if (f === 'files' || f === '.git') continue;
    
    const stat = fs.statSync(path.join(baseDir, f));
    if (stat.isDirectory()) continue;
    
    if (!isBinaryExt(f)) continue;
    
    // Check if corresponding .tid exists with _canonical_uri
    const tidName = f + '.tid';
    if (allFiles.includes(tidName)) {
      const tidContent = fs.readFileSync(path.join(baseDir, tidName), 'utf-8');
      if (/_canonical_uri:/m.test(tidContent)) {
        // Binary file already externalized, safe to remove
        fs.unlinkSync(path.join(baseDir, f));
        dupesRemoved++;
      }
    }
  }

  console.log(`  Converted .meta → .tid: ${converted}`);
  console.log(`  Cleaned duplicate .meta: ${cleaned}`);
  console.log(`  Skipped (orphan): ${skipped}`);
  console.log(`  Needs manual fix: ${needsFix}`);
  console.log(`  Removed duplicate binaries: ${dupesRemoved}`);
}

console.log('\n=== Done ===');
