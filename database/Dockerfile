FROM postgres:14

# Install necessary utilities like curl and jq to fetch secrets from Vault
RUN apt-get update && apt-get install -y jq curl

EXPOSE 5432

# Copy the configure-db.sh script into the container
COPY ./configure-db.sh /usr/local/bin/configure-db.sh

# Make the script executable
RUN chmod +x /usr/local/bin/configure-db.sh

# Override the entrypoint to run configure-db.sh first and then start PostgreSQL
ENTRYPOINT ["/bin/bash", "-c", "/usr/local/bin/configure-db.sh && exec docker-entrypoint.sh postgres"]

# Ensure the PostgreSQL server starts
CMD ["postgres"]
