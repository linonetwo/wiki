const fs = require('fs');
const metaPath = '/Users/linonetwo/Desktop/wiki/calendar/写一个塔防 Starbound Mod.md.meta';
const mdPath = '/Users/linonetwo/Desktop/wiki/calendar/写一个塔防 Starbound Mod.md';

const metaContent = fs.readFileSync(metaPath, 'utf-8');
const lines = metaContent.split('\n');

// A valid header line: before the first ':' matches [word] or [word_word] or _word
const headerPattern = /^[a-zA-Z0-9_-]+:.*$/;

let lastHeaderIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (headerPattern.test(lines[i].trim())) {
    lastHeaderIdx = i;
  } else {
    // Once we hit a non-header line, stop looking for more headers
    // (body lines shouldn't be followed by header lines)
    break;
  }
}

console.log('Last header line index:', lastHeaderIdx);
const headerLines = lines.slice(0, lastHeaderIdx + 1);
const bodyLines = lines.slice(lastHeaderIdx + 1);
console.log('Header fields:', headerLines.filter(l => l.trim()).length);
console.log('Body lines leaked:', bodyLines.filter(l => l.trim()).length);

if (bodyLines.filter(l => l.trim()).length > 0) {
  // Fix .meta - keep only header
  const cleanMeta = headerLines.filter(l => l.trim()).join('\n') + '\n';
  fs.writeFileSync(metaPath, cleanMeta, 'utf-8');
  console.log('Fixed .meta');
  
  // Fix .md - prepend body
  const leakedBody = bodyLines.join('\n');
  let mdContent = '';
  try { mdContent = fs.readFileSync(mdPath, 'utf-8'); } catch(e) {}
  const newMd = leakedBody.trim() + (leakedBody.trim() && mdContent.trim() ? '\n\n' : '') + mdContent.trim();
  fs.writeFileSync(mdPath, newMd + '\n', 'utf-8');
  console.log('Fixed .md');
  console.log('New .md first line:', newMd.trim().split('\n')[0]);
} else {
  console.log('Already clean!');
}
