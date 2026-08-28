import requests

try:
    r_backend = requests.get('http://localhost:5000/api/devices', timeout=5)
    print(f"Backend HTTP Status: {r_backend.status_code}")
    print(f"Devices loaded: {len(r_backend.json())}")
except Exception as e:
    print(f"Backend Error: {e}")

try:
    r_frontend = requests.get('http://localhost:5173', timeout=5)
    print(f"Frontend HTTP Status: {r_frontend.status_code}")
    print(f"Index HTML loaded successfully: {'<div id=\"root\"></div>' in r_frontend.text}")
except Exception as e:
    print(f"Frontend Error: {e}")
