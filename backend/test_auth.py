import requests

BASE_URL = "http://localhost:5000/api"

print("--- 1. Testing Valid Demo Credentials (admin@twinguard.com / admin123) ---")
res1 = requests.post(f"{BASE_URL}/login", json={"email": "admin@twinguard.com", "password": "admin123"})
print(f"Status Code: {res1.status_code}")
print(f"Response: {res1.json()}")
assert res1.status_code == 200, "Valid email/password failed!"

print("\n--- 2. Testing Short Username (admin / admin123) ---")
res2 = requests.post(f"{BASE_URL}/login", json={"email": "admin", "password": "admin123"})
print(f"Status Code: {res2.status_code}")
print(f"Response: {res2.json()}")
assert res2.status_code == 200, "Valid short username failed!"

print("\n--- 3. Testing Invalid Password ---")
res3 = requests.post(f"{BASE_URL}/login", json={"email": "admin@twinguard.com", "password": "wrongpassword"})
print(f"Status Code: {res3.status_code}")
print(f"Response: {res3.json()}")
assert res3.status_code == 401, "Invalid password should return 401!"

print("\n--- 4. Testing Invalid Email ---")
res4 = requests.post(f"{BASE_URL}/login", json={"email": "wrong@twinguard.com", "password": "admin123"})
print(f"Status Code: {res4.status_code}")
print(f"Response: {res4.json()}")
assert res4.status_code == 401, "Invalid email should return 401!"

print("\n=======================================================")
print(" ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY!")
print("=======================================================")
