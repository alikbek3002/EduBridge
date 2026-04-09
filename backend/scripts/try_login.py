import json
import requests

url = 'http://127.0.0.1:8000/api/auth/login/'
payload = { 'email': 'test@example.com', 'password': 'test123' }
print('POST', url, payload)
r = requests.post(url, json=payload)
print('Status:', r.status_code)
try:
    print('Body:', json.dumps(r.json(), ensure_ascii=False, indent=2))
except Exception:
    print('Raw body:', r.text[:500])