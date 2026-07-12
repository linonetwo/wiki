const fs = require('fs');
const path = require('path');

// Extension map for common types
const typeToExt = {
  'text/x-markdown': '.md',
  'text/markdown': '.md',
  'application/json': '.json',
  'text/plain': '.txt',
  'text/html': '.html',
  'application/javascript': '.js',
  'text/rtf': '.rtf',
};

const baseDirs = [
  '/Users/linonetwo/Desktop/wiki/private-wiki',
  '/Users/linonetwo/Desktop/wiki/calendar',
];

for (const baseDir of baseDirs) {
  if (!fs.existsSync(baseDir)) continue;
  
  console.log(`\n=== Processing: ${baseDir} ===`);
  const allFiles = fs.readdirSync(baseDir).filter(f => !f.startsWith('.'));
  const tidFiles = allFiles.filter(f => f.endsWith('.tid'));
  
  let split = 0;
  let skipped = 0;

  for (const tidFile of tidFiles) {
    const tidPath = path.join(baseDir, tidFile);
    const content = fs.readFileSync(tidPath, 'utf-8');
    
    // Extract type
    const typeMatch = content.match(/^type:\s*(.+)$/m);
    if (!typeMatch) { skipped++; continue; }
    
    const tiddlerType = typeMatch[1].trim();
    const ext = typeToExt[tiddlerType];
    if (!ext) { skipped++; continue; }
    
    // Parse .tid: header + blank line + body
  // Some .tid files don't have a blank line (e.g., JSON)
  const lines = content.split('\n');
  let blankIdx = lines.findIndex(l => l.trim() === '');
  if (blankIdx === -1) {
    // No blank line: find first non-header line (no ':' after key)
    blankIdx = lines.findIndex(l => !l.includes(':'));
    if (blankIdx === -1) { skipped++; continue; }
  }
    
    const header = lines.slice(0, blankIdx).join('\n');
    const body = lines.slice(blankIdx + 1).join('\n');
    
    // New filename: remove .tid, change extension to match type
    const baseName = tidFile.slice(0, -4); // remove .tid
    
    // Only split if the filename already has the right extension pattern
    // e.g., "foo.json.tid" → "foo.json" + "foo.json.meta"
    // e.g., "foo.md.tid" → "foo.md" + "foo.md.meta"
    const expectedBodyName = baseName; // The body filename is the same as tidFile minus .tid
    const bodyPath = path.join(baseDir, expectedBodyName);
    const metaPath = path.join(baseDir, expectedBodyName + '.meta');
    
    // Only proceed if the body file doesn't already exist (avoid conflicts)
    if (fs.existsSync(bodyPath) || fs.existsSync(metaPath)) {
      console.log(`  SKIP (conflict): ${tidFile}`);
      skipped++;
      continue;
    }
    
    // Write body file
    fs.writeFileSync(bodyPath, body);
    // Write meta file (header only)
    fs.writeFileSync(metaPath, header);
    // Remove original .tid
    fs.unlinkSync(tidPath);
    
    split++;
    console.log(`  SPLIT: ${tidFile} → ${expectedBodyName} + .meta`);
  }
  
  console.log(`  Split: ${split}, Skipped: ${skipped}`);
}

console.log('\n=== Done ===');
