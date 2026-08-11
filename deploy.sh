#!/usr/bin/env bash
set -euo pipefail

CONFIG_FILE="deploy-config.json"
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Missing $CONFIG_FILE. Copy deploy-config.example.json to deploy-config.json and edit it."
  exit 1
fi

SSH_HOST=$(jq -r '.ssh_host' "$CONFIG_FILE")
SSH_PORT=$(jq -r '.ssh_port' "$CONFIG_FILE")
SSH_USER=$(jq -r '.ssh_user' "$CONFIG_FILE")
TARGET_DIR=$(jq -r '.target_dir' "$CONFIG_FILE")

if [[ -z "$SSH_HOST" || -z "$SSH_PORT" || -z "$SSH_USER" || -z "$TARGET_DIR" ]]; then
  echo "deploy-config.json must contain ssh_host, ssh_port, ssh_user and target_dir."
  exit 1
fi

rsync -avz --delete wa-shopping-bot/ "${SSH_USER}@${SSH_HOST}:${TARGET_DIR}/"

echo "Deployed wa-shopping-bot to ${SSH_USER}@${SSH_HOST}:${TARGET_DIR}."