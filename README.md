# Orian's Blog

涓€涓熀浜?`HTML + CSS + JavaScript` 鐨勯潤鎬佷釜浜哄崥瀹紝閲嶇偣鏀惧湪绠€娲佺殑闃呰浣撻獙銆佽交閲忎氦浜掑拰浣庣淮鎶ゆ垚鏈€?
## 涓昏鍔熻兘

- 棣栭〉銆佹枃绔犲垪琛ㄩ〉銆佹枃绔犺鎯呴〉
- 涓婚鍒囨崲銆佽瑷€鍒囨崲
- 鏂囩珷鎼滅储銆佹帓搴忋€佹渶杩戞枃绔犲睍绀?- 鏂囩珷璇︽儏椤电洰褰曘€侀槄璇昏繘搴︺€佷笂涓€绡?/ 涓嬩竴绡囥€佺偣璧炪€佹敹钘忋€佸鍒堕摼鎺?- 鏈湴璇勮锛岃瘎璁哄瓨鍌ㄥ湪娴忚鍣?`localStorage`
- `SEO` 鍏冩暟鎹€乣robots.txt`銆乣sitemap.xml`
- 鍑忓皯鍔ㄧ敾骞叉壈锛屾敮鎸?`prefers-reduced-motion`

## 椤圭洰缁撴瀯

- `index.html`锛氶椤?- `articles.html`锛氭枃绔犲綊妗ｉ〉
- `article.html`锛氭枃绔犺鎯呴〉
- `css/style.css`锛氬叏绔欐牱寮?- `js/articles-data.js`锛氭枃绔犳暟鎹簮
- `js/blog-utils.js`锛氭枃绔犺鑼冨寲銆佹棩鏈熸牸寮忓寲銆佺粺璁′笌璇█鐘舵€?- `js/articles-home.js`锛氶椤靛拰褰掓。椤垫覆鏌撱€佹悳绱€佹帓搴?- `js/article-page.js`锛氭枃绔犺鎯呴〉娓叉煋銆佺洰褰曘€佽瘎璁轰笌浜や簰
- `js/main.js`锛氫富棰樺垏鎹€佽瑷€鍒囨崲銆佸叏绔欏姩鐢?- `tools/site.mjs`锛氭瀯寤恒€佹鏌ャ€佺敓鎴?`robots.txt` 鍜?`sitemap.xml`
- `deploy/debian/bootstrap.sh`锛欴ebian VPS 涓€閿儴缃茶剼鏈?
## 鏈湴棰勮

闈欐€佺珯鐐瑰彲浠ョ洿鎺ユ墦寮€ `index.html` 棰勮锛屼篃鍙互鐢ㄦ湰鍦伴潤鎬佹湇鍔″櫒鏌ョ湅銆?
## 鏋勫缓鑴氭湰

```bash
npm run build
npm run lint
npm test
```

