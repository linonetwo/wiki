---
layout: post
title: 'ReactStorybook的各种故事'
date: 2017-02-22 22:20:19 +0800
image: 'blog-author.jpg'
description: '讲述各种各样的组件的故事'
main-class: 'frontend'
color: '#66CCFF'
tags:
  - GraphQL
  - kadira
  - React
  - storybook
categories: Review
twitter_text:
introduction: '用 @kadira/Storybook 迭代开发各种各样的 React 组件'
---

React 开发的单页面应用，顾名思义，有着很多很多的页面（。）应用启动时可能会有启动页，然后根据本地存储中有没有存在 token 决定是否跳转到登录页面，登录后则可能有多 tab 切换的页面、点击列表项跳转的目录页等等。

我们使用 react-router 等路由框架在应用的各个页面之间切换，本质上是点击按钮等事件导致路由状态改变后，路由框架根据应用当前的状态渲染出不同的页面。

那么如果我们需要修改一个很深很深的组件里的样式，我们是不是要一次一次戳按钮点进去？当你修改了这个很深很深的组件，发现样式热替换挂了，这有时候是玄学，你需要手动刷新整个应用，你是否肯任劳任怨地重新戳回去一次？一次又一次？

![deep nested component dev](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/reduxstorybook/component%20tree.png)

如果产品需求改了，你要改的是数据流逻辑，而改完发现热替换不支持你正在修改的部分，那感觉肯定烦死了。要是有一种方法能直接跳到你要修改的组件身边就好了。

> 为什么不直接用 react-router 跳到你要去的组件那边？

因为有的人不用 react-router，有的人用 react-router v4。比如在 React Native 环境下，有的人用`react-native-router-flux` 有的人用`react-router-native` 有的人用`react-router-addon-controlled(deprecated)`，所以我们最好用一个和这些东西无关的第三方框架来辅助我们的开发。

