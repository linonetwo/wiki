const fs = require('fs');
const path = require('path');

const wikiDir = '/Users/linonetwo/Desktop/wiki/private-wiki';

// These files in files/ use URL-encoding, so _canonical_uri should too
const fixMap = {
  // Russian filenames stay encoded
  'Theory_and_Practice_of_Source_Code_Parsing_with_ANTLR_and_Roslyn_%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA+%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0+2016-06-20+%D0%B2+16.59.35.png.tid':
    'files/Theory_and_Practice_of_Source_Code_Parsing_with_ANTLR_and_Roslyn_%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA+%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0+2016-06-20+%D0%B2+16.59.35.png',
  'Theory_and_Practice_of_Source_Code_Parsing_with_ANTLR_and_Roslyn_%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA+%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0+2016-06-20+%D0%B2+17.00.24.png.tid':
    'files/Theory_and_Practice_of_Source_Code_Parsing_with_ANTLR_and_Roslyn_%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA+%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0+2016-06-20+%D0%B2+17.00.24.png',
  'Theory_and_Practice_of_Source_Code_Parsing_with_ANTLR_and_Roslyn_%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA+%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0+2016-06-20+%D0%B2+17.00.52.png.tid':
    'files/Theory_and_Practice_of_Source_Code_Parsing_with_ANTLR_and_Roslyn_%D0%A1%D0%BD%D0%B8%D0%BC%D0%BE%D0%BA+%D1%8D%D0%BA%D1%80%D0%B0%D0%BD%D0%B0+2016-06-20+%D0%B2+17.00.52.png',
  // p12 uses %40 for @ in the actual filename
  '搞了个_https_lindongwu11%40gmail.com.p12.tid':
    'files/搞了个_https_lindongwu11%40gmail.com.p12',
};

let fixed = 0;
for (const [tidFile, correctUri] of Object.entries(fixMap)) {
  const filePath = path.join(wikiDir, tidFile);
  if (!fs.existsSync(filePath)) { console.log('SKIP (not found):', tidFile); continue; }
  
  let content = fs.readFileSync(filePath, 'utf-8');
  const oldMatch = content.match(/^_canonical_uri:\s*(.+)$/m);
  if (!oldMatch) { console.log('SKIP (no URI):', tidFile); continue; }
  
  const oldUri = oldMatch[1].trim();
  if (oldUri === correctUri) { console.log('OK:', tidFile); continue; }
  
  content = content.replace(oldMatch[0], '_canonical_uri: ' + correctUri);
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('FIXED:', tidFile);
  console.log('  old:', oldUri);
  console.log('  new:', correctUri);
  fixed++;
}
console.log('Total fixed:', fixed);
