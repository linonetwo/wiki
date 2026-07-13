const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const wikiDir = '/Users/linonetwo/Desktop/wiki/private-wiki';
process.chdir(wikiDir);

// Get list of deleted .tid files from git status
const statusOutput = execSync('git status --short', { encoding: 'utf-8' });
const deletedFiles = statusOutput
  .split('\n')
  .filter(line => line.startsWith(' D') && line.endsWith('.tid'))
  .map(line => line.slice(3).trim());

console.log(`找到 ${deletedFiles.length} 个被删除的 .tid 文件\n`);

const issues = { missingContent: [], missingMeta: [], firstLineLost: [], ok: [] };

for (const tidFile of deletedFiles) {
  const baseName = tidFile.replace(/\.tid$/, '');
  const contentFile = baseName; // e.g., "xxx.json" or "xxx.md"
  const metaFile = baseName + '.meta';

  // Check if new files exist
  const contentExists = fs.existsSync(contentFile);
  const metaExists = fs.existsSync(metaFile);
  
  if (!contentExists) {
    issues.missingContent.push(tidFile);
    continue;
  }
  if (!metaExists) {
    issues.missingMeta.push(tidFile);
    continue;
  }

  // Get original .tid content from git
  let originalContent;
  try {
    originalContent = execSync(`git show HEAD:'${tidFile}'`, { encoding: 'utf-8' });
  } catch (e) {
    console.log(`  ⚠️ 无法从 git 读取: ${tidFile}`);
    continue;
  }

  // Parse original: split at first blank line
  const lines = originalContent.split('\n');
  const blankIdx = lines.findIndex(l => l.trim() === '');
  if (blankIdx === -1) {
    // No blank line - entire file is header, no body
    issues.ok.push(tidFile);
    continue;
  }
  
  const originalBody = lines.slice(blankIdx + 1).join('\n');
  const originalFirstLine = lines[blankIdx + 1] || '';
  
  if (!originalFirstLine) {
    issues.ok.push(tidFile);
    continue;
  }

  // Read new content file
  const newContent = fs.readFileSync(contentFile, 'utf-8');
  const newFirstLine = newContent.split('\n')[0];

  // Check if first line matches
  if (newFirstLine === originalFirstLine) {
    issues.ok.push(tidFile);
  } else {
    // First line lost! Need to prepend it
    const fixedContent = originalFirstLine + '\n' + newContent;
    fs.writeFileSync(contentFile, fixedContent, 'utf-8');
    issues.firstLineLost.push({ 
      tidFile, 
      contentFile, 
      lostLine: originalFirstLine.substring(0, 60) + (originalFirstLine.length > 60 ? '...' : ''),
      newFirstLine: newFirstLine.substring(0, 60)
    });
  }
}

console.log(`✅ 正常: ${issues.ok.length}`);
console.log(`❌ 第一行丢失（已修复）: ${issues.firstLineLost.length}`);
for (const item of issues.firstLineLost) {
  console.log(`  ${item.contentFile}`);
  console.log(`    丢失: "${item.lostLine}"`);
  console.log(`    现有: "${item.newFirstLine}"`);
}
console.log(`❌ 缺少 content 文件: ${issues.missingContent.length}`);
for (const f of issues.missingContent) console.log(`  ${f}`);
console.log(`❌ 缺少 meta 文件: ${issues.missingMeta.length}`);
for (const f of issues.missingMeta) console.log(`  ${f}`);
