const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function checkWiki(wikiDir, name) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`检查: ${name}`);
  console.log('='.repeat(60));

  const issues = [];

  // 1. Check git status
  const statusResult = spawnSync('git', ['status', '--short'], { cwd: wikiDir, encoding: 'utf-8' });
  if (statusResult.stdout.trim()) {
    const lines = statusResult.stdout.trim().split('\n');
    const del = lines.filter(l => l.match(/^.?D/));
    const untracked = lines.filter(l => l.startsWith('??'));
    const modified = lines.filter(l => l.match(/^.?M/));
    if (del.length) console.log(`  ⚠️ 已删除未提交: ${del.length} 个文件`);
    if (untracked.length) console.log(`  ⚠️ 未跟踪: ${untracked.length} 个文件`);
    if (modified.length) console.log(`  ⚠️ 已修改: ${modified.length} 个文件`);
    if (!del.length && !untracked.length && !modified.length) console.log(`  ✅ git 状态干净`);
  } else {
    console.log(`  ✅ git 状态干净`);
  }

  // 2. Check _canonical_uri format
  const rootFiles = fs.readdirSync(wikiDir).filter(f => f.endsWith('.tid'));
  let badUriFormat = [];
  let binaryTidCount = 0;
  let brokenRefs = [];
  const filesDir = path.join(wikiDir, 'files');
  
  for (const f of rootFiles) {
    const content = fs.readFileSync(path.join(wikiDir, f), 'utf-8');
    const uriMatch = content.match(/^_canonical_uri:\s*(.+)$/m);
    if (!uriMatch) continue;
    
    binaryTidCount++;
    const uri = uriMatch[1].trim();
    
    // Check format
    if (uri.startsWith('file://')) {
      badUriFormat.push({ file: f, uri });
    }
    
    // Check file exists
    let targetFile = uri;
    if (uri.startsWith('files/')) targetFile = uri.slice(6);
    const targetPath = path.join(filesDir, targetFile);
    if (!fs.existsSync(targetPath)) {
      brokenRefs.push({ file: f, uri });
    }
  }
  
  console.log(`  📦 二进制 .tid: ${binaryTidCount}`);
  if (badUriFormat.length) {
    console.log(`  ❌ _canonical_uri 格式错误 (file:// 前缀): ${badUriFormat.length}`);
    badUriFormat.forEach(i => console.log(`    ${i.file}: ${i.uri}`));
  } else {
    console.log(`  ✅ _canonical_uri 格式正确`);
  }
  if (brokenRefs.length) {
    console.log(`  ❌ 引用文件不存在: ${brokenRefs.length}`);
    brokenRefs.forEach(i => console.log(`    ${i.file} -> ${i.uri}`));
  } else {
    console.log(`  ✅ 所有引用文件存在`);
  }

  // 3. Check orphan files in files/ (no corresponding .tid)
  if (fs.existsSync(filesDir)) {
    const filesInFiles = fs.readdirSync(filesDir).filter(f => !f.startsWith('.'));
    const orphans = [];
    for (const f of filesInFiles) {
      const fullPath = path.join(filesDir, f);
      if (fs.statSync(fullPath).isDirectory()) continue;
      const tidName = f + '.tid';
      if (!rootFiles.includes(tidName)) {
        // Check if any .tid references this file
        let found = false;
        for (const tf of rootFiles) {
          const c = fs.readFileSync(path.join(wikiDir, tf), 'utf-8');
          if (c.includes(f)) { found = true; break; }
        }
        if (!found) orphans.push(f);
      }
    }
    console.log(`  📁 files/ 中文件: ${filesInFiles.length}`);
    if (orphans.length) {
      console.log(`  ⚠️ files/ 中孤立文件 (无 .tid 引用): ${orphans.length}`);
      orphans.slice(0, 10).forEach(o => console.log(`    ${o}`));
      if (orphans.length > 10) console.log(`    ... 还有 ${orphans.length - 10} 个`);
    } else {
      console.log(`  ✅ 无孤立文件`);
    }
  }

  // 4. Check .tid files in root that are NOT wikitext (should be split)
  const textTypes = ['text/vnd.tiddlywiki', 'text/plain', 'text/html', 'text/x-markdown', 'text/markdown', 'application/json', 'application/javascript'];
  let nonWikiTextTid = [];
  for (const f of rootFiles) {
    const content = fs.readFileSync(path.join(wikiDir, f), 'utf-8');
    const typeMatch = content.match(/^type:\s*(.+)$/m);
    if (!typeMatch) continue;
    const type = typeMatch[1].trim();
    if (type === 'text/vnd.tiddlywiki') continue; // wikitext stays as .tid
    
    // Check if this non-wikitext tiddler should be split
    const hasCanonical = content.includes('_canonical_uri:');
    if (hasCanonical) continue; // binary, already handled
    
    // Non-wikitext, non-binary - should these be split?
    // In FlatWiki mode, .tid format is fine, but in split mode they'd be .meta + content
    // We're not flagging these as errors since .tid format is valid
  }

  // 5. Check split files (.meta + content) for integrity
  const metaFiles = fs.readdirSync(wikiDir).filter(f => f.endsWith('.meta'));
  let badMetaFiles = [];
  
  for (const metaFile of metaFiles) {
    const metaPath = path.join(wikiDir, metaFile);
    const contentFile = metaFile.replace(/\.meta$/, '');
    const contentPath = path.join(wikiDir, contentFile);
    
    if (!fs.existsSync(contentPath)) {
      badMetaFiles.push({ meta: metaFile, issue: '缺少对应 content 文件' });
      continue;
    }
    
    // Check meta for non-header lines (no colon)
    const metaContent = fs.readFileSync(metaPath, 'utf-8');
    const metaLines = metaContent.split('\n').filter(l => l.trim());
    const badLines = metaLines.filter(l => !l.includes(':'));
    if (badLines.length) {
      badMetaFiles.push({ meta: metaFile, issue: `meta 中有 ${badLines.length} 行非 header 内容` });
    }
  }
  
  console.log(`  📝 拆分文件 (.meta): ${metaFiles.length}`);
  if (badMetaFiles.length) {
    console.log(`  ❌ Meta 文件有问题: ${badMetaFiles.length}`);
    badMetaFiles.forEach(i => console.log(`    ${i.meta}: ${i.issue}`));
  } else {
    console.log(`  ✅ Meta 文件正常`);
  }

  return { badUriFormat, brokenRefs, orphans, badMetaFiles };
}

// Check both wikis
checkWiki('/Users/linonetwo/Desktop/wiki/private-wiki', 'private-wiki');
checkWiki('/Users/linonetwo/Desktop/wiki/calendar', 'calendar');
