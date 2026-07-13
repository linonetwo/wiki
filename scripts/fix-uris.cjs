const fs = require('fs');
const path = require('path');

const wikiDir = '/Users/linonetwo/Desktop/wiki/private-wiki';

// Fix 1: URL-encoded _canonical_uri -> decoded
const rootFiles = fs.readdirSync(wikiDir).filter(f => f.endsWith('.tid'));
let fixedUris = 0;

for (const f of rootFiles) {
  const filePath = path.join(wikiDir, f);
  let content = fs.readFileSync(filePath, 'utf-8');
  const match = content.match(/^_canonical_uri:\s*(.+)$/m);
  if (!match) continue;
  
  const uri = match[1].trim();
  if (!uri.includes('%')) continue;
  
  // Decode the URI (handle potential malformed encoding)
  let decoded = uri;
  try {
    decoded = decodeURIComponent(uri);
  } catch (e) {
    console.log(`  ⚠️ URI 解码失败，跳过: ${f}`);
    continue;
  }
  if (decoded === uri) continue; // no change needed
  
  console.log(`修复 URI: ${f}`);
  console.log(`  旧: ${uri.substring(0, 100)}...`);
  console.log(`  新: ${decoded.substring(0, 100)}...`);
  
  content = content.replace(match[0], `_canonical_uri: ${decoded}`);
  fs.writeFileSync(filePath, content, 'utf-8');
  fixedUris++;
}

console.log(`\n修复了 ${fixedUris} 个 URL 编码的 _canonical_uri`);

// Fix 2: Orphan .meta files with missing content
const metaFiles = fs.readdirSync(wikiDir).filter(f => f.endsWith('.meta'));
for (const metaFile of metaFiles) {
  const contentFile = metaFile.replace(/\.meta$/, '');
  if (fs.existsSync(path.join(wikiDir, contentFile))) continue;
  
  // Check if the original .tid exists in git
  console.log(`\n孤儿 .meta: ${metaFile} (缺少 ${contentFile})`);
  
  // Check files/ for the actual file
  const filesDir = path.join(wikiDir, 'files');
  const filesContents = fs.readdirSync(filesDir);
  const matchingFile = filesContents.find(f => contentFile.includes(path.basename(f, path.extname(f))) || f.includes(path.basename(contentFile)));
  if (matchingFile) {
    console.log(`  在 files/ 中找到: ${matchingFile}`);
  } else {
    console.log(`  未在 files/ 中找到对应文件 - 可能需要手动处理`);
  }
}
