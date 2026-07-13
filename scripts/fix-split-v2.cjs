const fs = require('fs');
const { execSync } = require('child_process');

const wikiDir = '/Users/linonetwo/Desktop/wiki/private-wiki';
process.chdir(wikiDir);

// Get deleted files from git (clean list without quotes)
const deletedRaw = execSync('git ls-files --deleted', { encoding: 'utf-8' });
const deletedTidFiles = deletedRaw
  .split('\n')
  .filter(f => f.endsWith('.tid'))
  .map(f => f.trim());

console.log(`找到 ${deletedTidFiles.length} 个已删除的 .tid 文件\n`);

const issues = { missingContent: [], missingMeta: [], firstLineLost: [], ok: [] };

for (const tidFile of deletedTidFiles) {
  const baseName = tidFile.replace(/\.tid$/, '');
  const contentFile = baseName;
  const metaFile = baseName + '.meta';

  if (!fs.existsSync(contentFile)) {
    issues.missingContent.push(tidFile);
    continue;
  }
  if (!fs.existsSync(metaFile)) {
    issues.missingMeta.push(tidFile);
    continue;
  }

  // Read original from git using cat-file to avoid shell escaping issues
  let originalContent;
  try {
    // Use git show with the file path from root
    originalContent = execSync(`git show HEAD:./${JSON.stringify(tidFile).slice(1, -1)}`, { 
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });
  } catch (e) {
    // Try alternative approach with the file path directly
    try {
      originalContent = execSync(`git show 'HEAD:${tidFile}'`, { encoding: 'utf-8', maxBuffer: 10*1024*1024 });
    } catch (e2) {
      console.log(`  ⚠️ 无法读取: ${tidFile}`);
      continue;
    }
  }

  // Parse original: split at first blank line
  const lines = originalContent.split('\n');
  const blankIdx = lines.findIndex(l => l.trim() === '');
  if (blankIdx === -1) {
    issues.ok.push(tidFile);
    continue;
  }
  
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
    // First line lost! Prepend it
    const fixedContent = originalFirstLine + '\n' + newContent;
    fs.writeFileSync(contentFile, fixedContent, 'utf-8');
    issues.firstLineLost.push({ 
      tidFile, 
      contentFile
    });
  }
}

console.log(`✅ 正常: ${issues.ok.length}`);
console.log(`🔧 第一行丢失（已修复）: ${issues.firstLineLost.length}`);
for (const item of issues.firstLineLost) {
  console.log(`  ${item.contentFile}`);
}
console.log(`❌ 缺少 content 文件: ${issues.missingContent.length}`);
for (const f of issues.missingContent) console.log(`  ${f}`);
console.log(`❌ 缺少 meta 文件: ${issues.missingMeta.length}`);
for (const f of issues.missingMeta) console.log(`  ${f}`);
