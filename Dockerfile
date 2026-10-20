FROM nginx:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/
RUN mkdir -p /data
RUN test -s /usr/share/nginx/html/index.html && test -s /usr/share/nginx/html/education/index.html && test -s /usr/share/nginx/html/enterprise/index.html && test -s /usr/share/nginx/html/portal-assets/salon-qr.png && nginx -t
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --spider -q http://127.0.0.1/ || exit 1
