const fs = require('fs');
const { spawnSync } = require('child_process');

const wikiDir = '/Users/linonetwo/Desktop/wiki/private-wiki';

// Get deleted files from git
const deletedResult = spawnSync('git', ['ls-files', '--deleted'], { 
  cwd: wikiDir, encoding: 'utf-8', maxBuffer: 10*1024*1024 
});
const deletedTidFiles = deletedResult.stdout
  .split('\n')
  .filter(f => f.endsWith('.tid'))
  .map(f => f.trim())
  .filter(Boolean);

console.log(`找到 ${deletedTidFiles.length} 个已删除的 .tid 文件\n`);

const fixed = [];
const ok = [];
const errors = [];

for (const tidFile of deletedTidFiles) {
  const baseName = tidFile.replace(/\.tid$/, '');
  const contentFile = baseName;
  const metaFile = baseName + '.meta';

  const contentPath = `${wikiDir}/${contentFile}`;
  const metaPath = `${wikiDir}/${metaFile}`;

  if (!fs.existsSync(contentPath)) {
    errors.push({ file: tidFile, reason: '缺少 content 文件' });
    continue;
  }
  if (!fs.existsSync(metaPath)) {
    errors.push({ file: tidFile, reason: '缺少 meta 文件' });
    continue;
  }

  // Get original from git using spawnSync (no shell quoting issues)
  const gitResult = spawnSync('git', ['show', `HEAD:${tidFile}`], {
    cwd: wikiDir, encoding: 'utf-8', maxBuffer: 10*1024*1024
  });
  
  if (gitResult.status !== 0) {
    errors.push({ file: tidFile, reason: `git show 失败: ${gitResult.stderr.trim()}` });
    continue;
  }

  const originalContent = gitResult.stdout;
  const lines = originalContent.split('\n');
  const blankIdx = lines.findIndex(l => l.trim() === '');
  
  if (blankIdx === -1) {
    ok.push(tidFile);
    continue;
  }
  
  const originalFirstLine = lines[blankIdx + 1] || '';
  if (!originalFirstLine) {
    ok.push(tidFile);
    continue;
  }

  // Read new content file
  const newContent = fs.readFileSync(contentPath, 'utf-8');
  const newFirstLine = newContent.split('\n')[0];

  if (newFirstLine === originalFirstLine) {
    ok.push(tidFile);
  } else {
    // Fix: prepend the missing first line
    const fixedContent = originalFirstLine + '\n' + newContent;
    fs.writeFileSync(contentPath, fixedContent, 'utf-8');
    fixed.push({ tidFile, contentFile });
  }
}

console.log(`✅ 正常: ${ok.length}`);
console.log(`🔧 第一行丢失（已修复）: ${fixed.length}`);
for (const item of fixed) console.log(`  ${item.contentFile}`);
console.log(`❌ 错误: ${errors.length}`);
for (const e of errors) console.log(`  ${e.file}: ${e.reason}`);
