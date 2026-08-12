FROM ghcr.io/home-assistant/amd64-base-debian:latest

# Baileys no necessita Chromium, només Node.js
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    ca-certificates \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY src/package.json .
RUN npm install --production

COPY src/ .
COPY run.sh /run.sh
RUN chmod +x /run.sh

CMD ["/run.sh"]
