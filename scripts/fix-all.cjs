const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const wikiDir = '/Users/linonetwo/Desktop/wiki/private-wiki';

const deletedResult = spawnSync('git', ['ls-files', '--deleted', '-z'], { cwd: wikiDir, encoding: 'buffer' });
const deletedTidFiles = deletedResult.stdout.toString('utf-8').split('\0').filter(f => f.endsWith('.tid')).filter(Boolean);

let fixed = [];
let skipped = [];
let errors = [];

for (const tidFile of deletedTidFiles) {
  const baseName = tidFile.replace(/\.tid$/, '');
  const metaPath = path.join(wikiDir, baseName + '.meta');
  const contentPath = path.join(wikiDir, baseName);

  // Get original from git
  const gitResult = spawnSync('git', ['show', `HEAD:${tidFile}`], { cwd: wikiDir, encoding: 'utf-8', maxBuffer: 10*1024*1024 });
  if (gitResult.status !== 0) { errors.push(`${tidFile}: git show 失败`); continue; }

  const original = gitResult.stdout;
  const origLines = original.split('\n');
  
  // Find body start: first non-empty line after header that has no colon
  let bodyStartIdx = -1;
  let seenHeader = false;
  for (let i = 0; i < origLines.length; i++) {
    const line = origLines[i];
    if (line.includes(':')) { seenHeader = true; continue; }
    if (seenHeader && line.trim() !== '') { bodyStartIdx = i; break; }
  }
  
  if (bodyStartIdx === -1) { skipped.push(tidFile); continue; }
  
  const origHeaderLines = origLines.slice(0, bodyStartIdx).filter(l => l.trim() && l.includes(':'));
  const origBody = origLines.slice(bodyStartIdx).join('\n');

  // Fix meta file
  if (fs.existsSync(metaPath)) {
    const metaLines = origHeaderLines.map(l => l.trim()).filter(Boolean);
    fs.writeFileSync(metaPath, metaLines.join('\n') + '\n', 'utf-8');
  }

  // Fix content file
  if (fs.existsSync(contentPath)) {
    const newContent = fs.readFileSync(contentPath, 'utf-8');
    if (newContent.trim() !== origBody.trim()) {
      fs.writeFileSync(contentPath, origBody, 'utf-8');
      fixed.push(tidFile);
    } else {
      skipped.push(tidFile);
    }
  } else {
    // Content file doesn't exist, create it
    fs.writeFileSync(contentPath, origBody, 'utf-8');
    fixed.push(tidFile + ' (新建)');
  }
}

console.log(`🔧 已修复: ${fixed.length}`);
for (const f of fixed) console.log(`  ${f}`);
console.log(`✅ 无需修复: ${skipped.length}`);
if (errors.length > 0) {
  console.log(`❌ 错误: ${errors.length}`);
  for (const e of errors) console.log(`  ${e}`);
}
