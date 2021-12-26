const tiddlerToVisualize = '意义'

var Categories = [
  {
    name: 'Focusing'
  },
  {
    name: 'History'
  },
  {
    name: 'Link To'
  },
  {
    name: 'Backlink From'
  },
  {
    name: 'Tag To'
  },
  {
    name: 'Tag By'
  },
  {
    name: 'Parent'
  },
];

exports.onMount = function () {
  return {
  };
};

exports.shouldUpdate = function (_, changedTiddlers) {
  return $tw.utils.count(changedTiddlers) > 0;
};

exports.onUpdate = function (echart, state) {
  const focussedTiddler = tiddlerToVisualize;
  if (focussedTiddler && focussedTiddler.startsWith('$:/')) return;
  var nodes = [];
  var edges = [];
  if (focussedTiddler && focussedTiddler !== '') {
    var nodeMap = {};
    nodeMap[''] = true;

    // 当前关注的 Tiddler
    nodeMap[focussedTiddler] = true;
    nodes.push({
      name: focussedTiddler,
      // fixed: true,
      category: 0,
    });

    // 链接
    $tw.utils.each($tw.wiki.getTiddlerLinks(focussedTiddler), function (tiddlerTitle) {
      edges.push({
        source: focussedTiddler,
        target: tiddlerTitle,
        label: {
          show: true,
          formatter: 'link'
        }
      });
      if (nodeMap[tiddlerTitle]) return;
      nodes.push({
        name: tiddlerTitle,
        category: 2,
      });
      nodeMap[tiddlerTitle] = true;
    });

    // 反链
    $tw.utils.each($tw.wiki.getTiddlerBacklinks(focussedTiddler), function (tiddlerTitle) {
      edges.push({
        source: tiddlerTitle,
        target: focussedTiddler,
        label: {
          show: true,
          formatter: 'backlink'
        }
      });
      if (nodeMap[tiddlerTitle]) return;
      nodes.push({
        name: tiddlerTitle,
        category: 3,
      });
      nodeMap[tiddlerTitle] = true;
    });

    // 指向哪些tag
    $tw.utils.each($tw.wiki.getTiddler(focussedTiddler).fields.tags, function (tiddlerTitle) {
      if (!$tw.wiki.tiddlerExists(tiddlerTitle)) return;
      edges.push({
        source: focussedTiddler,
        target: tiddlerTitle,
        label: {
          show: true,
          formatter: 'tag'
        }
      });
      if (nodeMap[tiddlerTitle]) return;
      nodes.push({
        name: tiddlerTitle,
        category: 4,
      });
      nodeMap[tiddlerTitle] = true;
    });

    // 被谁作为 Tag
    $tw.utils.each($tw.wiki.getTiddlersWithTag(focussedTiddler), function (tiddlerTitle) {
      edges.push({
        source: tiddlerTitle,
        target: focussedTiddler,
        label: {
          show: true,
          formatter: 'tag'
        }
      });
      if (nodeMap[tiddlerTitle]) return;
      nodes.push({
        name: tiddlerTitle,
        category: 5,
      });
      nodeMap[tiddlerTitle] = true;
    });

    // 父条目
    var path = focussedTiddler.split('/');
    if (path.length > 1) {
      var parentTiddler = path.slice(0, -1).join('/');
      $tw.utils.each([parentTiddler, parentTiddler + '/'], function (tiddlerTitle) {
        edges.push({
          source: tiddlerTitle,
          target: focussedTiddler,
          label: {
            show: true,
            formatter: 'parent'
          }
        });
        if (nodeMap[tiddlerTitle]) return;
        nodes.push({
          name: tiddlerTitle,
          category: 6,
        });
        nodeMap[tiddlerTitle] = true;
      });
    }
  }

  echart.setOption({
    legend: [
      {
        data: Categories.map(function (a) {
          return a.name;
        })
      }
    ],
    title: {
      text: '意义网络',
      show: true,
      top: 'bottom',
      left: 'right',
    },
    series: [
      {
        name: '意义网络图',
        type: 'graph',
        layout: 'force',
        nodes: nodes,
        edges: edges,
        categories: Categories,
        roam: true,
        zoom: 4.0,
        label: {
          position: 'right',
          show: true
        },
        force: {
          repulsion: 50
        },
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        edgeLabel: {
          fontSize: 5
        },
        lineStyle: {
          opacity: 0.9,
          width: 2,
          curveness: 0
        }
      }
    ]
  });
};
