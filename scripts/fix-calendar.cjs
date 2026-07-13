const fs = require('fs');
const metaContent = fs.readFileSync('/Users/linonetwo/Desktop/wiki/calendar/写一个塔防 Starbound Mod.md.meta', 'utf-8');
const lines = metaContent.split('\n');

let lastHeaderIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(':')) lastHeaderIdx = i;
}

const headerLines = lines.slice(0, lastHeaderIdx + 1);
const leakedBody = lines.slice(lastHeaderIdx + 1).join('\n');

console.log('Header lines:', headerLines.length);
console.log('Leaked body length:', leakedBody.length);

// Fix .md
let mdContent = '';
try { mdContent = fs.readFileSync('/Users/linonetwo/Desktop/wiki/calendar/写一个塔防 Starbound Mod.md', 'utf-8'); } catch(e) {}
const newMd = leakedBody.trim() + '\n\n' + mdContent.trim();
fs.writeFileSync('/Users/linonetwo/Desktop/wiki/calendar/写一个塔防 Starbound Mod.md', newMd, 'utf-8');

// Fix .meta
const cleanMeta = headerLines.filter(l => l.trim()).join('\n') + '\n';
fs.writeFileSync('/Users/linonetwo/Desktop/wiki/calendar/写一个塔防 Starbound Mod.md.meta', cleanMeta, 'utf-8');

console.log('Done!');
console.log('New .md first line:', newMd.split('\n')[0]);
