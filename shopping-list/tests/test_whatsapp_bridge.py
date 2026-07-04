import unittest
from unittest.mock import patch

from whatsapp_bridge import WhatsappBridge


class WhatsappBridgeTests(unittest.TestCase):
    def test_should_process_matching_group(self) -> None:
        bridge = WhatsappBridge(api_url="http://example", group_name="Compra casa")
        self.assertTrue(bridge._should_process({"id": "1", "sender": "Compra casa", "body": "pa"}))
        self.assertFalse(bridge._should_process({"id": "2", "sender": "Altres", "body": "pa"}))

    def test_extract_text_from_nested_payload(self) -> None:
        bridge = WhatsappBridge(api_url="http://example")
        self.assertEqual(bridge._extract_text({"text": {"body": "llet\npa"}}), "llet\npa")
        self.assertEqual(bridge._extract_text({"body": "formatge"}), "formatge")

    @patch("whatsapp_bridge.request.urlopen")
    def test_forward_includes_auth_header(self, mock_urlopen) -> None:
        mock_urlopen.return_value.__enter__.return_value.read.return_value = b"{}"
        bridge = WhatsappBridge(api_url="http://example", auth_token="secret")
        bridge._forward({"body": "pa"})
        request_obj = mock_urlopen.call_args.args[0]
        self.assertEqual(request_obj.get_header("Authorization"), "Bearer secret")


if __name__ == "__main__":
    unittest.main()
