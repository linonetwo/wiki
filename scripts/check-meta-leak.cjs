const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const wikiDir = '/Users/linonetwo/Desktop/wiki/private-wiki';

const deletedResult = spawnSync('git', ['ls-files', '--deleted', '-z'], { cwd: wikiDir, encoding: 'buffer' });
const deletedTidFiles = deletedResult.stdout.toString('utf-8').split('\0').filter(f => f.endsWith('.tid')).filter(Boolean);

let brokenMeta = [];
let okMeta = [];

for (const tidFile of deletedTidFiles) {
  const baseName = tidFile.replace(/\.tid$/, '');
  const metaPath = path.join(wikiDir, baseName + '.meta');
  const contentPath = path.join(wikiDir, baseName);
  
  if (!fs.existsSync(metaPath)) continue;
  
  const metaContent = fs.readFileSync(metaPath, 'utf-8');
  const metaLines = metaContent.split('\n');
  
  // Separate valid header lines (key: value) from bad lines (no colon)
  const validLines = [];
  const badLines = [];
  for (const line of metaLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.includes(':')) {
      validLines.push(line);
    } else {
      badLines.push(trimmed);
    }
  }
  
  if (badLines.length > 0) {
    brokenMeta.push({ tidFile, metaFile: baseName + '.meta', contentFile: baseName, badLines, validLines, metaPath, contentPath });
  } else {
    okMeta.push(tidFile);
  }
}

console.log(`Meta 泄漏 body 内容: ${brokenMeta.length}`);
console.log(`Meta 正常: ${okMeta.length}\n`);

if (brokenMeta.length > 0) {
  console.log('=== 详细 ===');
  for (const item of brokenMeta) {
    console.log(`\n文件: ${item.tidFile}`);
    console.log(`  泄漏到 meta 的行 (${item.badLines.length}):`);
    for (const line of item.badLines) {
      console.log(`    "${line.substring(0, 80)}${line.length > 80 ? '...' : ''}"`);
    }
    
    // Show what the content file currently starts with
    if (fs.existsSync(item.contentPath)) {
      const contentFirstLine = fs.readFileSync(item.contentPath, 'utf-8').split('\n')[0];
      console.log(`  内容文件第一行: "${contentFirstLine.substring(0, 80)}${contentFirstLine.length > 80 ? '...' : ''}"`);
    }
  }
}
