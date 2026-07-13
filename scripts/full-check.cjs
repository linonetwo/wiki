const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const wikiDir = '/Users/linonetwo/Desktop/wiki/private-wiki';

const deletedResult = spawnSync('git', ['ls-files', '--deleted', '-z'], { cwd: wikiDir, encoding: 'buffer' });
const deletedTidFiles = deletedResult.stdout.toString('utf-8').split('\0').filter(f => f.endsWith('.tid')).filter(Boolean);

console.log(`检查 ${deletedTidFiles.length} 个文件...\n`);

const issues = []; // { tidFile, metaIssue, contentIssue }

for (const tidFile of deletedTidFiles) {
  const baseName = tidFile.replace(/\.tid$/, '');
  const metaPath = path.join(wikiDir, baseName + '.meta');
  const contentPath = path.join(wikiDir, baseName);

  // Get original from git
  const gitResult = spawnSync('git', ['show', `HEAD:${tidFile}`], { cwd: wikiDir, encoding: 'utf-8', maxBuffer: 10*1024*1024 });
  if (gitResult.status !== 0) { console.log(`SKIP: ${tidFile}`); continue; }

  const original = gitResult.stdout;
  const origLines = original.split('\n');
  
  // Find where body starts: first line without 'key: value' pattern, after header
  let bodyStartIdx = -1;
  for (let i = 0; i < origLines.length; i++) {
    const line = origLines[i];
    // Skip empty lines at start
    if (i === 0 && line.trim() === '') continue;
    // If line has no colon, and we've seen at least one header line, this is body
    if (!line.includes(':') && line.trim() !== '') {
      bodyStartIdx = i;
      break;
    }
  }
  
  if (bodyStartIdx === -1) continue;
  
  const origHeader = origLines.slice(0, bodyStartIdx).filter(l => l.trim());
  const origBody = origLines.slice(bodyStartIdx).join('\n');

  // Check meta file
  let metaIssue = null;
  if (fs.existsSync(metaPath)) {
    const metaContent = fs.readFileSync(metaPath, 'utf-8');
    const metaLines = metaContent.split('\n').filter(l => l.trim());
    const badMetaLines = metaLines.filter(l => !l.includes(':'));
    if (badMetaLines.length > 0) {
      metaIssue = { badLines: badMetaLines };
    }
  }

  // Check content file
  let contentIssue = null;
  if (fs.existsSync(contentPath)) {
    const newContent = fs.readFileSync(contentPath, 'utf-8');
    if (newContent.trim() !== origBody.trim()) {
      contentIssue = { 
        origStart: origBody.substring(0, 80),
        newStart: newContent.substring(0, 80),
      };
    }
  }

  if (metaIssue || contentIssue) {
    issues.push({ tidFile, baseName, metaIssue, contentIssue, origBody });
  }
}

console.log(`问题文件: ${issues.length}\n`);
for (const item of issues) {
  console.log(`=== ${item.tidFile} ===`);
  if (item.metaIssue) {
    console.log(`  Meta 泄漏: ${item.metaIssue.badLines.length} 行`);
    item.metaIssue.badLines.forEach(l => console.log(`    "${l.substring(0, 80)}"`));
  }
  if (item.contentIssue) {
    console.log(`  原始 body 开头: "${item.contentIssue.origStart.substring(0, 60)}..."`);
    console.log(`  当前文件开头: "${item.contentIssue.newStart.substring(0, 60)}..."`);
  }
}
