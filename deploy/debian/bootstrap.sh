#!/usr/bin/env bash
set -euo pipefail

DOMAIN="257823.xyz"
WWW_DOMAIN="www.${DOMAIN}"
REPO_URL="https://github.com/koajsj/orianblog.git"
BRANCH="main"
BASE_URL="https://${DOMAIN}/"
APP_DIR="/var/www/${DOMAIN}/html"
SYNC_SCRIPT="/usr/local/bin/orianblog-sync.sh"
SERVICE_FILE="/etc/systemd/system/orianblog-sync.service"
TIMER_FILE="/etc/systemd/system/orianblog-sync.timer"
NGINX_SITE_AVAILABLE="/etc/nginx/sites-available/orianblog.conf"
NGINX_SITE_ENABLED="/etc/nginx/sites-enabled/orianblog.conf"

if [[ "${EUID}" -ne 0 ]]; then
    echo "请使用 root 运行：sudo bash deploy/debian/bootstrap.sh"
    exit 1
fi

export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y git nginx rsync nodejs npm certbot python3-certbot-nginx

mkdir -p "$(dirname "${APP_DIR}")"

if [[ ! -d "${APP_DIR}/.git" ]]; then
    git clone --branch "${BRANCH}" --depth 1 "${REPO_URL}" "${APP_DIR}"
else
    git -C "${APP_DIR}" fetch origin "${BRANCH}"
    git -C "${APP_DIR}" reset --hard "origin/${BRANCH}"
fi

cat > "${SYNC_SCRIPT}" <<EOF
#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${DOMAIN}"
BASE_URL="${BASE_URL}"
APP_DIR="${APP_DIR}"
BRANCH="${BRANCH}"

if [[ "\${EUID}" -ne 0 ]]; then
    echo "请使用 root 运行同步脚本"
    exit 1
fi

git -C "\${APP_DIR}" fetch origin "\${BRANCH}"
git -C "\${APP_DIR}" reset --hard "origin/\${BRANCH}"

cd "\${APP_DIR}"
SITE_BASE_URL="\${BASE_URL}" npm run build

for file in index.html articles.html article.html; do
    perl -0pi -e 's#https://koajsj\.github\.io/orianblog/#https://257823.xyz/#g' "\${APP_DIR}/\${file}"
done

if command -v certbot >/dev/null 2>&1; then
    certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email \
        -d "\${DOMAIN}" -d "www.\${DOMAIN}" || true
fi
EOF

chmod 755 "${SYNC_SCRIPT}"

cat > "${SERVICE_FILE}" <<EOF
[Unit]
Description=Sync Orian's Blog from GitHub

[Service]
Type=oneshot
ExecStart=${SYNC_SCRIPT}
EOF

cat > "${TIMER_FILE}" <<EOF
[Unit]
Description=Periodic sync for Orian's Blog

[Timer]
OnBootSec=1min
OnUnitActiveSec=5min
Persistent=true

[Install]
WantedBy=timers.target
EOF

cat > "${NGINX_SITE_AVAILABLE}" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} ${WWW_DOMAIN};

    root ${APP_DIR};
    index index.html;

    location / {
        try_files \$uri \$uri/ =404;
    }
}
EOF

ln -sf "${NGINX_SITE_AVAILABLE}" "${NGINX_SITE_ENABLED}"
rm -f /etc/nginx/sites-enabled/default

systemctl daemon-reload
nginx -t
systemctl restart nginx
systemctl enable --now orianblog-sync.timer

"${SYNC_SCRIPT}"

echo "部署完成：${BASE_URL}"
