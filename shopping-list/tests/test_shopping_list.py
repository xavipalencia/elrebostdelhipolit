import os
import tempfile
import unittest

from shopping_list import ShoppingListApp


class ShoppingListTests(unittest.TestCase):
    def setUp(self) -> None:
        fd, self.db_path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        self.app = ShoppingListApp(db_path=self.db_path)

    def tearDown(self) -> None:
        os.remove(self.db_path)

    def test_add_and_toggle_item(self) -> None:
        item = self.app.add_item({"text": "Pa"})
        self.assertEqual(item["text"], "Pa")
        self.assertEqual(item["category"], "Pa i forn")

        updated = self.app.update_item(item["id"], {"checked": True})
        self.assertTrue(updated["checked"])

    def test_import_text_creates_multiple_items(self) -> None:
        created = self.app.import_text("Llet\nPa\nTomàquet")
        self.assertEqual(len(created), 3)
        self.assertEqual(self.app.list_items()[0]["text"], "Tomàquet")

    def test_import_from_whatsapp_payload(self) -> None:
        payload = {
            "entry": [
                {
                    "changes": [
                        {
                            "value": {
                                "messages": [
                                    {"text": {"body": "Llet\nPa"}}
                                ]
                            }
                        }
                    ]
                }
            ]
        }
        created = self.app.import_from_whatsapp_payload(payload)
        self.assertEqual(len(created), 2)
        self.assertEqual([item["text"] for item in created], ["Llet", "Pa"])


if __name__ == "__main__":
    unittest.main()
