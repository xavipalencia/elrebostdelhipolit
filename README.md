# El Rebost del Hipòlit

Aquest repositori conté un add-on de Home Assistant per a una llista de la compra i un pont simple per a missatges de WhatsApp.

## Estructura d’add-on

Home Assistant espera un repositori amb una o més carpetes d’add-ons, cadascuna amb:
- config.yaml
- Dockerfile
- build.json

Aquest repositori usa la carpeta d’add-on:
- shopping-list

## Execució local

```bash
python server.py
```

La interfície queda disponible a http://localhost:8000.

## Afegir el repositori a Home Assistant

Utilitza aquesta URL del repositori:
https://github.com/xavipalencia/elrebostdelhipolit

## Flux de WhatsApp a la llista

Si vols que un missatge enviat al grup "Llistes compra" entri a la llista, el flux és:

1. El pont o connector detecta el missatge del grup.
2. El missatge s’envia a http://<la-teva-màquina-o-IP>:8000/api/whatsapp amb un token.
3. El missatge s’afegeix a la llista.

## API simple

- GET /api/items
- POST /api/items
- PATCH /api/items/<id>
- DELETE /api/items/<id>
- POST /api/whatsapp
- POST /api/clear-completed