![React Native Storybook](https://github.com/storybooks/react-native-storybook/raw/master/docs/assets/readme/screenshot.png)

`@kadira/Storybook` 就是一个这样的框架，可以应用在 web 端和 native 端，将每个组件看作一个故事，然后用 Storybook 左边的书签在故事之间快速跳转。

## 故事书

在 `@kadira/Storybook` 的辅助下，我们可以把组件化开发玩出一些花样。

## Atomic Design

2013 年 Brad Frost 提出的 Atomic Design（分级设计）建议我们创建系统中一个个小型、独立、可重用的元素，然后再组合为整个界面，而不是一次设计单个页面。

![Atomic Design](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/reduxstorybook/Atomic%20Design.png)
[[1]](#1)

这是一个比较抽象的，面对设计师的概念。当然它曾经有一些框架可以使用，但是比较难用 [[2]](#2)（可能是我耐心不足）。但它的愿景现在可以由 `@kadira/Storybook` 来实现，看下图，我给出了两个 Molecule 级别的组件，它们由数个从别的 UI 库中 import 进来的原子组件合成：

![powerload](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/reduxstorybook/powerload.jpg)

↑ 它由一个 `<AnimatedCircularProgress />` 和多个 `<Text />` 组成，虽然 `<AnimatedCircularProgress />` 本身是一个复杂的组件，但对于库的使用者来说，它就是一个 Atom 级别的组件。

![incomingline](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/reduxstorybook/incomingline.jpg)

它们可以组合成下面的页面 ↓

![sitedetail](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/reduxstorybook/sitedetail.jpg)

每个组件也可以单独使用，做成别的页面 ↓

![districeDetail](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/reduxstorybook/distirctdetail.jpg)

对于搞 React 的人来说，组合是蛮稀松平常的事情，但不稀松平常的是下面这个 Story 列表，它拍扁了 Atomic Design 的层次，让你能快速定位到要调整样式或者要展示效果的页面上。

![stories](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/reduxstorybook/storybooksidebar.png)

在一阵忙碌的调整后，打开组件的 Story，然后选择一个状态查看，以上图为例，<Incomingline /> 根据传入的 props 不同，我定义了三个状态，分别是静息状态（x），有一组让进度条比较好看的参数值的普通状态，带一组随机生成的参数值的随机状态。为了给经理展示 UI 在各种状态下都能正常工作，你可以定义更多的状态。

## 快照测试

定义更多的状态还有一个好处，就是每一个状态其实都是一个界面单元测试。在开启着这个 Story 的状态下对其进行修改，你肉眼每一次瞄过它都相当于运行了一次样式单元测试，保证了它在常见情况下样式正常。

而对于自动化测试，我们都知道现在 React 项目在 init 时都会自带一个 Jest 依赖，对于 React，它将一个虚拟 DOM 渲染成一个 JSON 快照，并在下次运行 Jest 时对比新的快照和旧的快照之间有没有出现偏差。

StoryShot 可以几乎零配置地用你写的 Story 生成快照，只需要：

```javascript
import initStoryshots from 'storyshots';
initStoryshots();
```

它就会使用 Storybook 的 `getStorybook()` 函数获取你的所有 Story，把它们变成快照和上次的快照进行比对，这可用于检测一些组件逻辑修改导致的 I/O 边界变化，比如产品经理让你改一个样式，但新的样式要根据 props 来做订制。你改完需求后写了几个 Story 点开给产品经理看，这时候某几组 props 可以让组件变得特好看，产品经理满意地笑了，但 storyshot 就会告诉你，有一组输入下样式正常但是其实逻辑崩了，那你脸就白了，这是个很傻比的 bug，还好在上线前发现了这一点。

## 调点参数

如果你在做一个类似 `material-ui` 或是 `ant-design` 的 _Pattern Library_，你可能会想全方位地展示你的组件，比如写一个 demo 页，里面给出组件的各种样子。但就像费马所说：「我有很多绝妙的组件样式，但这里空间太小……」，你不可能在 demo 页上给出组件所有的可能形态，因为给得太多会让 demo 页太长很难翻。

[Storybook Addon Knobs](https://git.io/vXdhZ) 可以让你在 Storybook 页面上动态调整传给组件的 props，很适合用于展示。

![knob example](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/reduxstorybook/knobs.png)

给出组件的几个预设形态，然后让用户在运行时自己改出喜欢的模样，这会让他们觉得这个组件库很人道、很民主。

## 赏玩你的 API

当你用领域驱动设计的思想启动一个 GraphQL 网关，里面有精心定义的模型，字字珠玑的 Schema，还有被它挡在身后的数个 REST 微服务，这时候再为你的同事提供一份用例文档，那可真是锦上添花。

用 `@kadira/storybook-addon-graphql` 可以创建一个类似 [Material-UI Components](http://www.material-ui.com/#/components/) 的展示站点，只不过它展示的不是组件的模样而是各个 API 的模样，还有 API 的 query 源码。将它部署在内网，可以为前端开发人员提供一个快速的网关 query 参考。

![GraphQL Stories Page](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/reduxstorybook/graphqlstoriesinstance.png)

一个 GraphQL Story 有预定义的 query 和 variable，你可以在页面上随时修改它，修改的的时候也能享受到 GraphQL 反射提供的自动补全。

我们通过一个叫 `babel-plugin-static-fs` 的 babel 插件来载入 `.graphql` 文件，它将形似 `readFileSync(join(__dirname, './xxx/xxx.graphql'), 'utf8')` 的字符串在编译期替换掉，换成内联的 GraphQL 请求字符串：

![GraphQL Stories](https://github.com/linonetwo/linonetwo.github.io/raw/master/assets/img/posts/reduxstorybook/graphqlstories.png)

```javascript
// babel-plugin-static-fs 需要的引用，其实它们并不会真的起作用，而是在编译期被内联
import { readFileSync } from 'fs';
import { join } from 'path';

import { storiesOf, action } from '@kadira/storybook';
import { setupGraphiQL } from '@kadira/storybook-addon-graphql';

// 自定义的 connector
const fetcher = params => {
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(params),
  };
  // 这里我们直接调用本地启动的 API 网关
  return fetch('http://localhost:8964/graphql', options).then(res => res.json());
};
const graphiql = setupGraphiQL({ fetcher });

// 以下添加一个 Story 的两个状态
storiesOf('AndroidApp', module)
  .add(
    'GetToken with dwycs',
    graphiql(
      readFileSync(join(__dirname, './mutations/GetToken.gql'), 'utf8'),
      `
    {
      "userName": "xxxxxx",
      "passWord": "xxxxxxxxxxx"
    }
  `
    )
  )
  .add(
    'MainPageData with dwycs',
    graphiql(
      readFileSync(join(__dirname, './queries/android/MainPageData.gql'), 'utf8'),
      `
    {
      "token": "xxxxxx-xxxxxxxx-xxxxxxxx"
    }
  `
    )
  );
```

有了这样的锦上添花设施，你就能让你的基础设施更好地为人民服务了。

## 更多的故事书

可想而知，人民群众对这种新奇的测试方法——或者说展示方法——的热情很快就会延伸到其他领域，设计师可以用它在网页和手机上展示复杂的 AE 动画效果（[bodymovin](https://github.com/OYsun/AE-Element)），区块链工程师用它测试各种智能合约等等，我很期待在未来看到 `@kadira/Storybook` 发展成一套类似于 IPython（Jupyter Notebook）但更注重于可视化的 snippet 管理工具。

## 参考

### [<span id="1">Atomic Design</span>](http://bradfrost.com/blog/post/atomic-web-design/)

### [<span id="2">Atomic Design 的一个实现：patternlab demo</span>](http://demo.patternlab.io/?p=pages-homepage)

### [<span id="3">始作俑者</span>](https://github.com/storybooks)
