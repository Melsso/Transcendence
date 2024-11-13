FROM hashicorp/vault:latest

ENV VAULT_ADDR=http://127.0.0.1:8200
ENV VAULT_API_ADDR=http://localhost:8200
ENV VAULT_STORAGE_FILE_PATH=/vault/data
ENV VAULT_DEV_ROOT_TOKEN_ID=root  

EXPOSE 8200

COPY vault-config.hcl /vault/config/vault-config.hcl
COPY vault-init.sh /vault/init/vault-init.sh

ENV VAULT_CONFIG_DIR=/vault/config

RUN chmod +x /vault/init/vault-init.sh

ENTRYPOINT ["/bin/sh", "-c", "vault server -config=/vault/config/vault-config.hcl & sleep 5 && /vault/init/vault-init.sh && tail -f /dev/null"]