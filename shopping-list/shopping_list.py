import os
import re
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional


class ShoppingListStore:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or os.environ.get("SHOPPING_LIST_DB", "/data/shopping_list.db")
        self._ensure_db()

    def _ensure_db(self) -> None:
        db_path = Path(self.db_path)
        db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                category TEXT NOT NULL,
                checked INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        conn.commit()
        conn.close()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _timestamp(self) -> str:
        return datetime.now(timezone.utc).isoformat()

    def infer_category(self, text: str) -> str:
        lowered = text.lower()
        rules = [
            ("Fruita i verdures", ["tomaca", "patata", "cogombre", "alberginia", "plàtan", "poma", "pera", "verdura", "enciam", "ceba", "all", "pastanaga", "carxofa", "api", "llimona", "llima", "bleda", "espinacs"]),
            ("Carn i peix", ["pollastre", "vedella", "porc", "salsitxa", "xoriço", "peix", "salmó", "llenguado", "hamburguesa", "embotit"]),
            ("Làctics", ["llet", "iogurt", "formatge", "mantega", "natilla", "crema", "flam"]),
            ("Pa i forn", ["pa", "croissant", "brioix", "magdalena", "bescuit", "boll"]),
            ("Conserves", ["sopa", "tomàquet", "olives", "atún", "sardin", "cansalada", "conserva"]),
            ("Brou i menjar preparat", ["sopa", "arròs", "pasta", "couscous", "pizza", "lasanya", "macarrons", "canelons"]),
            ("Beveratges", ["aigua", "suc", "refresc", "cervesa", "vi", "cafè", "te", "cacao"]),
            ("Neteja", ["detergent", "sabó", "paper", "esponja", "netejador", "desinfectant", "rentavaixelles", "escalfador"]),
            ("Higiene", ["paper", "sabó", "shampoo", "dentífric", "desodorant", "xampú", "colònia", "crema"]),
            ("Mascotes", ["menjar per gat", "menjar per gos", "lliuratge", "cuesca", "croqueta"]),
        ]
        for category, keywords in rules:
            if any(keyword in lowered for keyword in keywords):
                return category
        return "Altres"

    def list_items(self) -> List[Dict[str, Any]]:
        conn = self._connect()
        rows = conn.execute(
            "SELECT * FROM items ORDER BY checked ASC, created_at DESC"
        ).fetchall()
        conn.close()
        return [self._row_to_dict(row) for row in rows]

    def add_item(self, text: str, category: Optional[str] = None, checked: bool = False) -> Dict[str, Any]:
        cleaned = text.strip()
        if not cleaned:
            raise ValueError("El text no pot estar buit")
        category_name = category or self.infer_category(cleaned)
        now = self._timestamp()
        conn = self._connect()
        cursor = conn.execute(
            "INSERT INTO items (text, category, checked, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (cleaned, category_name, int(checked), now, now),
        )
        conn.commit()
        item_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        conn.close()
        return self._row_to_dict(row)

    def import_text(self, text: str) -> List[Dict[str, Any]]:
        lines = [line.strip() for line in re.split(r"[\r\n]+", text) if line.strip()]
        created = []
        for line in lines:
            created.append(self.add_item(line))
        return created

    def import_from_whatsapp_payload(self, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        candidates: List[str] = []
        if isinstance(payload, dict):
            for key in ("message", "text", "body"):
                value = payload.get(key)
                if isinstance(value, str) and value.strip():
                    candidates.append(value)
            entries = payload.get("entry")
            if isinstance(entries, list):
                for entry in entries:
                    if not isinstance(entry, dict):
                        continue
                    changes = entry.get("changes") or []
                    if isinstance(changes, list):
                        for change in changes:
                            if not isinstance(change, dict):
                                continue
                            value = change.get("value") or {}
                            if not isinstance(value, dict):
                                continue
                            messages = value.get("messages") or []
                            if isinstance(messages, list):
                                for message in messages:
                                    if not isinstance(message, dict):
                                        continue
                                    text_value = message.get("text")
                                    if isinstance(text_value, dict):
                                        body = text_value.get("body")
                                        if isinstance(body, str) and body.strip():
                                            candidates.append(body)
                                    elif isinstance(text_value, str) and text_value.strip():
                                        candidates.append(text_value)
                                    else:
                                        for key in ("message", "body", "text"):
                                            candidate = message.get(key)
                                            if isinstance(candidate, str) and candidate.strip():
                                                candidates.append(candidate)
        text = "\n".join(candidates)
        if not text.strip():
            return []
        return self.import_text(text)

    def update_item(self, item_id: int, checked: Optional[bool] = None, text: Optional[str] = None, category: Optional[str] = None) -> Optional[Dict[str, Any]]:
        updates = []
        values: List[Any] = []
        if checked is not None:
            updates.append("checked = ?")
            values.append(int(checked))
        if text is not None:
            updates.append("text = ?")
            values.append(text.strip())
        if category is not None:
            updates.append("category = ?")
            values.append(category)
        if not updates:
            return None
        updates.append("updated_at = ?")
        values.extend([self._timestamp(), item_id])
        conn = self._connect()
        conn.execute(f"UPDATE items SET {', '.join(updates)} WHERE id = ?", values)
        conn.commit()
        row = conn.execute("SELECT * FROM items WHERE id = ?", (item_id,)).fetchone()
        conn.close()
        return self._row_to_dict(row) if row else None

    def delete_item(self, item_id: int) -> bool:
        conn = self._connect()
        cursor = conn.execute("DELETE FROM items WHERE id = ?", (item_id,))
        conn.commit()
        conn.close()
        return cursor.rowcount > 0

    def list_categories(self) -> List[Dict[str, Any]]:
        conn = self._connect()
        rows = conn.execute(
            "SELECT category, COUNT(*) AS count FROM items GROUP BY category ORDER BY category"
        ).fetchall()
        conn.close()
        return [{"name": row["category"], "count": row["count"]} for row in rows]

    def clear_completed(self) -> int:
        conn = self._connect()
        cursor = conn.execute("DELETE FROM items WHERE checked = 1")
        conn.commit()
        conn.close()
        return cursor.rowcount

    def _row_to_dict(self, row: sqlite3.Row) -> Dict[str, Any]:
        return {
            "id": row["id"],
            "text": row["text"],
            "category": row["category"],
            "checked": bool(row["checked"]),
            "created_at": row["created_at"],
            "updated_at": row["updated_at"],
        }


class ShoppingListApp:
    def __init__(self, db_path: Optional[str] = None):
        self.store = ShoppingListStore(db_path=db_path)
        self._lock = threading.Lock()

    def list_items(self) -> List[Dict[str, Any]]:
        with self._lock:
            return self.store.list_items()

    def add_item(self, data: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            return self.store.add_item(
                text=data.get("text") or data.get("message") or "",
                category=data.get("category"),
                checked=bool(data.get("checked", False)),
            )

    def import_text(self, text: str) -> List[Dict[str, Any]]:
        with self._lock:
            return self.store.import_text(text)

    def import_from_whatsapp_payload(self, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        with self._lock:
            return self.store.import_from_whatsapp_payload(payload)

    def update_item(self, item_id: int, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self.store.update_item(
                item_id=item_id,
                checked=data.get("checked"),
                text=data.get("text"),
                category=data.get("category"),
            )

    def delete_item(self, item_id: int) -> bool:
        with self._lock:
            return self.store.delete_item(item_id)

    def list_categories(self) -> List[Dict[str, Any]]:
        with self._lock:
            return self.store.list_categories()

    def clear_completed(self) -> int:
        with self._lock:
            return self.store.clear_completed()
