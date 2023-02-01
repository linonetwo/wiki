module.exports = {
  apps : [
  {
    name: "tw",
    script: "tiddlywiki ~/wiki --listen host=0.0.0.0 port=8080 root-tiddler=$:/core/save/lazy-images tls-key=../ssl/wiki.onetwo.ren.key tls-cert=../ssl/wiki.onetwo.ren_public.crt",
		watch: ['~/wiki'],
  },
  {
    name: "git",
    script: "cd ~/wiki && git pull",
		cron_restart: '0 0,12 * * *',
  },
  {
     name: 'proxy',
     script: '~/cpolar tls -hostname=wiki.onetwo.ren -crt=~/ssl/wiki.onetwo.ren.pem -key=~/ssl/wiki.onetwo.ren.key -region=hk https://localhost:8080'
  }]
}
