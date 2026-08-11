#!/usr/bin/with-contenv bashio

export WA_GROUP_NAME="$(bashio::config 'whatsapp_group_name')"
export HA_TOKEN="$(bashio::config 'ha_token')"
export HA_URL="$(bashio::config 'ha_url')"
export GEMINI_API_KEY="$(bashio::config 'gemini_api_key')"
export TODO_LIST_ENTITY="$(bashio::config 'todo_list_entity')"

bashio::log.info "Iniciant WA Shopping Bot..."
bashio::log.info "Grup objectiu: ${WA_GROUP_NAME}"

mkdir -p /config/wa-shopping-bot/session

cd /app
exec node index.js
