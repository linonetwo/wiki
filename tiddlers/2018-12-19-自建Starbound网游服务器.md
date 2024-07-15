---
layout: post
title: '自建 Starbound 网游服务器'
date: 2018-12-19 23:42:19 +0800
image: 'blog-author.jpg'
description: '记录了搭 Starbound 私服的过程'
main-class: 'game'
color: '#7D669E'
tags:
  - debug
  - game
categories: Journal
twitter_text:
introduction: '在阿里云上架设 Starbound 服务器踩过的一些坑，还有运维心得'
---

## StarBound

我的《[星界边境那么大，我却懒得动](https://onetwo.ren/%E6%98%9F%E7%95%8C%E8%BE%B9%E5%A2%83%E9%82%A3%E4%B9%88%E5%A4%A7-%E6%88%91%E5%8D%B4%E6%87%92%E5%BE%97%E5%8A%A8/)》这篇博客已经坑了老久了，感觉得再体验一下 Starbound 来获取一些灵感，于是我拉上朋友联机 Starbound。

以前和朋友用 Steam 连 Starbound 的时候，如果我用我的台式电脑来作为主机，朋友跟我在一个局域网，那样联机体验还不错。但是如果不在同一个屋子里联机的时候，体验就好不起来了，而且换电脑之后星球上的建筑等数据是不会被 Steam 云同步的，只有角色数据会云同步，要是能自己搭一个服务器，就可以当网游玩了，不用担心备份和 Steam 联机的延迟啦。

### 国外服务器用不得

于是我先拿自己的 vultr 服务器试了一下，感觉国外 ping 值 200ms 以上的话，联机体验还是不行，有时候会看到朋友的角色定住不动，或者朋友反映怪打不死之类的。后来换到阿里云就好多了，基本和在一个屋子里玩一样了。

我 18 年使用了阿里云学生版，进入副本会卡，但是便宜。20 年我采用华为云按需计费。

注意要在网络权限组里开启 21025 端口。

### 使用 LinuxGSM

最开始我参考了一个讲如何手工用 steam 命令行工具下载游戏然后用 `screen` 这个 Linux 程序来维护服务器的[教程](https://steamcommunity.com/sharedfiles/filedetails/?l=german&id=200785834)，还有 [Guide:LinuxServerSetup](https://starbounder.org/Guide:LinuxServerSetup)。

不过后来我发现这实在是不好维护，还是使用自动化的工具 [LinuxGSM](https://linuxgsm.com/lgsm/sbserver/) 来得好，这是一个守护 starbound 游戏服务器的程序，还能自动安装游戏，反正能省去一些手工劳动吧。

### LinuxGSM 教程中没提及的部分

我们的安装流程是：

1. 安装 LinuxGSM （看官方教程即可）
1. 配置用户名密码和 Hosts
1. 配置 Steam Guard
1. 安装 Mod
1. 启动游戏

注意官网教程中的依赖少了以下几项，需要自己额外安装上：

```shell
apt install libsdl2-2.0-0 libsdl2-2.0-0:i386 # 解决报错 SDL not found and Failed to set thread priority: per-thread setup failed
apt install jq netcat lib32stdc++6 steamcmd # steamcmd 的依赖
```

由于众所周知的原因，我们需要用 root 账号输入 `vim /etc/hosts` 添加以下的域名解析（若 LinuxGSM 下载脚本失败说明第一个失效，若 steam 无法更新说明第二个失效，需自行更换为有效的）：

```hosts
# gfw
199.232.4.133 raw.githubusercontent.com
104.78.74.220 steamcommunity.com
```

接着需要按 LinuxGSM 教程中的方法将自己的用户名密码填写到[指定位置](https://docs.linuxgsm.com/steamcmd#steam-user-login)。

```
steamuser="linonetwo012"
steampass='pswd'
```

安装过程中要注意自己的邮箱，如果收到了 Steam 发来的邮件，而且安装过程卡住如下，则需要黏贴上刚收到的验证码，然后按回车：

```shell
sbserver@starbound-game:~$ ./sbserver update
[ ERROR ] Updating sbserver: No appmanifest_211820.acf found
[ INFO ] Updating sbserver: Forcing update to correct issue
[ START ] Updating sbserver: SteamCMD
RFXJR

Redirecting stderr to '/home/sbserver/.local/share/Steam/logs/stderr.txt'
[  0%] Checking for available updates...
```

我是在第一次 `./sbserver install` 的时候安装失败了，因为没有输入验证码就无法下载游戏，所以我用 `./sbserver update` 再次安装。

然后再开始安装 `./sbserver install`，装的时候注意输入验证码。

#### 安装 Mod

先进入 steamcmd，用如下命令找到 Steam 安装目录，steam 从创意工坊下载的 mod 都会放在里面，我们需要配置 Starbound 服务器找到这些 mod。

```
Steam>install_folder_list
Index 0 = "/home/sbserver/.local/share/Steam" 27.92 GB free disk space
```

这也就是我们要在下面的 `serverfiles/linux/sbinit.config` 里用 `../../.local/share/Steam/steamapps/workshop/content/211820` 的原因。

安装 mod 得一个个输入 mod 在创意工坊的代码，然后用 steam 的命令行工具来安装，mod 的创意工坊代码就是其网址 [`https://steamcommunity.com/sharedfiles/filedetails/?id=807695810`](https://steamcommunity.com/sharedfiles/filedetails/?id=807695810) 中 `id=` 后面的那串数字。

好在我早就把自用的 mod [放进了一个合集里](https://steamcommunity.com/sharedfiles/filedetails/?id=1267792017)，以前是方便了联机的朋友一键订阅，现在就是可以从它直接生成自动操作 steam 命令行工具的脚本，不过因为我不是很熟悉 sed 和 tee 的用法，有时候脚本内容会被追加到 `moddownload.sh` 里面，有时候却不会，不是很稳定：

```shell

echo login 账号填这 密码填这 > moddownload.sh && curl -s --data "collectioncount=1&publishedfileids[0]=合集的ID填这" https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/ \
| jq '.response.collectiondetails[] | .children[] | .publishedfileid' \
| sed 's/^/workshop_download_item 211820 /' | tee -a moddownload.sh && echo quit >> moddownload.sh && steamcmd +runscript /home/sbserver/moddownload.sh
```

接着要用另一个脚本生成 `serverfiles/linux/sbinit.config` ，它就相当于你想启动的 mod 的列表，里面放了一大列 steam 命令行工具下载了的 mod 的存放路径：

```shell
echo -e "{\n  \"assetDirectories\": [\n    \"../assets/\",\n    \"../mods/\",\n    " && \
curl -s --data "collectioncount=1&publishedfileids[0]=合集的ID填这" https://api.steampowered.com/ISteamRemoteStorage/GetCollectionDetails/v1/ \
| jq '.response.collectiondetails[] | .children[] | .publishedfileid' \
| sed 's#^#"../../.local/share/Steam/steamapps/workshop/content/211820/#' | sed 's#/"#/#' | tr -t '\n' ',' && \
echo -e "\b\b\n  ],\n  \"storageDirectory\": \"../storage/\"\n}\n"
```

这些脚本都参考自 [LinuxGSM/issues/1623](https://github.com/GameServerManagers/LinuxGSM/issues/1623)。

这里我踩过的坑有：

1. 没有检查生成的 `sbinit.config`是不是一个合法的 JSON，有一次数组的最后一项后面多带了一个逗号，结果 starbound 服务器就无法启动了。
2. 里面的 mod 路径是不是指向 steam 下载的 mod 们，因为 LinuxGSM 也会维护一个 mod 文件夹，结果我的 `sbinit.config`一直指向的是这个文件夹，当我用 steam 命令行工具更新了 mod 之后，LinuxGSM 维护的 mod 文件夹是不变的，于是我就一直很奇怪为什么 mod 没更新。
3. 有的 mod 会冲突，导致 `Exception caught in client main loop, eof reached` 等报错，可能是因为 Enhanced Storage 等 mod 与其他某个 mod 冲突了，而互相影响的 mod 太多了形成了复杂的网络无法找到是其他哪几个 mod 影响了 Enhanced Storage，所以只好把 Enhanced Storage 卸掉。
4. 有时候服务端的 mod 比客户端的少，例如我在 `sbinit.config` 里面指向了错误的 mod 文件夹，导致客户端有 70+个 mod，而服务端只有 ~50 个 mod，这就会在登录服务器时导致服务端报错（可以在 log 里看到具体错误信息），而客户端报的错就会是 `incoming client packet has caused an exception` 。

即使服务端和客户端开启的 mod 列表是完全相同的，在登录服务器时还是会提示 `Assets mismatch between client and server, and the override option is not set` 。那解决办法当然就是让所有玩家都在客户端的设置里打开 `Allow Assets Mismatch` ，只要两边 mod 真的是对应的，打开之后就能正常登录服务器了。但是打开之后总感觉就失去了一个测试点，像之前客户端服务端 mod 数量真的不对应的时候，就没人来帮我们做检查了。

之前在 vultr 上试着开服的时候，服务器总是卡在这三步中的某一步上：

```log

[22:35:02.148] [Info] Root: Loaded RadioMessageDatabase in 0.106177 seconds
[22:35:10.984] [Info] Root: Loaded ItemDatabase in 14.4328 seconds
[22:35:12.441] [Info] Root: Loaded CollectionDatabase in 10.2919 seconds
```

我就猜想可能是可怜的破服务器仅有的 1G 内存用光了，于是我就照着 ArchLinux 的维基创建了 5G 的交换文件 [wiki.archlinux.org/Swap\_(简体中文)](<https://wiki.archlinux.org/index.php/Swap_(%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87)>)，不得不赞这个维基之清晰，从上面复制黏贴命令一般不会踩到坑。

然而在载入巨大大副本的时候服务器还是会爆卡，客户端上就是一直卡在 beam down 的过程中了，用 `top` 一看原来是因为服务器的物理内存不足，然后 kswapd0 进程就会占用大量 CPU 算力来搬运内存中的游戏数据到 swapfile 里。这么勤劳干嘛呢，这些游戏数据是一个只用不到 20 分钟的副本的。而因为它的勤劳，我在副本里行动都一卡一卡的。

于是我在 `/etc/sysctl.conf` 里设置了 `vm.swappiness = 5` ，果然显著降低了 kswapd0 搬运内存的意愿，现在只有内存仅剩 5% 的时候它才开始搬运内容啦~再进入副本果然就是一点也不卡了。

然后未雨绸缪，我打算把 sbserver 用户下的所有进程的优先级都默认提高，遂创建 `/etc/security/limits.d/sbserver-priority.conf` 文件，写入 `sbserver hard priority -20` ，把默认的 nice 值提到和 kswapd0 一样高。重启后再用 `ps -efl | grep starbound` 一看，果然 nice 都变成和系统进程一个级别的 -20 了，而优先级会比系统进程的 80 低一点，只有 60，这样游戏流畅的同时系统应该也不会崩吧。

### 开机启动

我选用了[linux设置开机自启动脚本的最佳方式](https://blog.csdn.net/qq_35440678/article/details/80489102)里 contab 那种，新建了一个 sh 文件来执行 `@reboot /home/sbserver/start_sb_at_boot.sh`，sh 的内容为 `cd /home/sbserver && ./sbserver start`，要记得 `chmod +x ./start_sb_at_boot.sh`

### 查看 Log

可以用 `./sbserver console` 来看 log。

退出是 `ctrl+b` 再按 `d`，而不是 `ctrl+c`。

最后要赞美 [zeit 公司](https://zeit.co/)，他们开发的 [serve](https://www.npmjs.com/package/serve) 在我查看 mod 列表、阅读 log、翻阅 mod 路径的过程中起了很大的作用。在装好 nodejs 之后，再装上 serve，然后 `serve /home/sbserver` ，就可以用这个简洁易用的 web 界面来查看服务器上的数据了。（当然要事先在服务器的安全组里设置 5000 端口仅能从我自己的电脑的 IP 可访问，以保证安全）

![log1](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/starbound/log1.png)

![log2](https://raw.githubusercontent.com/linonetwo/linonetwo.github.io/master/assets/img/posts/starbound/log2.png)

## Factorio

Starbound 坏就坏在它是手工小作坊，制造物品和整理物品都很繁琐。于是我又和朋友开始玩 Factorio。有了 Starbound 的经验，我立即选择使用 [LinuxGSM](https://linuxgsm.com/lgsm/fctrserver/) 安装 Factorio。

### Mod

Factorio 的 Mod 不是通过 Steam 管理的，所以需要手动上传到服务器上。我使用 [www.npmjs.com/package/upload-server-1](https://www.npmjs.com/package/upload-server-1) 来上传我在用的 Mod 和 Mod 配置。

在 Mac 上，Mod 位于 `~/Library/Application\ Support/factorio/mods`，用「访达」的「前往文件夹…」功能进去之后，我在服务器上运行 `upload-server -p 5000 -f ./mods` 启动一个上传服务器（先在服务器管理系统的防火墙设置里把 5000 端口的 TCP 出入打开），在上传文件里把刚刚打开的 Mac 上的 Mod 文件夹拖进去。

上传的时候好像出了点问题，不过接着我用 `serve .` 启动一个静态文件服务器（[www.npmjs.com/package/serve](https://www.npmjs.com/package/serve)），看到所有文件都成功放到 `~/serverfiles/mods` 里面了。

### 配置

一开始服务端没有报错，但是客户端说无法连接，查了老半天没用的资料我才意识到要先同步服务端和客户端的 Mod。

等 Mod 列表完全一致之后，服务器启动后很快就退出了，用 `serve` 起一个服务器看 log ，发现最后的报错是 `Error ServerMultiplayerManager.cpp:96: MultiplayerManager failed: "Error while running on_init: Given seed value (34186445404) is too big, the data type allows values from 0 to 4294967295`，看来这个复杂的 Mod 没有适配多人模式。在 `./serverfiles/mods/mod-list.json` 里将它关掉就好了。

这时我还是连不上，用 `./fctrserver console` 查看运行情况，发现出现了 `factorio Error ServerMultiplayerManager.cpp:633: Matching server connection failed: Error when creating server game: Missing token.`，经过一番调查，才知道原来要把 config 里面的 `username` 和 `password` 填上论坛的账号密码才行。不过填了还是没法解决这个问题，我才发现原来用 LinuxGSM 创建的游戏，会读取另一个配置文件 `./serverfiles/data/fctrserver.json`，在这个文件里修改就解决了这个问题。

但还是出现 `Refusing connection for address (IP ADDR:({xxx:7018})), username (linonetwo012). UserVerificationMissing`，这是因为配置文件里开了 `"require_user_verification": true,`，校验不成功可能是因为我没有公网 IP，将这一项改为 `false` 就能连上了。
