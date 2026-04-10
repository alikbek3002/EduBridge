#!/bin/sh
set -e
: ${PORT:=80}
: ${VITE_API_URL:=}

if [ -n "${VITE_API_URL}" ]; then
	API_PROXY_LOCATION=$(cat <<EOF
    location /api/ {
        proxy_pass ${VITE_API_URL};
        proxy_http_version 1.1;
        proxy_set_header Host \$proxy_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_ssl_server_name on;
    }
EOF
)
else
	API_PROXY_LOCATION=''
fi
export API_PROXY_LOCATION

# Replace nginx template
envsubst '$PORT $API_PROXY_LOCATION' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# At runtime, if VITE_API_URL is provided, patch built JS files to point to the correct backend
if [ -n "${VITE_API_URL}" ]; then
	echo "[entrypoint] Rewriting built assets to use VITE_API_URL=${VITE_API_URL}"
	# Replace runtime placeholder and legacy localhost fallback with the runtime URL
	find /usr/share/nginx/html -type f -name '*.js' -print0 | xargs -0 sed -i \
		-e "s#__VITE_API_URL__#${VITE_API_URL}#g" \
		-e "s#http://localhost:8000#${VITE_API_URL}#g" || true
fi

exec nginx -g 'daemon off;'
