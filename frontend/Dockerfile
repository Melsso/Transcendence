FROM node:slim AS builder

WORKDIR /app

COPY . .

ARG ACTIVE_HOST
ENV ACTIVE_HOST=${ACTIVE_HOST}

RUN npm install
RUN npm run build

FROM nginx:alpine AS ssl-builder

WORKDIR /app

RUN apk add --no-cache openssl

RUN mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 \
    -subj "/CN=localhost" \
    -newkey rsa:2048 -keyout nginx.key -out nginx.crt
 
    
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html/dist
COPY --from=builder /app/bootstrap /usr/share/nginx/html/bootstrap
COPY --from=builder /app/assets /usr/share/nginx/html/assets
COPY --from=builder /app/styles /usr/share/nginx/html/styles
COPY --from=builder /app/scripts /usr/share/nginx/html/scripts
COPY --from=builder /app/media /usr/share/nginx/html/media
COPY --from=builder /app/package.json /usr/share/nginx/html/package.json
COPY --from=builder /app/index.html /usr/share/nginx/html/index.html
COPY --from=builder /app/fonts /usr/share/nginx/html/fonts

COPY --from=ssl-builder app/nginx.crt /etc/nginx/ssl/nginx.crt
COPY --from=ssl-builder app/nginx.key /etc/nginx/ssl/nginx.key

EXPOSE 443
EXPOSE 80