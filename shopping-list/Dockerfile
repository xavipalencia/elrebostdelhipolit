FROM python:3.12-slim

WORKDIR /app

COPY . /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000 \
    HOST=0.0.0.0 \
    SHOPPING_LIST_DB=/data/shopping_list.db

RUN mkdir -p /data

EXPOSE 8000

CMD ["python", "server.py"]
