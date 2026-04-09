# Multi-stage Dockerfile for Vite React app
FROM node:22.12.0-alpine AS build
WORKDIR /app
COPY . .

RUN set -e; \
    if [ -f /app/package.json ]; then \
        npm ci; \
        npm run build; \
        cp default.conf.template /tmp/default.conf.template; \
        cp entrypoint.sh /tmp/entrypoint.sh; \
        cp -r dist /tmp/dist; \
    elif [ -f /app/frontend/package.json ]; then \
        cd /app/frontend; \
        npm ci; \
        npm run build; \
        cp default.conf.template /tmp/default.conf.template; \
        cp entrypoint.sh /tmp/entrypoint.sh; \
        cp -r dist /tmp/dist; \
    else \
        echo "Could not locate frontend package.json in build context"; \
        exit 1; \
    fi

FROM nginx:stable-alpine AS runtime
COPY --from=build /tmp/dist /usr/share/nginx/html
COPY --from=build /tmp/default.conf.template /etc/nginx/conf.d/default.conf.template
COPY --from=build /tmp/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV PORT 80
EXPOSE 80
CMD ["/entrypoint.sh"]
