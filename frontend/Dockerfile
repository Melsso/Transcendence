FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf


COPY bootstrap /usr/share/nginx/html/bootstrap

COPY . /usr/share/nginx/html

EXPOSE 80