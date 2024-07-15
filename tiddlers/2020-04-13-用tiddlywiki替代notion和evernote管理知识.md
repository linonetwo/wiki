---
layout: post
title: '用TiddlyWiki替代Notion和EverNote作为个人知识管理系统'
date: 2020-04-13 15:58:31 +0800
image: 'blog-author.jpg'
description: '不仅免费，而且好用还好看，那它的缺点是什么？'
main-class: 'memo'
color: '#9E9E9E'
tags:
  - memo
categories: Journal
twitter_text:
introduction: '配置免费云同步的非线性知识管理系统 TiddlyWiki，身兼私有笔记系统和公开 Wiki 二职'
---

我的 Wiki：[onetwo.ren/wiki](https://onetwo.ren/wiki/)

注意：我正在开发一个零配置的 TiddlyWiki 桌面版 APP [tiddly-gittly/TiddlyGit-Desktop](https://github.com/tiddly-gittly/TiddlyGit-Desktop)，欢迎 star 和 watch（点 Watch Release Only 可以在我发布新版时在 Github 上收到推送提醒）

目前已经不需要按着本教程的步骤来自己配置啦，用这个一键打开即可使用强大美观好用的 TiddlyWiki。有疑问可以加入 TiddlyWiki 爱好者 QQ 群 946052860 ，或用 Bing 搜索微信群集智俱乐部注意力与知识管理群加入我所在的知识管理社区一起讨论。

---

我曾经用过很多年的印象笔记，里面装着四处收集来的碎片内容，比如[什么是「共产中文腔调」？ - 调查类问题 - 知乎](http://www.zhihu.com/question/19687065)、我高考的分数截图等等；我也用了几年的 Notion，用它记待办事项、给认识的人写备忘小传；我还用了很久的 Anki，用它把英语单词、数学公式、算法套路等碎片知识装进脑中；我也了解过 Roam Research，它可以通过双向链接增加笔记的可发现性。

但这些工具似乎都不关注两个对我来说很关键的概念：「元信息」和「自动化」。我认为，只有能充分保存元信息的自动化的知识管理系统才能称得上「好用」。

这么说来，个人知识管理系统似乎有一个不可能三角：**免费-好用-好看，只能拥有其中两样**。Notion 要付费、印象笔记不好用、Quip 和飞书等系统不是为个人服务的……

然而 [TiddlyWiki](https://tiddlywiki.com/) 似乎打破了这个不可能三角，引入了第四个元素：它 **免费、好用，还蛮好看** ，唯一的缺点就是需要具备动手能力才能把积木式的它拼成自己想要的形状。对于有动手能力的人来说，它就是完美的。

![截图 - Tiddlywiki 桌面应用：桌面版笔记工具](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/tiddlywiki-desktop-nodejs-webcatalog.png)
（↑ 图：Tiddlywiki 桌面应用：桌面版笔记工具）

![截图 - Tiddlywiki 桌面应用：目录栏快速搜索小工具](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/menubar-tiddlywiki-quick-search-tool.png)
（↑ 图：Tiddlywiki 桌面应用：目录栏快速搜索小工具）

首先我来简单谈谈我心中 TiddlyWiki 的美观、免费和强大之处。

## 美观的 TiddlyWiki

我之前喜欢 Notion 的一个重要理由就是它的设计很好看，所以我配置自己的 wiki 时，就打开 notion 网页版，用开发者工具复制它的样式表，择其善者而从之。

### 添加自定义样式

给一个 Tiddler 加上 `$:/tags/Stylesheet` 标签即可让它在 wiki 启动时加到 wiki 的样式表里，例如我就在[自定义链接样式](https://onetwo.ren/wiki/#%E8%87%AA%E5%AE%9A%E4%B9%89%E9%93%BE%E6%8E%A5%E6%A0%B7%E5%BC%8F)里黏贴适配了 Notion 的链接的样式，鼠标悬浮后会低调地变色，凸显一种简约的尊贵。

我还通过添加 `backdrop-filter` 给各种地方加上了毛玻璃效果。等未来不流行毛玻璃效果了，我自己再把它重新设计为最流行的样子。

## 免费的 TiddlyWiki

往 TiddlyWiki 里拖很多图片之后，通过 now.sh 发布的博客可能会越变越大。所以我通过[把图片文件的链接改成指向 Github 上的图片](https://onetwo.ren/wiki/#%E5%A4%96%E7%BD%AE%E6%96%87%E4%BB%B6)，来减小生成的 HTML 的体积。

这相当于把 Github 作为免费无限容量的图床来使用了，只要浏览量不是特别大，就不会收到封禁邮件。

### 数据自有

在打开我的 Wiki 后，你可以随意编辑它，这只会改动浏览器里的缓存的 wiki 内容，不会影响我电脑上本地的内容、也不会影响我 Github 上的备份。

在浏览器里的缓存变化之后， TiddlyWiki 是怎么把内容持久化到别的地方的呢？就是靠 Saver（粗粒度保存器）和 SyncAdaptor（细粒度同步器）了。

官方有一个 GitHubSaver 插件，在填入 Github Token 之后可以在移动端、桌面 Web 端直接把修改后的 Wiki 保存到 Github 上，变成一个 HTML 文件备份。
而在桌面端启动 NodeJS 版 wiki 之后，则是一个 TiddlyWebSyncAdaptor 在把修改的 Tiddler 同步到文件系统上备份。

在未来，我们可以用 [solid-tiddlywiki-syncadaptor (WIP)](https://github.com/linonetwo/solid-tiddlywiki-syncadaptor) 等自定义的同步器，把数据保存到任何我们想保存的地方，不受制于大公司，也不需要像用印象笔记一样购买会员服务。数据怎么保存、存在哪里都可以我们自己自由定制。

## 强大的 TiddlyWiki

我关注一个信息是什么，它从哪里来，要到哪里去……也就是关于信息的信息：标签、源谱、关联。我们的大脑会保存和一个信息相关的很多其他信息，而如果一个知识管理系统也同样保存了这些元信息，就可以用很贴近我们大脑的形式存储知识，让我们查找、利用知识都更加便捷。

自动化则能减少很多复制黏贴文本的劳作，还能让信息被以各种方式聚合，出现在更多地方，更容易被找到。

### 非线性写作

在我构思一篇文章时，我的思绪经常在记忆的网上游走，把很多与主题相关的碎片拼到脑中的文章里。但是，大脑和知识管理系统是不同步的，很多碎片内容并不存在于机器里，而只存在于大脑中。这时候要是先把碎片内容录入到电脑里，再回过头继续在记忆中漫游，就有可能打断漫游的思路，消弭刚刚产生的灵感。

更好的方法是，先用一个链接占坑：

```
<<reuse-tiddler "允许用git-sync脚本自动同步代码">>
```

![截图 - 通过 Transclusion 稍后再编辑具体内容](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/edit-later.png)

等整篇文章的框架写好之后，再回过头来点击「允许用 git-sync 脚本自动同步代码」的按钮，创建这篇碎片笔记，把具体内容录入其中，然后 TiddlyWiki 会自动把碎片内容填充到刚刚占的坑里。

### 重构：改善既有文档的设计

内容碎片化的好处有很多：

1. 可能会有多篇笔记要引用同样的内容，把这部分内容重构（refactor）出来，然后用 [Transclusion（嵌入）](https://tiddlywiki.com/#Transclusion)的方式把它们自动填充到多个坑里，而不是通过复制黏贴的方式填坑。这样以后如果要修改的话，改一处地方即可，不用找所有地方改，不会发生漏改的情况。
1. 可以添加段落级元信息，例如可以把一篇主题 A 的文章中的一个段落放到主题 B 的文件夹里，因为这个段落在谈主题 B。这样以后写主题 B 的文章时就很容易找到这个碎片作为参考资料。
1. 通过全文检索搜参考资料时，不用读大段的内容，可以直接看小段的参考资料是否对当下的自己有价值

既然内容碎片化好处这么大，我们肯定希望在把其他地方的内容复制黏贴到 TiddlyWiki 里的时候，就把它拆分得细一点。

这种简单的重构可以使用[文本切分插件](https://tiddlywiki.com/editions/text-slicer/)来自动切分，也可以手动臻选出以后可能自己会用到的部分，加上合适的标签（相当于放到与标签同名的文件夹里）。

### 写 JS 用户脚本自动化操作

我已经习惯了用方便的 [Copy On Select Firefox 插件](https://addons.mozilla.org/en-US/firefox/addon/copy-on-select)，现在到了 TiddlyWiki 桌面 App 里，我经常还是以为选中了就复制了，然后黏贴到别的地方才发现其实并没有复制，很不习惯。

这个功能 TiddlyWiki 显然不会自带，目前也没有搜到插件可以做这件事。所以我自己重新写了一个[适配 TiddlyWiki 的小脚本](https://onetwo.ren/wiki/#%E9%80%89%E4%B8%AD%E6%96%87%E6%9C%AC%E8%87%AA%E5%8A%A8%E5%A4%8D%E5%88%B6)，做成启动脚本。脚本比插件要轻量，不需要打包发布等等繁琐的流程，自己想要啥功能半小时写完调试好就能用。

通过把 JS 代码加上 `$:/tags/RawMarkup Tag` 、并用 `<script type="text/javascript"> </script>` 包裹，就可以让这段代码在 wiki 启动时执行了。

我在代码里就获取选区，判断当前是不是在编辑器里，如果不是就复制。

### 覆盖系统默认行为

TiddlyWiki 里几乎所有功能都是可覆盖的，一般分为三种：

1. wikitext ，主要用于写 UI，例如卡片的渲染模板，修改后可以做到「在每个卡片底下显示相关卡片」等功能
1. filter ，可以和 wikitext 结合起来写渲染模板，也可以用于「[把加了 APrivateContent 标签的笔记保存到私有仓库里面](https://onetwo.ren/wiki/#%24%3A%2Fconfig%2FFileSystemPaths)」等功能
1. JS，所有 wikitext 和 filter 最终都要依赖 JS 的实现，覆盖想要修改的 JS 可以实现「[鼠标悬浮预览插件本来不会自动关上预览窗口，我让它自动关闭](https://onetwo.ren/wiki/#%E9%BC%A0%E6%A0%87%E6%82%AC%E6%B5%AE%E9%A2%84%E8%A7%88%E5%86%85%E9%83%A8%E9%93%BE%E6%8E%A5)」等功能

TiddlyWiki 和 Anki 很相似的一点是，笔记和卡片是分离的，也就是笔记只保留内容和元信息，在 Wiki 实际运行时，才通过模板渲染为卡片。所以可以通过写 wikitext 宏或 JS 宏，来在运行时对展示做各种变换。

### 聚合数据及推理

[Datalog 及其方言](https://github.com/tonsky/datascript) 是用于输入知识还有聚合、推理、利用知识的编程语言，虽然很强大，但使用起来还是有一定门槛的。

TiddlyWiki 让我们可以用更容易学会的方式，在美观的界面里为碎片知识加上元信息，例如可以给一个「我的剪刀」的笔记，加上 `location: 客厅` 的元信息，相当于描述了知识「我的剪刀放在客厅里」。这样就可以写一个简单的 filter 来把所有放在客厅里的物品列成一个列表，展示在一个动态生成的笔记里了。

在以后你找不到剪刀的时候，就可以直接搜索「我的剪刀」，然后查看它的 `location` 字段知道它放在哪里。更可以把这些元信息传给一个问答机器人，你语音问他你的剪刀在哪，它通过简单的意图理解、检索、推理、取字段就能帮你找到客厅里的剪刀了。

### 图遍历

完善的知识体系常常是一个网状的结构，我通过[鼠标悬浮链接显示相关内容](https://onetwo.ren/wiki/#%E9%BC%A0%E6%A0%87%E6%82%AC%E6%B5%AE%E9%A2%84%E8%A7%88%E5%86%85%E9%83%A8%E9%93%BE%E6%8E%A5)这个插件（当然，经过了我自己的修改），可以展示每个笔记所在的文件夹（[文件夹即标签](https://onetwo.ren/wiki/#%E5%9C%A8%20TiddlyWiki%20%E4%B8%AD%E4%BD%BF%E7%94%A8%E8%99%9A%E6%8B%9F%E6%96%87%E4%BB%B6%E5%A4%B9)）、反向链接（链入的内容，类似 [RoamResearch](https://nesslabs.com/roam-research-alternatives)）、笔记作为一个文件夹装了什么内容（更确切地说，笔记相当于文件夹的 Readme）。

![截图 - TiddlyWiki 中的 图遍历](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/graph-traverse.png)

## 积木式的知识管理系统-如何手动配置环境

TiddlyWiki 是一个自由的软件，需要有一定的技术和折腾劲来配置它。在这一段我将介绍如何配置 TiddlyWiki，使它变成一个漂亮的桌面应用，享受免费的无限大的存储、管理私有数据、发布㐓公开的知识到博客里。

### 启动 NodeJS 版 Wiki

在[安装完 NodeJS](https://nodejs.org/zh-cn/download/) 并拥有 [Github](https://github.com/) 账号后，就可以打开 [Wiki 模板](https://github.com/linonetwo/Tiddlywiki-NodeJS-Github-Template)， 点击绿色的 Use This Template 按钮：

![截图 - Tiddlywiki 桌面应用：目录栏快速搜索小工具](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/use-this-template.png)

在接下来的表单里填好 Wiki 名字等信息（例如 `wiki`）（可能会说你给 Wiki 取的名字不行，但是有时候别管它直接点下一步也行），这样一个配置好的 Wiki 仓库就会出现在你的 Github 账号下了。

接着在你账号下刚生成的 Wiki 仓库里点击 Clone or download 按钮，点击 Open in Desktop， 就可以用[桌面应用 Github Desktop](https://desktop.github.com/) 把你的这个 Wiki 同步到桌面了。你在 Github Desktop 上就可以看到如下的界面：

![Github Desktop](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/github-desktop.png)

接着用[VSCode](https://code.visualstudio.com/)之类的代码编辑器打开刚同步下来的 Wiki 代码仓库（如果 VSCode 让你安装 git，就装），按 `ctrl + ~`（不同系统可能不一样，可以选择如下图所示用菜单打开）快捷键打开终端，输入 `npm i` 安装 wiki 所需的依赖。

![截图 - 在 vscode 里创建新的终端](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/new-terminal-chinese.png)

这一步出现 WARN 不是出错，可以继续进行下一步，只有 ERROR 才是出错。

依赖安装完成后输入 `npm run start:wikiServer` 启动本地 Wiki 服务器。当然，如果你和我一样不喜欢用命令行在终端里打字输入 `npm run start:wikiServer`，你可以像我一样可以直接展开 VSCode 上的 NPM SCRIPTS，然后点击你该点的按钮来启动 wiki 服务器：

![截图 - VSCode 里的 NPM  SCRIPTS](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/npm-script-chinese.png)

现在你应该可以在浏览器打开 [127.0.0.1:5013](http://127.0.0.1:5013/) 看到你的 wiki 了。如果打不开，可能是因为 [Edge 浏览器无法打开本地服务器提供的网页](https://www.google.com/search?client=firefox-b-d&q=edge+%E6%97%A0%E6%B3%95%E6%89%93%E5%BC%80+127)等小问题，Google 一下就能解决。

### 制作桌面 App

接着可以下载一个 [WebCatalog](https://webcatalogapp.com/)，下载打开后，点击 Create Custom App 按钮，然后如下图输入本地 wiki 的网址（注意 [http://127.0.0.1:5013/](http://127.0.0.1:5013/) 前面是 http 而不是 https），并取一个名字、加一个图标：

![截图 - Tiddlywiki 桌面应用：创建桌面应用](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/webcatalog-localhost-app.png)

（纯色图标可以下载我做的[黑色](https://github.com/linonetwo/wiki/blob/7033fc1e1ca60f4e825d4fb8dc5fc79b5bcffd3b/MemeOfLinonetwo/tiddlers/TiddlyWikiIconBlack.png)和[白色](https://github.com/linonetwo/wiki/blob/7033fc1e1ca60f4e825d4fb8dc5fc79b5bcffd3b/MemeOfLinonetwo/tiddlers/TiddlyWikiIconWhite.png)的，或者去网上搜原版蓝色的）

WebCatalog 就会帮你把你的 Wiki 打包成一个桌面 App 啦！而且打开你的 App 后，打开设置界面，里面有一个 Attach to menu bar 的选项，可以再创建一个一模一样的 APP ，勾上这个选项，作为快速搜索小工具使用。

这个快速搜索工具的网址我一般是选择填在线部署的 wiki 的网址（比如我的是 `https://onetwo.ren/wiki/`），防止两个 wiki 都和本地服务器同步，有时候会有一些 bug，因为 TiddlyWiki 一开始并不是为多用户的情况设计的。

![截图 - Tiddlywiki 桌面应用：目录栏快速搜索小工具](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/menubar-tiddlywiki-quick-search-tool.png)

因为 WebCatalog 的 App 模板是放在 Github 上的，所以如果没有对它开翻墙的话，会比较慢，需要等比较久的时间才会下载安装好，翻了墙就很快了。

### 配置用户名

注意用 VSCode 打开 `package.json` 修改一下里面的用户名，从 `林一二` 改成你的名字。

### 私有内容

之前创建的代码仓库是公开的，所以同步备份上去的 wiki 就相当于你的博客，那如果我们希望添加自己的 TodoList 等等私有内容呢？

可以到 Github 上[创建一个空白的代码仓库](https://github.com/new)，创建时设置为 private，不要加 readme 和 gitignore。我们以你给它取名为 `private-MyTiddlyWiki` 为例，你需要在之前配好的 TiddlyWiki 里点击搜索框旁边的放大镜图标，打开高级搜索，然后搜索 `$:/config/FileSystemPaths` 并修改它的内容为：

```lisp
[tag[APrivateContent]addprefix[private-MyTiddlyWiki/tiddlers/]] [tag[$:/tags/trashbin]addprefix[private-MyTiddlyWiki/tiddlers/]]
```

意思就是把加了 `APrivateContent` 这个标签的文件保存到 `/PublicWiki/tiddlers/private-MyTiddlyWiki/tiddlers` 里面。还有放进垃圾桶的文件也如是。

接着我们来准备 `private-MyTiddlyWiki` 这个文件夹，如果你用了别的名字，注意到 `package.json` 里把 `install:privateRepo` 等等命令里的它都替换成你取的名字，再继续。

同样用 Github Desktop 来 Clone 到本地（点击「Setup in Desktop），让这个代码仓库文件夹和之前 clone 下来的文件夹放在同一个目录下（比如都放在 Documents 文件夹里），然后在里面创建一个 tiddlers 文件夹，用于存放你的私有信息。

接着回到你的公有仓库里，按 `ctrl+c` 终止之前运行的 `npm run start:wikiServer`，然后运行 `npm run install:privateRepo`（windows 上是 `npm run install:windows:privateRepo`）来把私有仓库软连接到公有仓库里。

如果你给一个 Tiddler 加上 APrivateContent 这个 tag （你也可以通过修改 `$:/config/FileSystemPaths` 来改它），TiddlyWiki 就会把你加到 Wiki 里的内容保存到刚刚创建的私有仓库里的 tiddlers 文件夹里了。

### 配置开机启动和自动同步

首先按着[Git 配置文档](https://git-scm.com/docs/gitcredentials) 配好命令行的 git：

```shell
git config credential.https://github.com.username linonetwo
git config credential.helper "$helper $options"
```

这里的 `linonetwo` 改成你自己的 github 账号名。

然后打开这个仓库的网站，把 ssh 形式的仓库地址配置到本地仓库里，这是为了避免[无法同步的问题](https://github.com/simonthum/git-sync/issues/17)：

![copy-ssh](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/copy-ssh.png)

![repository-setting](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/repository-setting.png)

![use-ssh-repo](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/use-ssh-repo.png)

在终端里运行 `npm run install:wikiServer`（windows 上是 `npm run install:windows:wikiServer`）来配置开机自动启动 wiki，并顺便启动 wiki、监听两个仓库里的文件变化，一旦你新加了笔记到 Wiki 里，脚本就会倒计时三十分钟，倒计时结束后就自动同步数据到 Github 上。

这个操作在 MacOS 和 Linux 上需要在终端里输入密码，在 Windows 上会弹出多个 UAC 权限确认弹框，当然是全部点「是」了：

![截图 - Windows UAC 权限确认弹框 net](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/allow-uac-net-command-chinese.png)

![截图 - Windows UAC 权限确认弹框 tiddlywiki](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/allow-uac-tiddlywiki-chinese.png)

在 Mac 上，在终端输入 `code /Library/Logs/TiddlyWiki` 可以看到错误报告，如果说 `no permission blabla` 什么的，可以通过运行 node 访问所有文件来解决：

![截图 - Windows UAC 权限确认弹框 tiddlywiki](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/tiddlywiki/allow-node-js-access-fs.png)

如果你给一个 Tiddler 加上 APrivateContent 这个 tag，TiddlyWiki 就会把你加到 Wiki 里的内容保存到刚刚创建的私有仓库里的 tiddlers 文件夹里了，而且倒计时三十分钟后会自动备份到 Github 上你的线上私有仓库里。

### 部署公开内容为网站

既然我们有一些开放的内容，为什么不把它们发布成一个有自己域名的网站呢？这样你可以把你的一些笔记很方便地分享给朋友。

本模板中已经配置好了 Github Actions，当你备份 Wiki 到云端时，会自动把你的公开 wiki 中的内容发布为静态博客。访问地址类似 `linonetwo.github.io/wiki` ，将此处的 `linonetwo` 改成你的 Github 用户名，将 `wiki` 改成你的仓库名，有可能你之前也按我的建议设置成 `wiki` 了。

如果你已经提交过一次备份，那么就可以试着访问一下啦！

### 插件仓库

本模板中已经预置了几个插件仓库，点击右上角的「打开控制台」按钮打开 `ControlPanel` 后，就可以在「插件」标签页里点击「获取更多插件」看到它们了。

你可以安装我的 ItonNote PluginLibrary 里的各种其他插件，例如 `copy-on-select` 提供了选中即复制的快捷功能、`inverse-link-and-folder` 提供了反向链接等等。

很多插件我还开发到一半，因为我最近忙于零配置的 TiddlyWiki 桌面版 APP [tiddly-gittly/TiddlyGit-Desktop](https://github.com/tiddly-gittly/TiddlyGit-Desktop)。

### 对于非技术人员还是有点复杂的

至此，一个有桌面端 App、能自动备份、能存储隐私信息、能发布内容为网站的，强大的知识管理系统就配置好啦！

不得不说过程还是稍显繁琐的，对于曾经分别使用过其中每一项技术的我来说，设计和配置这套框架是没有特别大的阻碍的，尤其是在 Github 和 Zeit 提供了对开发者非常友好的免费服务的情况下。但是对于非程序员来说，可能就有点吃不消了。

所以还是推荐使用桌面 APP 版来一键启动。

## 结语

TiddlyWiki 的[社区论坛](https://groups.google.com/forum/#!forum/tiddlywiki)和 [Github 仓库](https://github.com/Jermolene/TiddlyWiki5)非常活跃，每天都能看到新的点子涌现出来。大家出于对这个工具的喜爱，在不断贡献自己的想法和代码来推动 TiddlyWiki 变得越加美观、强大。我也是看到一个 [Telegram 笔记讨论社区](https://t.me/joinchat/Ag98F0DdcZr1X1xS6lJsyA)里的方案分享，[得到启发才真正用起了 TiddlyWiki](https://github.com/DiamondYuan/wiki/issues/3)。

我也在做各种尝试，希望把 TiddlyWiki 和 Anki、语音助手、SoLiD POD 连接起来，让它作为一个数字化的我，承载我的各种知识，利用这些知识使我的生活变得更加便利。

如果你也为其美观、强大所动，欢迎也加入这个社区，搜索初用时疑问的解答、为其他新手解答疑惑，以及贡献自己的一技之长让更多人为其所动。
