FROM hashicorp/vault:1.11.3

RUN apk update && apk add --no-cache curl bash openssl

COPY ./start-vault.sh /docker-entrypoint-initdb.d/start-vault.sh
COPY ./configure-vault.sh /docker-entrypoint-initdb.d/configure-vault.sh

RUN chmod +x /docker-entrypoint-initdb.d/start-vault.sh /docker-entrypoint-initdb.d/configure-vault.sh

RUN echo "Listing contents of /docker-entrypoint-initdb.d/:" && ls -l /docker-entrypoint-initdb.d/

CMD ["sh", "/docker-entrypoint-initdb.d/start-vault.sh"]
