const fs = require('fs');
const path = require('path');

const wikiDir = '/Users/linonetwo/Desktop/wiki/private-wiki';
const filesDir = path.join(wikiDir, 'files');
const rootFiles = fs.readdirSync(wikiDir).filter(f => f.endsWith('.tid'));

let fixedByFlatten = 0;
let stillBroken = [];

for (const f of rootFiles) {
  const filePath = path.join(wikiDir, f);
  const content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^_canonical_uri:\s*(.+)$/m);
  if (!match) continue;
  
  const uri = match[1].trim();
  const targetFile = uri.startsWith('files/') ? uri.slice(6) : uri;
  const fullPath = path.join(filesDir, targetFile);
  
  if (!fs.existsSync(fullPath)) {
    // Try with / replaced by _
    const flatTarget = targetFile.replace(/\//g, '_');
    const flatPath = path.join(filesDir, flatTarget);
    if (fs.existsSync(flatPath)) {
      const newUri = 'files/' + flatTarget;
      const newContent = content.replace(match[0], '_canonical_uri: ' + newUri);
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log('FIXED (flat):', f);
      fixedByFlatten++;
    } else {
      stillBroken.push({ file: f, uri, targetFile });
    }
  }
}

console.log('\nFlattened:', fixedByFlatten);
console.log('Still broken:', stillBroken.length);
stillBroken.forEach(b => console.log('  ' + b.file));
