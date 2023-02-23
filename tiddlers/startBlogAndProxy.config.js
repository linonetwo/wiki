const os = require("os");
const path = require('path');
const userHomeDir = os.homedir();
const wikiDir = path.resolve(userHomeDir, 'wiki');

// crontab -e */60 * * * * pm2 restart git
// That will restart git pull every hour! https://github.com/Unitech/pm2/issues/1076#issuecomment-441085488

module.exports = {
  apps : [
  {
    name: "tw",
    script: "tiddlywiki ~/wiki --listen host=0.0.0.0 port=8080 root-tiddler=$:/core/save/lazy-images tls-key=../ssl/wiki.onetwo.ren.key tls-cert=../ssl/wiki.onetwo.ren_public.crt",
    watch: ['./wiki', wikiDir, '~/wiki'],
    watch_delay: 1000,
  },
  {
    name: "git",
    script: "cd ~/wiki && git pull",
  },
  {
     name: 'proxy',
     script: '~/cpolar tls -hostname=wiki.onetwo.ren -crt=~/ssl/wiki.onetwo.ren.pem -key=~/ssl/wiki.onetwo.ren.key -region=hk https://localhost:8080',
  }]
}