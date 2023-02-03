module.exports = {
  apps : [
  {
    name: "tw",
    script: "tiddlywiki ~/wiki --listen host=0.0.0.0 port=8080 root-tiddler=$:/core/save/lazy-images tls-key=../ssl/wiki.onetwo.ren.key tls-cert=../ssl/wiki.onetwo.ren_public.crt",
    watch: ["~/wiki"],
		watch_delay: 1000,
  },
  {
    name: "git",
    script: "cd ~/wiki && git pull",
		cron_restart: '*/10 * * * *',
  },
  {
     name: 'proxy',
     script: '~/cpolar tls -hostname=wiki.onetwo.ren -crt=~/ssl/wiki.onetwo.ren.pem -key=~/ssl/wiki.onetwo.ren.key -region=hk https://localhost:8080'
  }]
}
