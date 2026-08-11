# WA Shopping Bot Home Assistant Add-on Repository

Aquest repositori conté l'add-on `wa-shopping-bot` per Home Assistant.

## Estructura

- `wa-shopping-bot/` — directori de l'add-on
- `repository.yaml` — manifest de repositori addicional
- `.gitignore` — fitxers locals ignorats

## Ús recomanat

### Desplegar com a repositori Git
1. Pugeu aquest projecte a un repositori Git accessible (GitHub, GitLab, servidor local, etc.).
2. A Home Assistant, aneu a **Configuració → Add-ons → Botiga d'add-ons**.
3. Cliqueu els **3 punts (⋮)** → **Repositoris**.
4. Afegiu l'URL del repositori Git.
5. Refresqueu i instal·leu **WA Shopping Bot**.

Quan feu canvis, `git commit` + `git push` i després actualitzeu l'add-on des de la UI de Home Assistant.

### Desplegar com a repositori local d'add-ons
1. Copieu el directori `wa-shopping-bot/` a la carpeta local d'add-ons de Home Assistant, per exemple `/config/addons/local/`.
2. A Home Assistant, afegiu aquesta carpeta com a repositori local si cal.
3. Refresqueu i instal·leu l'add-on des de la UI.

## Configuració de l'add-on
La configuració de l'add-on es troba a `wa-shopping-bot/config.yaml`.

- `whatsapp_group_name` — nom del grup de WhatsApp
- `ha_token` — token llarg de Home Assistant
- `ha_url` — URL de Home Assistant
- `gemini_api_key` — clau d'API per a la categorització
- `todo_list_entity` — entitat TODO a HA

No deixeu secrets codificats a `config.yaml`; configureu-los a la UI de Home Assistant.
