const fs = require('fs');
const path = require('path');

const tiddlersDir = './tiddlers';
const imagesDir = './files';
const fileExtension = '.doc';

// 获取所有指定扩展名的文件
const files = fs.readdirSync(tiddlersDir).filter(file => file.endsWith(fileExtension));

files.forEach(file => {
    const oldPath = path.join(tiddlersDir, file);
    const newPath = path.join(imagesDir, file).replace(/\\/g, '/');
    const relativePath = `./${newPath}`;

    // 移动文件z
    fs.renameSync(oldPath, newPath);

    const metaFile = `${oldPath}.meta`;
    const tidFile = `${oldPath}.tid`;

    if (fs.existsSync(metaFile)) {
        // 读取 meta 文件内容
        const metaContent = fs.readFileSync(metaFile, 'utf8');
        const newMetaContent = `_canonical_uri: file://${relativePath}\n${metaContent}`;

        // 写入新的 tid 文件
        fs.writeFileSync(tidFile, newMetaContent);

        // 删除旧的 meta 文件
        fs.unlinkSync(metaFile);
    }
});
