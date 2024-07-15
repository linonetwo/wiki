---
layout: post
title: 'Alfred的免费开源替代品Zazu'
date: 2019-05-21 12:00:35 +0800
image: 'blog-author.jpg'
description: '介绍以 MIT 协议开源的 JS 脚本管理和执行平台 Zazu'
main-class: 'memo'
color: '#9E9E9E'
tags:
  - memo
categories: Journal
introduction: '本来想用浏览器框来快速搜索，但是发现用一个类似 Alfred 的脚本管理器可能更快捷'
---

下载地址： [zazuapp.org/download](http://zazuapp.org/download/)

在集智俱乐部注意力与知识管理群里最近讨论起了 Alfred，一位同志建议我使用它，他跟我分享了 [alfred-github-workflow](https://github.com/gharlan/alfred-github-workflow) 说：「感觉作为入口，它做得很不错了。可以直接搜索我的收藏夹、本地文档（甚至 PDF 内容。不过我用不到）、github、api 文档。极少找不到的时候，回车就跳到 google 搜索」。

但是我不以为然，我提出「这些用浏览器自带的搜索框都能搞定嘛，我[只需要搞一个快捷键唤出浏览器框](https://onetwo.ren/%E7%94%A8%E6%B5%8F%E8%A7%88%E5%99%A8%E8%BE%93%E5%85%A5%E6%A1%86%E4%BB%A3%E6%9B%BFAlfred/)就好了，反正我要搜索的东西都是在线服务。」这样的观点。

但是我渐渐发现 MacOS 的自动操作（Automator）运行很不稳定，虽然总能执行成功，但有时浏览器框可以瞬间唤出，有时却要等待 2-8 秒，在[高级技术顾问也没给出有效方案](https://pastebin.com/R2JmiheF)后，我有点想试试 Alfred 了。

而真正让我开始尝试类似 Alfred 的产品的原因是我想写一个 JS 脚本自动翻译英文日文单词，并自动加入 Anki 笔记本安排背诵。我得找一个方便管理这种简单 JS 脚本的平台，而且执行速度要够快、支持的语法要全面（最好是在最新版的 NodeJS 上执行）。

## Zazu

于是我考察了几个排名较高的 JS 脚本管理平台，比如 Alfred，令人惊讶的是 Alfred 居然[直接在 JXA (JavaScript for Automation) 上运行 JS 脚本](https://github.com/JXA-Cookbook/JXA-Cookbook/wiki/ES6-Features-in-JXA)，而且在本地开发脚本的流程很麻烦，而且 Alfred 不开源，想加入新的功能会很慢。

我还搜到了 [Hain](https://github.com/hainproject/hain) 和 [Dext](https://github.com/DextApp/dext) 和 [Typie](https://github.com/typie/typie)，不过它们开发的插件得发布到 npm 上，这稍微麻烦了一点，因为脚本更新很频繁，最好是能直接用本地的 JS 脚本或者从 Github 仓库、Github Gist 上直接下载脚本。

[Zazu](https://github.com/tinytacoteam/zazu) 就不错，能根据配置文件从 Github 上直接下载插件，它会把仓库 clone 下来并用自带的 `npm` 执行 `npm i` 来完成插件的安装。插件是以 Block 组织的，每个 Block 可以接受别的 Block 作为输入，并输出结果到别的 Block 里，最终调用一些 Zazu 内置的 Block 打开浏览器等等。而且它是 MIT 协议开源的，我想怎么改都可以，还能重新发布等等。

于是我[自行修改了 Zazu](https://github.com/tinytacoteam/zazu/pull/341)，让它支持最新的 NodeJS 版本，还加上了磨砂玻璃效果等等，然后发布了一版给自己用。（更新：我已加入开发团队接手项目）

> [Download Zazu](http://zazuapp.org/download/)

## 改别人的插件

我通过修改古人的陈年代码很快捣鼓出了一个翻译+加入 Anki 的插件 [zazu-translation](https://github.com/linonetwo/zazu-translation)，源码很简单，首先在插件的 `zazu.json` 里面声明有哪些 Block，此处会把输入丢给 `src/cn.js` 翻译，然后把输出连接到 `"copy", "add-to-anki"` 这两个 Block 里，分别又调用另外两个 JS 脚本格式化输出复制到剪贴板、通过 AnkiConnect 保存到 Anki 里:

```json
{
  "blocks": {
    "input": [
      {
        "title": "translate to chinese",
        "id": "translation-chinese",
        "type": "PrefixScript",
        "space": true,
        "args": "Required",
        "prefix": "cn",
        "script": "src/cn.js",
        "debounce": 100,
        "connections": ["copy", "add-to-anki"]
      }
    ],
    "output": [
      {
        "id": "copy",
        "type": "UserScript",
        "script": "src/utils/getResult.js",
        "connections": ["copy-to-clipboard"]
      },
      {
        "id": "copy-to-clipboard",
        "type": "CopyToClipboard",
        "text": "{value}"
      },
      {
        "id": "add-to-anki",
        "type": "UserScript",
        "script": "src/utils/addToAnki.js"
      }
    ]
  }
}
```

[与 AnkiConnect 的代码](https://github.com/linonetwo/zazu-translation/blob/master/src/utils/addToAnki.js)也很简单，都是网上抄来到陈年代码。

在把所有改动都提交到 Github 上之后，只要在 Zazu 的配置文件 `~/.zazurc.json` 里面注明要下载这个仓库就好了：

```json
{
  "hotkey": "alt+space",
  "theme": "linonetwo/zazu-light-theme",
  "displayOn": "detect",
  "blur": false,
  "plugins": [
    {
      "name": "linonetwo/zazu-translation",
      "variables": {
        "anki": true,
        "deckName": "英语",
        "modelName": "基础",
        "fields": {
          "raw": "正面",
          "result": "背面"
        }
      }
    },
```

其中 `linonetwo/zazu-translation` 就是从 `https://github.com/linonetwo/zazu-translation` 下载这个插件的意思。

## 我常用的插件

我总共装了 11 个插件，配置文件分享在 [Github Gist](https://gist.github.com/linonetwo/c67997a192fd32df1211be5756c563e6) 上。

部分截图如下：

### linonetwo/zazu-clipboard 查看剪贴板及内容预览

[zazu-clipboard](https://github.com/linonetwo/zazu-clipboard)

![zazu-clipboard](https://raw.githubusercontent.com/linonetwo/zazu-clipboard/master/screenshot.png)

### linonetwo/zazu-translation 翻译成各种语言，并可选地把翻译结果添加到 Anki

[zazu-translation](https://github.com/linonetwo/zazu-translation)

![zazu-translation](https://raw.githubusercontent.com/linonetwo/zazu-translation/master/screenshot.png)

### linonetwo/zazu-firefox-bookmarks 翻译成各种语言，并可选地把翻译结果添加到 Anki

[zazu-firefox-bookmarks](https://github.com/linonetwo/zazu-firefox-bookmarks)

![zazu-firefox-bookmarks](https://raw.githubusercontent.com/linonetwo/zazu-firefox-bookmarks/master/screenshot.png)

### linonetwo/zazu-tldr 搜索常用程序员命令的使用方法

[zazu-tldr](https://github.com/linonetwo/zazu-tldr)

![zazu-tldr](https://raw.githubusercontent.com/linonetwo/zazu-tldr/master/doc/image/screenshot.png)

### tinytacoteam/zazu-fallback 调用搜索引擎，添加自己常用的搜索引擎

如果自己写一个 JS 爬虫脚本爬取搜索引擎的结果并返回给 Zazu 的话，就能像 zazu-tldr 那样即时返回结果了。但如果懒得写这样的脚本，而 Github 上也还没有现成的脚本分享怎么办呢，可以在 zazu-fallback 里面添加想用的搜索引擎的查询 URL，让 zazu-fallback 这个脚本把你要查询的关键字拼在查询 URL 后面，打开浏览器执行搜索就好了。

这个功能类似于 Chrome 的「自动保存用过的搜索引擎」还有 Firefox 的「搜索引擎书签」：

![图 my search engine list](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/alfred/mysearchengine.png)

总之我是把之前加到 Firefox 里面的「搜索引擎书签」都直接搬了过来……

## 还有没有更多用处？

之前我在[用浏览器输入框代替Alfred](https://onetwo.ren/%E7%94%A8%E6%B5%8F%E8%A7%88%E5%99%A8%E8%BE%93%E5%85%A5%E6%A1%86%E4%BB%A3%E6%9B%BFAlfred/) 里写道：

> 当然，不得不承认 Alfred 等工具能调用 AppleScript，从而管理大量自定义服务（我刚刚定义的「唤起并打开浏览器新标签页」就是一个自定义服务），可以想见，当我自定义了数十个这样的服务后，可能会记不清其快捷键，这就是 Alfred 上场的时候了。

现在我算是有一个本地的自定义服务了（查询翻译并添加到本地的 Anki 笔记里），但暂时还没遇到需要更多本地服务的场景，毕竟大多数自动化操作都由 VSCode 的插件和 Task 完成了。Zazu 暂时还是没有特别大的用处，毕竟实际上只有一个调用本地服务的 JS 脚本需要它来管理。

可能当我不再从事编码工作，离开 VSCode 等高度自动化的环境，进入传统办公的蛮荒之地的时候，Alfred、Zazu 这样的脚本服务管理器才会发挥出巨大的威力吧。

（划掉）最后，如果想试试看的 Mac 用户可以在百度盘下载，其他平台用户请从源码自行打包，因为我目前没有其他平台的机器，而自动打包的权限在 tinyzazuteam 那边（这说明了 MIT 协议其实只放开了源码，而没有放开 merge PR、CI 流程的权限的话，开源项目其实还是掌握在原始开发者手里嘛），我也没空自己重新配流程，所以目前最新版只有 Mac 版本，其他平台的只有未经我升级 Electron 版本的旧版啦。（/划掉）

我已经获得了 tinyzazuteam 的 Member 权限，获取了 CI 流程的控制权，现在已发布最新版到官网 [Download Zazu](http://zazuapp.org/download/) 欢迎下载！
