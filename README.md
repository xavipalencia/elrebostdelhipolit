# Llista de la compra

Aplicació local per gestionar la compra de casa amb:

- llista compartida i editable
- checklist per marcar quan ja s'ha comprat
- importació ràpida de text o missatges de WhatsApp
- categorització local, sense IA
- empaquetat com a add-on de Home Assistant

## Execució local

```bash
python server.py
```

La interfície queda disponible a `http://localhost:8000`.

## Add-on de Home Assistant

Per fer servir-ho com a add-on, copia aquesta carpeta al teu repositori d'add-ons de Home Assistant i construeix-lo.

## Flux simple de WhatsApp a la llista

Si vols que un missatge enviat al grup de WhatsApp anomenat "Llistes compra" entri directament a la llista, el flux és aquest:

1. Un programa local o un connector de WhatsApp detecta el missatge del grup "Llistes compra".
2. El missatge s’envia a `http://<la-teva-màquina-o-IP>:8000/api/whatsapp` amb un token d’autenticació.
3. El missatge s’interpreta com a text i s’afegeix a la llista.

Per a una solució simple i local, he preparat un pont que pot llegir missatges des d’un fitxer JSON i reenviar-los:

```bash
python whatsapp_bridge.py
```

Per provar-ho amb un exemple:

```bash
copy sample_whatsapp_message.json whatsapp_messages.json
python whatsapp_bridge.py
```

Exemples vàlids per a l’API:

- JSON: `{"message":"llet\npa"}`
- Text pla: `llet\npa`
- URL amb query: `/api/whatsapp?message=llet%0Apa`

Hi ha un exemple de configuració per a Home Assistant a [homeassistant/whatsapp_to_shopping_list.yaml](homeassistant/whatsapp_to_shopping_list.yaml).

## API simple

- `GET /api/items`
- `POST /api/items`
- `PATCH /api/items/<id>`
- `DELETE /api/items/<id>`
- `POST /api/whatsapp`
- `POST /api/clear-completed`
