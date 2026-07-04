import json
import os
import time
from typing import Optional
from urllib import error, request


class WhatsappBridge:
    def __init__(self, api_url: str, poll_interval: int = 5, group_name: Optional[str] = None, auth_token: Optional[str] = None):
        self.api_url = api_url.rstrip("/")
        self.poll_interval = poll_interval
        self.group_name = group_name
        self.auth_token = auth_token
        self._latest_message_id: Optional[str] = None

    def _extract_text(self, payload: object) -> str:
        if isinstance(payload, dict):
            text_value = payload.get("text")
            if isinstance(text_value, dict):
                body = text_value.get("body")
                if isinstance(body, str) and body.strip():
                    return body.strip()
            if isinstance(text_value, str) and text_value.strip():
                return text_value.strip()
            for key in ("body", "message", "text"):
                value = payload.get(key)
                if isinstance(value, str) and value.strip():
                    return value.strip()
        return ""

    def run(self) -> None:
        print("WhatsApp bridge started. Waiting for messages...")
        while True:
            try:
                messages = self._read_messages()
                for message in messages:
                    if self._should_process(message):
                        self._forward(message)
                        self._latest_message_id = message.get("id")
                time.sleep(self.poll_interval)
            except KeyboardInterrupt:
                print("Stopping bridge")
                break
            except Exception as exc:  # noqa: BLE001
                print(f"Bridge error: {exc}")
                time.sleep(self.poll_interval)

    def _read_messages(self) -> list[dict]:
        data_path = os.environ.get("WHATSAPP_BRIDGE_DATA", "./whatsapp_messages.json")
        if not os.path.exists(data_path):
            return []
        with open(data_path, "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        if isinstance(payload, dict):
            items = payload.get("messages") or []
        else:
            items = payload
        if not isinstance(items, list):
            return []
        return [item for item in items if isinstance(item, dict)]

    def _should_process(self, message: dict) -> bool:
        if self._latest_message_id and message.get("id") == self._latest_message_id:
            return False
        sender = str(message.get("sender", "")).strip()
        body = self._extract_text(message)
        if not body:
            return False
        if self.group_name and self.group_name.lower() not in sender.lower():
            return False
        return True

    def _forward(self, message: dict) -> None:
        body = self._extract_text(message)
        if not body:
            return
        payload = json.dumps({"message": body}).encode("utf-8")
        try:
            headers = {"Content-Type": "application/json"}
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            req = request.Request(self.api_url, data=payload, headers=headers, method="POST")
            with request.urlopen(req, timeout=10) as response:
                print(f"Forwarded message to shopping list: {body}")
                print(response.read().decode("utf-8"))
        except error.URLError as exc:
            print(f"Failed to forward message: {exc}")


if __name__ == "__main__":
    api_url = os.environ.get("SHOPPING_LIST_API_URL", "http://127.0.0.1:8000/api/whatsapp")
    poll_interval = int(os.environ.get("WHATSAPP_BRIDGE_POLL_INTERVAL", "5"))
    group_name = os.environ.get("WHATSAPP_BRIDGE_GROUP_NAME")
    auth_token = os.environ.get("SHOPPING_LIST_AUTH_TOKEN")
    bridge = WhatsappBridge(api_url=api_url, poll_interval=poll_interval, group_name=group_name, auth_token=auth_token)
    bridge.run()
