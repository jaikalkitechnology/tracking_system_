def register(client, email="jane@example.com", password="Password@123"):
    return client.post(
        "/api/v1/auth/register",
        json={"name": "Jane Doe", "email": email, "phone": "+919876543210", "password": password},
    )


def test_register_and_login(client):
    r = register(client)
    assert r.status_code == 201
    body = r.json()
    assert body["user"]["role"] == "CUSTOMER"

    r = client.post("/api/v1/auth/login", json={"email": "jane@example.com", "password": "Password@123"})
    assert r.status_code == 200
    assert "access_token" in r.json()


def test_login_invalid_credentials(client):
    register(client)
    r = client.post("/api/v1/auth/login", json={"email": "jane@example.com", "password": "wrong"})
    assert r.status_code == 401
    assert r.json()["error_code"] == "INVALID_CREDENTIALS"


def test_public_tracking_not_found(client):
    r = client.get("/api/v1/track/TRK000000000")
    assert r.status_code == 404
    assert r.json()["success"] is False
    assert r.json()["error_code"] == "TRACKING_NOT_FOUND"


def test_customer_cannot_list_all_customers(client):
    register(client)
    r = client.post("/api/v1/auth/login", json={"email": "jane@example.com", "password": "Password@123"})
    token = r.json()["access_token"]
    r = client.get("/api/v1/customers", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 403
