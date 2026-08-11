# 🛒 WA Shopping Bot per Home Assistant

Bot que escolta un grup de WhatsApp, categoritza articles amb IA (Claude) i els afegeix automàticament a la llista de la compra de Home Assistant.

---

## Arquitectura

```
Grup WhatsApp família
        ↓
  Add-on HAOS (whatsapp-web.js)
        ↓  Claude API categoritza
  HA Todo List  ←→  llista.html
        ↓
  Tailscale → família accedeix des de qualsevol lloc
```

---

## Pas 1 — Prepara Home Assistant

### 1.1 Activa la integració Todo

1. Ves a **Configuració → Integracions**
2. Cerca **"To-do list"** i activa-la
3. Ves a **Configuració → Àrees i zones → To-do lists**
4. Crea una nova llista anomenada `shopping_list`
5. L'entity ID serà `todo.shopping_list`

### 1.2 Crea un Long-Lived Access Token

1. Clica el teu avatar (baix esquerra a HA)
2. Ves a **Seguretat → Tokens d'accés de llarga durada**
3. Clica **"Crear token"** → posa-li nom "WA Shopping Bot"
4. **Copia el token i guarda'l** — no el podràs veure mai més

---

## Pas 2 — Instal·la l'Add-on

### 2.1 Copia els fitxers a HAOS

Tens dues maneres d'accedir al sistema de fitxers de HAOS:

**Opció A: Add-on "Studio Code Server" (recomanat)**
1. Instal·la l'add-on **"Studio Code Server"** des de la botiga d'add-ons de HA
2. Obre'l i navega fins a `/addon_configs` o usa el terminal

**Opció B: Add-on "SSH & Web Terminal"**
1. Instal·la **"SSH & Web Terminal"** des de la botiga
2. Connecta via SSH a `ssh root@[ip-ha] -p 22222`

### 2.2 Crea l'estructura de directoris

Via terminal SSH o el File Editor, crea:

```
/addons/wa_shopping_bot/
  ├── config.yaml
  ├── Dockerfile
  ├── run.sh
  └── src/
      ├── package.json
      ├── index.js
      └── categorizer.js
```

Comandes SSH:
```bash
mkdir -p /addons/wa_shopping_bot/src
```

Ara copia el contingut de cada fitxer d'aquest paquet als seus destins.

### 2.3 Afegeix el repositori local a HA

1. A Home Assistant, ves a **Configuració → Add-ons → Botiga d'add-ons**
2. Clica els **3 punts (⋮)** a dalt a la dreta → **Repositoris**
3. Afegeix: `/addons` (si uses repositori local)
4. Refresca — hauries de veure **"WA Shopping Bot"** a la llista

### 2.4 Desplegament via Git (recomanat)

La manera més neta de mantenir aquest add-on és amb Git. Si tens aquest projecte en un repositori GitHub o un repositori accessible per Home Assistant, evita fer còpia manual de fitxers.

1. Pujar el directori `wa-shopping-bot/` a un repositori Git accessible.
2. A Home Assistant, ves a **Configuració → Add-ons → Botiga d'add-ons**.
3. Clica els **3 punts (⋮)** → **Repositoris**.
4. Afegeix l'URL del teu repositori Git.
5. Refresca i instal·la l'add-on directament des de la UI.

Quan facis canvis al codi, certifica `git commit` + `git push` i després actualitza l'add-on des de la UI.

### 2.5 Configura l'add-on

1. Clica l'add-on → **Configuració**
2. Omple els camps:

```yaml
whatsapp_group_name: "Compra família"   # Nom EXACTE del grup de WhatsApp
ha_token: "eyJ0eXAi..."                 # El token del Pas 1.2
ha_url: "http://supervisor/core"        # Deixa-ho així (comunicació interna)
claude_api_key: "sk-ant-..."            # La teva clau de l'API de Claude
todo_list_entity: "todo.shopping_list"  # L'entity ID de la llista
```

> ⚠️ El nom del grup ha de ser **idèntic** al que apareix a WhatsApp, incloent majúscules i accents.

---

## Pas 3 — Escaneig del QR (primera vegada)

1. Inicia l'add-on
2. Ves a la pestanya **"Log"** de l'add-on
3. Hauries de veure un codi QR en ASCII al log
4. Obre WhatsApp al mòbil → **Dispositius vinculats → Vincular dispositiu**
5. Escaneja el QR del log

La sessió queda guardada a `/config/wa-shopping-bot/session` i no caldrà tornar a escanejar llevat que tanquis la sessió manualment.

---

## Pas 4 — Puja la llista interactiva

1. Copia `llista.html` a `/config/www/llista.html`

Via SSH:
```bash
cp /addons/wa_shopping_bot/src/llista.html /config/www/llista.html
```

2. La llista serà accessible a:
   - **Xarxa local:** `http://[ip-ha]:8123/local/llista.html`
   - **Via Tailscale:** `http://homeassistant.local:8123/local/llista.html`

3. La primera vegada que obris la llista al navegador, clica **"Configurar"** i omple:
   - URL: `http://[ip-ha]:8123`
   - Token: el mateix Long-Lived Token del Pas 1.2
   - Entitat: `todo.shopping_list`

---

## Pas 5 — Comparteix amb la família via Tailscale

1. Assegura't que Tailscale està instal·lat a l'add-on de HA (o a la VM)
2. Comparteix la URL de la llista amb la família:
   `http://[nom-tailscale]:8123/local/llista.html`
3. O crea un **panel de Lovelace** tipus iFrame que apunti a la llista

---

## Ús diari

### Afegir articles (des de WhatsApp)
Escriu al grup qualsevol cosa:
```
Llet, pa de motlle
Pomes i plàtans
Detergent i gel de dutxa
```
El bot respon confirmant els articles afegits i Claude els categoritza automàticament.

### Comandes especials al grup
| Comanda | Acció |
|---------|-------|
| `!llista` | Mostra la llista actual al xat |
| `!netejar` | Elimina tots els articles marcats com a fets |

### Marcar articles (des de la llista)
- Obre la URL de la llista al mòbil o navegador
- Toca qualsevol article per marcar-lo com a fet
- Els canvis es sincronitzen amb HA en temps real

---

## Obtenir la clau de l'API de Claude

1. Ves a [console.anthropic.com](https://console.anthropic.com)
2. Crea un compte o inicia sessió
3. Ves a **API Keys → Create Key**
4. Copia la clau (comença per `sk-ant-`)

> 💡 El cost és mínim: categoritzar 10 articles costa ~0,001€. Amb ús normal de família, no arribaràs a 1€/mes.

---

## Solució de problemes

**El QR no apareix al log**
→ Comprova que Chromium s'ha instal·lat correctament al Dockerfile
→ Revisa els logs d'error a l'inici de l'add-on

**"No s'ha trobat el grup"**
→ El nom del grup ha de ser exactament igual, inclosos espais i accents
→ El número de WhatsApp ha d'estar al grup

**La llista no es carrega**
→ Verifica que el token és correcte i no ha caducat
→ Comprova que l'entitat `todo.shopping_list` existeix a HA

**La sessió de WhatsApp s'ha perdut**
→ Esborra `/config/wa-shopping-bot/session`
→ Reinicia l'add-on i torna a escanejar el QR

---

## Estructura de fitxers final

```
/addons/wa_shopping_bot/     ← add-on
/config/www/llista.html      ← llista interactiva
/config/wa-shopping-bot/     ← sessió persistent de WhatsApp
```
