# Postman check (after seed)

Base URL: `http://localhost:5000/api/v1`  
Header after login: `Authorization: Bearer <accessToken>`

## 1. Health

`GET /health`  
`GET /config/public`

## 2. Login each role

`POST /auth/login`

```json
{ "email": "nabila@migo.app", "password": "Passenger@123" }
```

```json
{ "email": "karim@migo.app", "password": "Commuter@123" }
```

```json
{ "email": "admin@migo.app", "password": "Admin@123" }
```

Copy `data.accessToken`. Also works with cookies.

`GET /auth/me`

## 3. Register (optional)

`POST /auth/register/passenger`

```json
{
  "fullName": "Test Passenger",
  "email": "new.passenger@migo.app",
  "phone": "01719990001",
  "password": "Passenger@123"
}
```

`POST /auth/register/commuter` — same shape.

## 4. OTP (dev returns the code)

`POST /auth/otp/send`

```json
{ "phone": "01710000011", "purpose": "PHONE_VERIFY" }
```

Then `POST /auth/otp/verify` with `{ "phone", "code", "purpose" }`.

## 5. Passenger find-ride

As Nabila:

`POST /matches/search`

```json
{
  "pickupName": "Banani 11, Dhaka",
  "pickupLat": 23.7937,
  "pickupLng": 90.4043,
  "destinationName": "Motijheel, Dhaka",
  "destinationLat": 23.733,
  "destinationLng": 90.4172,
  "date": "2026-10-06",
  "time": "08:10",
  "seats": 1
}
```

`GET /ride-requests`  
`POST /ride-requests/:requestId/match`  
`GET /ride-requests/:requestId/matches`  
`POST /matches/:matchId/select`  
`POST /matches/:matchId/request`

## 6. Commuter accept + OTP start

As Karim:

`GET /rides`  
`POST /rides/:rideId/accept`  
`POST /rides/:rideId/confirm`

As Nabila: `GET /rides/:rideId/otp` → seed OTP is **246810**

As Karim: `POST /rides/:rideId/otp/verify` `{ "code": "246810" }`  
`POST /rides/:rideId/complete`

## 7. Chat / reviews / payments

`GET /conversations`  
`POST /conversations/:id/messages` `{ "content": "See you at 8" }`  
`POST /reviews` `{ "rideId", "targetId", "rating": 5, "comment": "Great" }`  
`POST /payments/checkout` `{ "rideId": "<id>" }`

Checkout returns SSLCommerz `gatewayUrl` once store id/password are in `.env`. Without those keys the API still creates a pending payment and tells you credentials are missing.

## 8. Admin

As admin:

`GET /admin/dashboard`  
`GET /admin/users`  
`GET /admin/verifications`  
`POST /admin/verifications/:id/approve` `{ "reason": "Documents match" }`  
`GET /admin/rides`  
`GET /admin/reports`  
`GET /admin/analytics/matching`  
`GET /admin/audit-logs`

Sensitive admin actions require `reason`.
