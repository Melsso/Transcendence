FROM node:slim AS builder

WORKDIR /app

COPY . .

ARG ACTIVE_HOST
ENV ACTIVE_HOST=${ACTIVE_HOST}

RUN npm install
RUN npm run build

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


EXPOSE 80