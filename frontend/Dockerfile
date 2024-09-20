FROM nginx:alpine

COPY bootstrap /usr/share/nginx/html/bootstrap

COPY . /usr/share/nginx/html

# Still unsure about wether we need the line below or not
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80