import json
import sys
from urllib import request, parse


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python demo_send_message.py \"llet\npa\"")
        return
    message = sys.argv[1]
    data = json.dumps({"message": message}).encode("utf-8")
    req = request.Request("http://127.0.0.1:8000/api/whatsapp", data=data, headers={"Content-Type": "application/json"}, method="POST")
    with request.urlopen(req, timeout=10) as response:
        print(response.read().decode("utf-8"))


if __name__ == "__main__":
    main()
