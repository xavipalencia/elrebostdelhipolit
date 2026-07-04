import json
import os
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Dict, Optional
from urllib.parse import parse_qs, urlparse

from shopping_list import ShoppingListApp


BASE_DIR = Path(__file__).resolve().parent
TEMPLATES_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"


class ShoppingListRequestHandler(BaseHTTPRequestHandler):
    app: Optional[ShoppingListApp] = None

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/":
            self._serve_file(TEMPLATES_DIR / "index.html")
            return
        if path == "/api/items":
            payload = json.dumps(self.app.list_items()).encode("utf-8")
            self._send_json(payload)
            return
        if path == "/api/categories":
            payload = json.dumps(self.app.list_categories()).encode("utf-8")
            self._send_json(payload)
            return
        if path == "/api/whatsapp":
            query_payload = parse_qs(parsed.query)
            payload = {key: value[0] if value else "" for key, value in query_payload.items()}
            text = payload.get("message") or payload.get("text") or payload.get("body") or ""
            created = self.app.import_text(text) if text else []
            self._send_json(json.dumps(created).encode("utf-8"), status=HTTPStatus.CREATED)
            return
        if path.startswith("/static/"):
            file_path = BASE_DIR / path.lstrip("/")
            if file_path.exists() and file_path.is_file():
                self._serve_file(file_path)
                return
        self._send_error(404, "No s'ha trobat la ruta")

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        body = self._read_body()
        if path == "/api/items":
            if body:
                try:
                    payload = json.loads(body)
                except json.JSONDecodeError:
                    payload = {}
            else:
                payload = {}
            if "text" not in payload and "message" not in payload:
                form_data = parse_qs(body.decode("utf-8", errors="ignore"))
                payload = {key: value[0] if value else "" for key, value in form_data.items()}
            item = self.app.add_item(payload)
            self._send_json(json.dumps(item).encode("utf-8"), status=HTTPStatus.CREATED)
            return
        if path == "/api/whatsapp":
            auth_header = self.headers.get("Authorization", "")
            expected_token = os.environ.get("SHOPPING_LIST_AUTH_TOKEN", "")
            if expected_token and auth_header != f"Bearer {expected_token}":
                self._send_json(json.dumps({"error": "Unauthorized"}).encode("utf-8"), status=HTTPStatus.UNAUTHORIZED)
                return
            payload = self._parse_body(body)
            if isinstance(payload, dict) and (payload.get("entry") or payload.get("messages") or payload.get("changes")):
                created = self.app.import_from_whatsapp_payload(payload)
            else:
                query_payload = parse_qs(urlparse(self.path).query)
                if query_payload:
                    payload = {key: value[0] if value else "" for key, value in query_payload.items()}
                text = payload.get("message") or payload.get("text") or payload.get("body") or ""
                created = self.app.import_text(text)
            self._send_json(json.dumps(created).encode("utf-8"), status=HTTPStatus.CREATED)
            return
        if path == "/api/clear-completed":
            removed = self.app.clear_completed()
            self._send_json(json.dumps({"removed": removed}).encode("utf-8"), status=HTTPStatus.OK)
            return
        self._send_error(404, "No s'ha trobat la ruta")

    def do_PATCH(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/items/"):
            item_id = int(path.split("/")[-1])
            body = self._read_body()
            payload = self._parse_body(body)
            item = self.app.update_item(item_id, payload)
            if item is None:
                self._send_error(404, "No s'ha trobat aquest element")
                return
            self._send_json(json.dumps(item).encode("utf-8"))
            return
        self._send_error(404, "No s'ha trobat la ruta")

    def do_DELETE(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path
        if path.startswith("/api/items/"):
            item_id = int(path.split("/")[-1])
            removed = self.app.delete_item(item_id)
            if not removed:
                self._send_error(404, "No s'ha trobat aquest element")
                return
            self._send_json(json.dumps({"removed": True}).encode("utf-8"))
            return
        self._send_error(404, "No s'ha trobat la ruta")

    def _read_body(self) -> bytes:
        content_length = int(self.headers.get("Content-Length", "0"))
        return self.rfile.read(content_length) if content_length else b""

    def _parse_body(self, body: bytes) -> Dict[str, object]:
        if not body:
            return {}
        try:
            return json.loads(body.decode("utf-8"))
        except json.JSONDecodeError:
            return {"text": body.decode("utf-8", errors="ignore")}

    def _serve_file(self, file_path: Path) -> None:
        content_type = "text/html; charset=utf-8"
        if file_path.suffix == ".css":
            content_type = "text/css; charset=utf-8"
        elif file_path.suffix == ".js":
            content_type = "application/javascript; charset=utf-8"
        data = file_path.read_bytes()
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _send_json(self, payload: bytes, status: HTTPStatus = HTTPStatus.OK) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        return


def run_server() -> None:
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", "8000"))
    db_path = os.environ.get("SHOPPING_LIST_DB", "/data/shopping_list.db")
    ShoppingListRequestHandler.app = ShoppingListApp(db_path=db_path)
    server = ThreadingHTTPServer((host, port), ShoppingListRequestHandler)
    print(f"Shopping list listening on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run_server()
