# Meme of LinOnetwo

Knowledge base of Lin Onetwo, with advanced filter search and faceted data aggregation.

[wiki.onetwo.ren](https://wiki.onetwo.ren/) is alias to [meme-of-lin-onetwo.now.sh](https://meme-of-lin-onetwo.now.sh/)

This repo contains the wiki backup data and script to start a local wiki server on MacOS on start up.

## Deployed to Now.sh

Procedure to deploy: [使用 Now.sh 部署 TiddlyWiki](https://wiki.onetwo.ren/#%E4%BD%BF%E7%94%A8%20Now.sh%20%E9%83%A8%E7%BD%B2%20TiddlyWiki)

## Configs

In `package.json` there is `port` for local server to listen, and `name` for the tiddlywiki data folder name.

In `now.json` there is config for deployment, see (zeit.co)[https://zeit.co/home] for detail.

## NPM Scripts

`npm run start:nodejs`: start local server.

`npm build` and `npm run build:nodejs2html`: pack tiddlywiki data to a HTML file

`npm run build:sitemap`: generate sitemap point to `wiki.onetwo.ren`

`npm run install:nodeJSWatcher`: install script who can start a local wiki server on MacOS on start up. And it will start the localhost server immediately

`npm run uninstall`: uninstall start up script

## Shell Scripts

[scripts/commit.sh](scripts/commit.sh) will commit things to local git

[scripts/sync.sh](scripts/sync.sh) will sync text to Github, automatically merge and resolve dirty things

[scripts/installNodeJSWatcher.sh](scripts/installNodeJSWatcher.sh) will be executed by npm script `npm run install:nodeJSWatcher`

[scripts/uninstall.sh](scripts/uninstall.sh) will be executed by npm script `npm run uninstall`

## Credit

Scripts are inspired by [DiamondYuan/wiki](https://github.com/DiamondYuan/wiki)
