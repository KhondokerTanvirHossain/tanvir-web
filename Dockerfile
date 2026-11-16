# The portfolio as a static site on nginx. Built and pushed by .github/workflows/deploy.yml.
FROM nginx:1.27-alpine
RUN rm -f /etc/nginx/conf.d/default.conf
COPY deploy/nginx.conf /etc/nginx/conf.d/site.conf
COPY . /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/deploy
