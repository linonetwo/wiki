const file1s = [
  '53209F9F-9D44-4743-9A7D-23B1F58D8878-10156-0000(1).jpg',
  'B8CE9319-2881-4B9F-8650-93AF5EFEF33C-10156-0000(1).jpg',
  'IMG_20150703_140741(1).jpg',
  'IMG_20150703_140741.jpg(1).json',
  'IMG_20150703_140741.jpg(1).meta',
  'IMG_20170615_143031(1).jpg',
  'mmexport1480894429325(1).jpg',
  'mmexport1480894429325.jpg(1).json',
  'mmexport1480894429325.jpg(1).meta',
  'mmexport1480894433313(1).jpg',
  'mmexport1480894433313.jpg(1).json',
  'mmexport1480894433313.jpg(1).meta',
  'mmexport1480894436950(1).jpg',
  'mmexport1480894436950.jpg(1).json',
  'mmexport1480894436950.jpg(1).meta',
  'mmexport1480894444053(1).jpg',
  'mmexport1480894444053.jpg(1).json',
  'mmexport1480894444053.jpg(1).meta',
  'mmexport1480894447368(1).jpg',
  'mmexport1480894447368.jpg(1).json',
  'mmexport1480894447368.jpg(1).meta',
  'mmexport1480894851824(1).jpg',
  'mmexport1480894851824.jpg(1).json',
  'mmexport1480894851824.jpg(1).meta',
  'mmexport1480894900727(1).jpg',
  'mmexport1480894900727.jpg(1).json',
  'mmexport1480894900727.jpg(1).meta',
  'mmexport1480896546111(1).jpg',
  'mmexport1480896546111.jpg(1).json',
  'mmexport1480896546111.jpg(1).meta',
  'mmexport1480944612644(1).jpg',
  'mmexport1480944612644.jpg(1).json',
  'mmexport1480944612644.jpg(1).meta',
  'mmexport1504716868390(1).jpg',
  'mmexport1504716868390.jpg(1).json',
  'mmexport1504716868390.jpg(1).meta',
  'mmexport1504716883082(1).jpg',
  'mmexport1504716883082.jpg(1).json',
  'mmexport1504716883082.jpg(1).meta',
  'mmexport1527591219156(1).jpg',
  'mmexport1527591219156.jpg(1).json',
  'mmexport1527591219156.jpg(1).meta',
  'mmexport1527591373460(1).jpg',
  'mmexport1527591373460.jpg(1).json',
  'mmexport1527591373460.jpg(1).meta',
  'mmexport1527591380927(1).jpg',
  'mmexport1527591380927.jpg(1).json',
  'mmexport1527591380927.jpg(1).meta',
  'mmexport1527591385724(1).jpg',
  'mmexport1527591385724.jpg(1).json',
  'mmexport1527591385724.jpg(1).meta',
  'mmexport1527591406123(1).jpg',
  'mmexport1527591406123.jpg(1).json',
  'mmexport1527591406123.jpg(1).meta',
  'mmexport1527591408450(1).jpg',
  'mmexport1527591408450.jpg(1).json',
  'mmexport1527591408450.jpg(1).meta',
  'mmexport1527591422966(1).jpg',
  'mmexport1527591422966.jpg(1).json',
  'mmexport1527591422966.jpg(1).meta',
  'mmexport1527591500343(1).jpg',
  'mmexport1527591500343.jpg(1).json',
  'mmexport1527591500343.jpg(1).meta',
  'mmexport1527591512844(1).jpg',
  'mmexport1527591512844.jpg(1).json',
  'mmexport1527591512844.jpg(1).meta',
  'mmexport1527591536315(1).jpg',
  'mmexport1527591536315.jpg(1).json',
  'mmexport1527591536315.jpg(1).meta',
  'mmexport1527591539088(1).jpg',
  'mmexport1527591539088.jpg(1).json',
  'mmexport1527591539088.jpg(1).meta',
  'mmexport1527591546073(1).jpg',
  'mmexport1527591546073.jpg(1).json',
  'mmexport1527591546073.jpg(1).meta',
  'mmexport1527591561128(1).jpg',
  'mmexport1527591561128.jpg(1).json',
  'mmexport1527591561128.jpg(1).meta',
  'mmexport1527591582986(1).jpg',
  'mmexport1527591582986.jpg(1).json',
  'mmexport1527591582986.jpg(1).meta',
  'mmexport1527591603401(1).jpg',
  'mmexport1527591603401.jpg(1).json',
  'mmexport1527591603401.jpg(1).meta',
  'mmexport1527591617385(1).jpg',
  'mmexport1527591617385.jpg(1).json',
  'mmexport1527591617385.jpg(1).meta',
  'mmexport1527591631320(1).jpg',
  'mmexport1527591631320.jpg(1).json',
  'mmexport1527591631320.jpg(1).meta',
  'mmexport1527591654963(1).jpg',
  'mmexport1527591654963.jpg(1).json',
  'mmexport1527591654963.jpg(1).meta',
  'mmexport1527591659274(1).jpg',
  'mmexport1527591659274.jpg(1).json',
  'mmexport1527591659274.jpg(1).meta',
  'mmexport1527591663300(1).jpg',
  'mmexport1527591663300.jpg(1).json',
  'mmexport1527591663300.jpg(1).meta',
  'mmexport1527591668887(1).jpg',
  'mmexport1527591668887.jpg(1).json',
  'mmexport1527591668887.jpg(1).meta',
  'mmexport1527591672814(1).jpg',
  'mmexport1527591672814.jpg(1).json',
  'mmexport1527591672814.jpg(1).meta',
  'mmexport1558918597685(1).jpg',
  'mmexport1558918597685-已修改(1).jpg',
  'mmexport1558918597685.jpg(1).json',
  'mmexport1558918597685.jpg(1).meta',
  'mmexport1558918641979(1).jpg',
  'mmexport1558918641979-已修改(1).jpg',
  'mmexport1558918641979.jpg(1).json',
  'mmexport1558918641979.jpg(1).meta',
  'mmexport1620066547688(1).jpg',
  'mmexport1620066547688-已修改(1).jpg',
  'mmexport1620066547688.jpg(1).json',
  'mmexport1620066547688.jpg(1).meta',
  'mmexport1662974166545(1).jpg',
  'mmexport1662974166545-已修改(1).jpg',
  'mmexport1662974166545.jpg(1).json',
  'mmexport1662974166545.jpg(1).meta',
  'original_04c06b5d-e350-4556-8278-6322ad8a38cd_m(1).jpg',
  'original_0842e9f4-b8f1-46f7-849f-0dfe2ba765d4_m(1).jpg',
  'original_3b507401-e31d-4856-8ae4-c4e4ffc3f7b2_m(1).jpg',
  'original_63a52af2-9951-496d-b6c1-57bc02e3dd34_(1).webp',
]