- `build`锛氭鏌ユ牳蹇冭剼鏈紝骞剁敓鎴?`robots.txt`銆乣sitemap.xml`
- `lint`锛氬彧鍋氳娉曟鏌?- `test`锛氬厛鏋勫缓锛屽啀妫€鏌ョ敓鎴愮粨鏋?
濡傛灉绔欑偣鍩虹鍦板潃鍙樺寲锛屽彲浠ラ€氳繃鐜鍙橀噺鎴栧弬鏁拌鐩栵細

```bash
SITE_BASE_URL=https://example.com/blog/ npm run build
node tools/site.mjs build --base-url=https://example.com/blog/
```

## 鍙戝竷鏂囩珷

1. 鍦?`js/articles-data.js` 閲屾柊澧炰竴绡囨枃绔犮€?2. 濉ソ `slug`銆佹爣棰樸€佹憳瑕併€佹鏂囧拰鏃ユ湡銆?3. 杩愯 `npm run build`銆?4. 鎻愪氦骞舵帹閫佸埌 GitHub銆?5. 濡傛灉浣跨敤 GitHub Pages锛屾帹閫佸悗浼氳嚜鍔ㄥ彂甯冦€?6. 濡傛灉浣跨敤 Debian VPS锛屾湇鍔″櫒浼氭寜瀹氭椂浠诲姟鑷姩鎷夊彇骞跺埛鏂扮珯鐐广€?
## 鍩熷悕缃戠珯绠＄悊鐣岄潰濡備綍閰嶇疆

濡傛灉浣犲凡缁忔湁鑷繁鐨勫煙鍚嶏紝闇€瑕佸湪鍩熷悕娉ㄥ唽鍟嗘垨 DNS 绠＄悊鍚庡彴閲屽仛涓嬮潰杩欎簺鎿嶄綔銆傝繖閲岀殑鐩爣涓嶆槸鎶婄珯鐐规敼鎴愬埆鐨勫钩鍙帮紝鑰屾槸鎶婂煙鍚嶈В鏋愬埌褰撳墠 VPS銆?
### 1. 杩涘叆鍩熷悕鐨?DNS 绠＄悊椤甸潰

鐧诲綍鍩熷悕娉ㄥ唽鍟嗗悗鍙帮紝鎵惧埌绫讳技涓嬮潰鐨勫叆鍙ｏ細

- 鍩熷悕绠＄悊
- DNS 绠＄悊
- 瑙ｆ瀽璁剧疆
- 鑷畾涔夎В鏋?
### 2. 娣诲姞瑙ｆ瀽璁板綍

寤鸿鑷冲皯閰嶇疆涓ゆ潯璁板綍锛?
- `A` 璁板綍锛氫富鏈鸿褰曞～ `@`锛岃褰曞€煎～浣犵殑 VPS 鍏綉 IP
- `CNAME` 璁板綍锛氫富鏈鸿褰曞～ `www`锛屾寚鍚?`@`

濡傛灉浣犵殑娉ㄥ唽鍟嗕笉鏀寔鎶?`www` 鎸囧悜 `@`锛屼篃鍙互鐩存帴缁?`www` 鍐嶅姞涓€鏉?`A` 璁板綍锛屽€煎悓鏍峰～鍐?VPS 鍏綉 IP銆?
### 3. 鍏堝叧闂唬鐞嗭紝鍐嶇瓑璇佷功绛惧彂

濡傛灉浣犱娇鐢ㄧ殑鏄?Cloudflare 鎴栫被浼煎甫浠ｇ悊鐨?DNS 鏈嶅姟锛屽缓璁厛鎶婅В鏋愮姸鎬佽鎴?`DNS only`锛屼笉瑕佸厛寮€浠ｇ悊锛?
- 鍘熷洜鏄娆＄鍙?HTTPS 璇佷功鏃讹紝鏈嶅姟鍣ㄩ渶瑕佺洿鎺ラ獙璇佸煙鍚嶆槸鍚﹁兘瑙ｆ瀽鍒?VPS
- 绛夎瘉涔︾鍙戞垚鍔熴€佺珯鐐硅兘姝ｅ父璁块棶鍚庯紝鍐嶆寜闇€寮€鍚唬鐞?
### 4. SSL/TLS 璁剧疆

濡傛灉浣犱娇鐢?Cloudflare 鎵樼 DNS锛?
- `SSL/TLS` 妯″紡璁句负 `Full` 鎴?`Full (strict)`
- 濡傛灉 VPS 涓婂凡缁忔垚鍔熺鍙戜簡璇佷功锛屼紭鍏堜娇鐢?`Full (strict)`

濡傛灉浣犲彧鏄娇鐢ㄦ櫘閫氭敞鍐屽晢 DNS锛屼笉闇€瑕侀澶栭厤缃?Cloudflare 鐨?SSL 妯″紡锛岀洿鎺ヨ VPS 涓婄殑 `certbot` 绛惧彂璇佷功鍗冲彲銆?
### 5. 鍩熷悕鍒囨崲鏃惰鍚屾淇敼婧愮爜

濡傛灉浣犳妸绔欑偣浠庨粯璁ゅ煙鍚嶅垏鎹㈠埌鑷繁鐨勫煙鍚嶏紝闇€瑕佸悓鏃朵慨鏀硅繖涓や釜浣嶇疆锛?
- `deploy/debian/bootstrap.sh` 閲岀殑 `DOMAIN`銆乣WWW_DOMAIN`銆乣BASE_URL`
- `tools/site.mjs` 鐢熸垚鐨勭珯鍐呴摼鎺ュ拰绔欑偣鍦板潃

鏀瑰畬鍚庨噸鏂版墽琛屾瀯寤哄拰閮ㄧ讲鑴氭湰锛岀‘淇濈珯鍐呴摼鎺ャ€乣robots.txt`銆乣sitemap.xml` 閮戒娇鐢ㄦ柊鍩熷悕銆?
### 6. 濡備綍鍒犻櫎鏃ч厤缃?
濡傛灉浣犲悗闈笉鍐嶄娇鐢ㄦ煇涓棫鍩熷悕锛屽缓璁寜杩欎釜椤哄簭娓呯悊锛?
1. 鍏堝湪 DNS 绠＄悊鍚庡彴鍒犻櫎鏃у煙鍚嶅搴旂殑 `A` 璁板綍鍜?`CNAME` 璁板綍銆?2. 濡傛灉浣跨敤浜?Cloudflare锛屽啀鎶婃棫鍩熷悕浠?Cloudflare 涓Щ闄わ紝鎴栬嚦灏戝彇娑堜唬鐞嗗拰瑙ｆ瀽璁板綍銆?3. 鍦?VPS 鐨勯儴缃茶剼鏈噷鎶?`DOMAIN`銆乣WWW_DOMAIN`銆乣BASE_URL` 鏀规垚鏂扮殑鍊硷紝閬垮厤鍚屾鑴氭湰缁х画鐢熸垚鏃ч摼鎺ャ€?4. 濡傛灉鏃у煙鍚嶅凡缁忎笉鍐嶉渶瑕侊紝涔熷彲浠ラ『鎵嬪垹闄ゆ湇鍔″櫒涓婃棫绔欑偣閰嶇疆鍜岃瘉涔︼紝浣嗚繖涓€姝ヨ纭鏂板煙鍚嶅凡缁忔甯稿彲鐢ㄥ悗鍐嶅仛銆?
## 閫氳繃 Cloudflare 鎵樼鍩熷悕

杩欓噷鐨勨€滈€氳繃 Cloudflare 鎵樼鍩熷悕鈥濇寚鐨勬槸鎶婂煙鍚嶇殑 DNS 浜ょ粰 Cloudflare 绠＄悊锛岃€屼笉鏄妸绔欑偣杩佸埌 Cloudflare Pages銆?
### 1. 鎶婂煙鍚嶆帴鍏?Cloudflare

1. 鍦?Cloudflare 娣诲姞浣犵殑鍩熷悕銆?2. 鍒板煙鍚嶆敞鍐屽晢鍚庡彴锛屾妸 NS 璁板綍鏀规垚 Cloudflare 鎻愪緵鐨勪袱鏉″悕绉版湇鍔″櫒銆?3. 绛夊煙鍚嶇姸鎬佸彉鎴?`Active` 鍚庯紝鍐嶇户缁笅涓€姝ャ€?
### 2. 鍦?Cloudflare 閲岄厤缃В鏋?
濡傛灉浣犵户缁娇鐢ㄥ綋鍓嶄粨搴撴彁渚涚殑 `Debian VPS + Nginx` 閮ㄧ讲鏂瑰紡锛屽缓璁繖鏍烽厤锛?
- `A` 璁板綍锛歚@` 鎸囧悜 VPS 鍏綉 IP
- `CNAME` 璁板綍锛歚www` 鎸囧悜 `@`

寤鸿鍏堟妸璁板綍璁句负 `DNS only`锛岀瓑 HTTPS 璇佷功姝ｅ父绛惧彂鍚庯紝鍐嶆寜闇€瑕佸紑鍚?Cloudflare 浠ｇ悊銆?
### 3. 閰嶇疆 SSL/TLS

- Cloudflare 闈㈡澘閲屾妸 `SSL/TLS` 妯″紡璁句负 `Full` 鎴?`Full (strict)`
- 濡傛灉浣犱娇鐢ㄤ粨搴撹嚜甯︾殑 VPS 鑴氭湰绛惧彂璇佷功锛屽厛纭繚 `A` 璁板綍宸茬粡鐢熸晥
- 濡傛灉璇佷功绛惧彂澶辫触锛屼紭鍏堟鏌ワ細
  - 鍩熷悕鏄惁宸茬粡姝ｇ‘瑙ｆ瀽鍒?VPS
  - Cloudflare 浠ｇ悊鏄惁褰卞搷浜?HTTP 楠岃瘉
  - Nginx 鏄惁鍙互鐩存帴璁块棶绔欑偣鏍圭洰褰?
## Debian VPS 閮ㄧ讲

濡傛灉浣犺鎶婄珯鐐归儴缃插埌 `257823.xyz` 鍜屼竴鍙?Debian VPS锛屼笂绾挎祦绋嬪敖閲忚嚜鍔ㄥ寲銆?
鍓嶆彁鍙渶瑕佷竴椤癸細

- 鎶?`257823.xyz` 鍜?`www.257823.xyz` 鐨?`A` 璁板綍鎸囧悜 VPS IP

鐒跺悗鍦?VPS 涓婄洿鎺ユ墽琛岋細

```bash
curl -fsSL https://raw.githubusercontent.com/koajsj/orianblog/main/deploy/debian/bootstrap.sh | sudo bash
```

杩欎釜鑴氭湰浼氳嚜鍔ㄥ畬鎴愶細

- 瀹夎 `git`銆乣nginx`銆乣nodejs`銆乣npm`銆乣certbot`
- 鍏嬮殕浠撳簱鍒?`/var/www/257823.xyz/html`
- 杩愯 `npm run build`
- 鑷姩鐢熸垚 `robots.txt` 鍜?`sitemap.xml`
- 閰嶇疆 `Nginx`
- 鍚姩 `systemd` 瀹氭椂鍚屾
- 灏濊瘯鑷姩绛惧彂 `HTTPS` 璇佷功

閮ㄧ讲瀹屾垚鍚庯紝鏈嶅姟鍣ㄤ細姣?5 鍒嗛挓鑷姩鎷夊彇 GitHub 鏈€鏂颁唬鐮佸苟鍒锋柊绔欑偣銆?
濡傛灉浣犳兂绔嬪埢鎵嬪姩瑙﹀彂涓€娆″悓姝ワ紝鍙渶瑕佽繍琛岋細

```bash
sudo systemctl start orianblog-sync.service
```

濡傛灉璇佷功绛惧彂澶辫触锛岄€氬父鏄煙鍚嶈В鏋愯繕娌℃湁鐢熸晥銆傜瓑 `A` 璁板綍鐢熸晥鍚庯紝鍐嶆墽琛屼竴娆′笂闈㈢殑鍚屾鍛戒护鍗冲彲銆?
### VPS 里怎么删

如果你要把这套站点从 VPS 上彻底删除，建议按下面顺序执行，先停同步，再删站点文件和证书，最后清理 Nginx 配置。

```bash
sudo systemctl stop orianblog-sync.timer
sudo systemctl stop orianblog-sync.service
sudo systemctl disable orianblog-sync.timer
sudo rm -f /etc/systemd/system/orianblog-sync.service
sudo rm -f /etc/systemd/system/orianblog-sync.timer
sudo systemctl daemon-reload
sudo rm -f /etc/nginx/sites-enabled/orianblog.conf
sudo rm -f /etc/nginx/sites-available/orianblog.conf
sudo nginx -t
sudo systemctl reload nginx
sudo rm -rf /var/www/257823.xyz/html
sudo certbot delete --cert-name 257823.xyz
```

如果 `certbot delete` 提示证书名不匹配，先运行 `sudo certbot certificates`，确认实际证书名称后再删。

如果你后面还要在同一台 VPS 上部署新域名，只需要保留 `git`、`nginx`、`nodejs`、`npm`、`certbot`，把脚本里的 `DOMAIN`、`WWW_DOMAIN`、`BASE_URL` 改成新值，再重新部署即可。

## 鏁版嵁璇存槑

- 娴忚閲忋€佺偣璧炪€佹敹钘忥細瀛樺偍鍦ㄦ祻瑙堝櫒 `localStorage`
- 璇勮锛氬綋鍓嶄负鏈湴璇勮锛屼笉渚濊禆鐧诲綍鎬?- `robots.txt` 鍜?`sitemap.xml`锛氱敱 `tools/site.mjs` 鑷姩鐢熸垚