const root = '/Users/linonetwo/Downloads/归档文件/';
fs.readdirSync(root)

file1s.forEach(function (file) {
  if (file.includes('(1)')) {
    console.log(file);
    // fs.moveSync(`${root}${file}`, `${root}1files/${file}`);
    fs.copySync(`${root}${file.replace('(1)', '')}`, `${root}1files/${file.replace('(1)', '')}`);
    return;
  }
  if (file.endsWith('.json')) {
    const content = fs.readJSONSync(`${root}${file}`);
    // console.log(content);

    let formatted = `title: ${content.title.replace(/(\.webp|\.jpeg|\.jpg|\.gif|\.png|\.mp4)/gi, '')}
created: ${stringifyDate(new Date(Number(content.creationTime.timestamp + '000')))}
modified: ${stringifyDate(new Date(Number(content.photoTakenTime.timestamp + '000')))}
imageViews: ${content.imageViews}
`;

    const 已修改path = file.replace('.json', '').replace(/(\.webp|\.jpeg|\.jpg|\.gif|\.png|\.mp4)/gi, '-已修改$1');
    const 已修改1path = file.replace('.json', '').replace(/(\.webp|\.jpeg|\.jpg|\.gif|\.png|\.mp4)/gi, '-已修改$1');
    if (fs.pathExistsSync(`${root}${已修改path}`)) {
      fs.writeFileSync(`${root}${file.replace('.json', '.meta')}`, formatted);
      let 已修改formatted = `title: ${已修改path.replace(/(\.webp|\.jpeg|\.jpg|\.gif|\.png|\.mp4)/gi, '')}
created: ${stringifyDate(new Date(Number(content.creationTime.timestamp + '000')))}
modified: ${stringifyDate(new Date(Number(content.photoTakenTime.timestamp + '000')))}
imageViews: ${content.imageViews}
tags: ${content.title.replace(/(\.webp|\.jpeg|\.jpg|\.gif|\.png|\.mp4)/gi, '')} Modified
`;
      fs.writeFileSync(`${root}${已修改path + '.meta'}`, 已修改formatted);
      formatted += 'tags: Original';
    }
    fs.writeFileSync(`${root}${file.replace('.json', '.meta')}`, formatted);
  }
});

function stringifyDate(value) {
  return (
    value.getUTCFullYear() +
    pad(value.getUTCMonth() + 1) +
    pad(value.getUTCDate()) +
    pad(value.getUTCHours()) +
    pad(value.getUTCMinutes()) +
    pad(value.getUTCSeconds()) +
    pad(value.getUTCMilliseconds(), 3)
  );
}

function pad(value, length) {
  length = length || 2;
  var s = value.toString();
  if (s.length < length) {
    s = '000000000000000000000000000'.substr(0, length - s.length) + s;
  }
  return s;
}
