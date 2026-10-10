<div align="center">

<a href="https://i.ibb.co.com/M5GRcwJk/migo-logo.png">
  <img src="https://i.ibb.co.com/M5GRcwJk/migo-logo.png" alt="Migo Logo" width="250" />
</a>

### Smart, Reliable & Connected Daily Commutes

A production-oriented ride-sharing backend designed for Dhaka, Bangladesh. Migo connects daily commuters with passengers traveling along similar routes, enabling recurring ride schedules, intelligent ride matching, seat reservations, OTP-based ride verification, secure payments, real-time location sharing, and in-app messaging.

**Connecting People. Simplifying Daily Commutes.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![Stripe](https://img.shields.io/badge/Stripe-6366F1?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![SSLCOMMERZ](https://img.shields.io/badge/SSLCOMMERZ-00AEEF?style=for-the-badge&logo=sslcommerz&logoColor=white)](https://sslcommerz.com/)
[![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)](https://www.postman.com/)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)


</div>

---

## 🛠️ Tech Stack Architecture

| Layer | Technology | Purpose |
|---|---|---|
| Runtime | **Node.js** | Server-side JavaScript runtime |
| Language | **TypeScript** | Type-safe backend development |
| Web Framework | **Express.js** | REST API routing and middleware |
| Database | **PostgreSQL** | Relational data management |
| ORM | **Prisma ORM** | Type-safe database queries |
| Authentication | **JWT** | Secure authentication and authorization |
| Validation | **Zod** | Request data validation |
| Real-Time | **Socket.IO** | Live updates, location sharing, and messaging |
| Payments | **SSLCommerz** | Online payment gateway integration |
| API Documentation | **Swagger/OpenAPI** | Interactive API documentation |
| API Testing | **Postman** | Endpoint testing and workflow validation |

---
## 📚 API Documentation

> 📮 **Interactive Postman Documentation**  
> Access full endpoint details, request payloads, response schemas, and authentication flows.
>
<p align="left">
  <a href="https://documenter.getpostman.com/view/54899242/2sBYB1PoQQ" target="_blank">
    <img src="https://run.pstmn.io/button.svg" alt="Run In Postman" width="128" height="32">
  </a>
</p>

👉 **[Explore Full API Documentation →](https://documenter.getpostman.com/view/54899242/2sBYHQ2Nz2)**
>

---

## 🚀 Live API

> ▲ **Deployed on Vercel**  
> Access the live Migo REST API deployed and hosted on Vercel.

> [![Live API](https://img.shields.io/badge/Live%20API-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://migo-tau.vercel.app/)

👉 [**Explore Live API →**](https://migo-tau.vercel.app/)

---
## 🚀 Core Features

- **Authentication & Authorization:** JWT-based authentication, role-based access control, token refresh, logout, OTP verification, and password management.
- **User Management:** Profile updates, profile photos, emergency contacts, notification preferences, and user blocking.
- **Vehicle Management:** Vehicle registration, vehicle documents, verification status, and vehicle management.
- **Route & Schedule Management:** Create recurring commute routes, configure departure and return times, pause or resume routes, and manage seat availability.
- **Smart Ride Matching:** Search available rides using pickup and destination coordinates, travel date, time, and seat requirements.
- **Ride Booking:** Create ride requests, select preferred matches, accept or reject requests, confirm rides, and manage cancellations.
- **OTP Ride Verification:** Verify pickup using an OTP before starting a ride.
- **Live Location Tracking:** Share GPS coordinates, retrieve current location, and access location history during authorized rides.
- **Secure Online Payments:** SSLCommerz checkout, payment status tracking, gateway callbacks, IPN processing, validation, and refund management.
- **Real-Time Communication:** Socket.IO support for live application updates and communication.
- **In-App Chat:** Ride-based conversations, message history, and read-status management.
- **Reviews & Ratings:** Submit ride reviews and retrieve reviews for rides or users.
- **Notifications:** Notification history, unread counts, and read-status management.
- **Safety & Support:** Emergency assistance, user reports, support tickets, incident management, and dispute resolution.
- **Admin Dashboard:** User moderation, commuter verification, route and ride management, payment oversight, analytics, and audit logs.

---

## 📚 API Documentation

Migo provides interactive API documentation and a structured API testing workflow.

| Resource | URL |
|---|---|
| Swagger / API Docs | `http://localhost:5000/docs` |
| REST API Base URL | `http://localhost:5000/api/v1` |
| Health Endpoint | `http://localhost:5000/api/v1/health` |
| Public Configuration | `http://localhost:5000/api/v1/config/public` |

The backend API testing guide documents approximately **153 registered HTTP endpoints** across authentication, users, vehicles, routes, ride requests, matching, rides, payments, conversations, reviews, notifications, safety, support, and administration.

The documented HTTP endpoint inventory is summarized below. Consult the actual OpenAPI specification for the complete request schemas, response formats, and registered routes.

---

## 📡 API Endpoints

All paths below are relative to `/api/v1`, unless stated otherwise.

### 1. Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/config/public` | Public application configuration |
| POST | `/auth/register/passenger` | Register a passenger |
| POST | `/auth/register/commuter` | Register a commuter |
| POST | `/auth/login` | Authenticate a user |
| GET | `/auth/me` | Get the current session |
| POST | `/auth/otp/send` | Send an OTP |
| POST | `/auth/otp/verify` | Verify an OTP |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Log out |
| POST | `/auth/password/forgot` | Request password recovery |
| PATCH | `/auth/password/change` | Change password |

### 2. Users & Profiles

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/users/me` | Retrieve own profile |
| PATCH | `/users/me` | Update own profile |
| PATCH | `/users/me/photo` | Update profile photo |
| PATCH | `/users/me/emergency-contact` | Manage emergency contact |
| GET | `/users/me/preferences` | Retrieve preferences |
| PATCH | `/users/me/preferences` | Update preferences |
| GET | `/users/:userId` | Retrieve a user profile |
| POST | `/users/:userId/block` | Block a user |
| DELETE | `/users/:userId/block` | Unblock a user |

### 3. Vehicles

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/vehicles` | List vehicles |
| POST | `/vehicles` | Register a vehicle |
| GET | `/vehicles/:vehicleId` | Retrieve vehicle details |
| PATCH | `/vehicles/:vehicleId` | Update a vehicle |
| DELETE | `/vehicles/:vehicleId` | Delete a vehicle |
| POST | `/vehicles/:vehicleId/documents` | Submit vehicle documents |
| GET | `/vehicles/:vehicleId/verification` | Check verification status |

### 4. Routes & Schedules

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/routes` | Browse available routes |
| POST | `/routes` | Create a commute route |
| POST | `/routes/:routeId/schedules` | Configure recurring schedules |
| POST | `/routes/:routeId/pause` | Pause a route |
| POST | `/routes/:routeId/resume` | Resume a route |
| POST | `/routes/:routeId/availability` | Update date-specific seat availability |

### 5. Ride Matching & Requests

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/matches/search` | Search matching routes |
| GET | `/matches/:matchId` | Retrieve match details |
| POST | `/matches/:matchId/select` | Select a preferred match |
| POST | `/matches/:matchId/request` | Request a seat |
| POST | `/ride-requests` | Create a ride request |
| GET | `/ride-requests` | List own requests |
| GET | `/ride-requests/:requestId/matches` | Retrieve request matches |
| POST | `/ride-requests/:requestId/match` | Match a ride request |
| POST | `/ride-requests/:requestId/cancel` | Cancel a request |

### 6. Ride Lifecycle & Tracking

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/rides` | List rides |
| GET | `/rides/:rideId` | Retrieve ride details |
| POST | `/rides/:rideId/accept` | Accept a ride |
| POST | `/rides/:rideId/reject` | Reject a ride |
| POST | `/rides/:rideId/confirm` | Confirm a ride |
| GET | `/rides/:rideId/otp` | Retrieve the ride OTP |
| POST | `/rides/:rideId/otp/verify` | Verify pickup OTP |
| POST | `/rides/:rideId/location` | Submit GPS location |
| GET | `/rides/:rideId/location` | Retrieve current location |
| GET | `/rides/:rideId/location/history` | Retrieve location history |
| POST | `/rides/:rideId/location/share` | Enable location sharing |
| DELETE | `/rides/:rideId/location/share` | Disable location sharing |
| POST | `/rides/:rideId/complete` | Complete a ride |
| POST | `/rides/:rideId/cancel` | Cancel a ride |
| POST | `/rides/:rideId/no-show` | Report a no-show |
| GET | `/rides/:rideId/timeline` | Retrieve ride timeline |

### 7. Payments — SSLCommerz

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/payments/checkout` | Initiate payment checkout |
| GET | `/payments` | List own payments |
| GET | `/payments/:paymentId` | Retrieve payment details |
| GET | `/payments/:paymentId/status` | Check payment status |
| POST | `/payments/success` | Handle successful payment callback |
| POST | `/payments/fail` | Handle failed payment callback |
| POST | `/payments/cancel` | Handle cancelled payment callback |
| POST | `/payments/ipn` | Process gateway notifications |
| POST | `/payments/:paymentId/validate` | Validate a payment (admin) |
| POST | `/payments/:paymentId/refund` | Process a refund (admin) |

### 8. Conversations & Messaging

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/conversations` | List conversations |
| POST | `/conversations` | Open or retrieve a ride conversation |
| GET | `/conversations/:conversationId/messages` | Retrieve messages |
| POST | `/conversations/:conversationId/messages` | Send a message |
| PATCH | `/conversations/:conversationId/read` | Mark messages as read |

### 9. Reviews & Ratings

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/reviews` | Submit a ride review |
| GET | `/reviews/ride/:rideId` | Retrieve ride reviews |
| GET | `/reviews/user/:userId` | Retrieve user reviews |

### 10. Notifications

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/notifications` | Retrieve notifications |
| GET | `/notifications/unread-count` | Get unread count |
| PATCH | `/notifications/read-all` | Mark all notifications as read |
| PATCH | `/notifications/:notificationId/read` | Mark a notification as read |

### 11. Reports, Safety & Support

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/reports` | Report a user or other target |
| POST | `/safety/emergency` | Submit an emergency alert |
| POST | `/support/tickets` | Create a support ticket |
| GET | `/support/tickets` | Retrieve support tickets |

### 12. Administration

Administrative endpoints require the appropriate admin permissions. Super-admin-only actions must be protected separately.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/dashboard` | Retrieve dashboard statistics |
| GET | `/admin/users` | List and filter users |
| GET | `/admin/users/:userId` | Retrieve user details |
| PATCH | `/admin/users/:userId/status` | Manage user status |
| PATCH | `/admin/users/:userId/role` | Manage user role (super admin) |
| GET | `/admin/verifications` | List verification requests |
| POST | `/admin/verifications/:verificationId/approve` | Approve verification |
| POST | `/admin/verifications/:verificationId/reject` | Reject verification |
| POST | `/admin/verifications/:verificationId/request-resubmission` | Request new documents |
| GET | `/admin/routes` | List routes for moderation |
| PATCH | `/admin/routes/:routeId` | Moderate a route |
| GET | `/admin/rides` | List rides |
| POST | `/admin/rides/:rideId/cancel` | Cancel a ride administratively |
| POST | `/admin/rides/:rideId/status-override` | Override ride status |
| POST | `/admin/rides/:rideId/no-show` | Manage no-show reports |
| GET | `/admin/reports` | Review reports |
| POST | `/admin/reports/:id/resolve` | Resolve a report |
| GET | `/admin/disputes` | List disputes |
| POST | `/admin/disputes/:id/resolve` | Resolve a dispute |
| POST | `/admin/disputes/:id/escalate` | Escalate a dispute |
| GET | `/admin/payments` | Review payments |
| POST | `/admin/payments/:paymentId/retry` | Retry a payment operation |
| GET | `/admin/support/tickets` | Manage support tickets |
| PATCH | `/admin/support/tickets/:id` | Update a support ticket |
| GET | `/admin/incidents` | List incidents |
| POST | `/admin/incidents` | Create an incident |
| PATCH | `/admin/incidents/:id` | Update an incident |
| GET | `/admin/analytics/users` | User analytics |
| GET | `/admin/analytics/rides` | Ride analytics |
| GET | `/admin/analytics/matching` | Matching analytics |
| GET | `/admin/analytics/payments` | Payment analytics |
| GET | `/admin/analytics/routes` | Route analytics |
| GET | `/admin/audit-logs` | List audit logs |
| GET | `/admin/audit-logs/:auditId` | Retrieve an audit record |

**Note:** This is a representative endpoint reference based on the supplied API testing guide, not a replacement for the complete OpenAPI specification. Additional registered endpoints may exist within the documented total of approximately 153.

---

## ⚡ Real-Time Architecture — Socket.IO

Migo includes Socket.IO as an additional real-time communication layer alongside the REST API.

Real-time capabilities can support:

- **Live Ride Updates:** Notify authorized participants when a ride changes state.
- **Location Sharing:** Deliver location updates to authorized users during an active ride.
- **Instant Messaging:** Support real-time delivery of ride-related messages.
- **Notifications:** Push relevant application updates without requiring manual page refreshes.
- **Ride Status Synchronization:** Keep passenger and commuter interfaces synchronized.

### Architecture

```text
                  MIGO CLIENT
                      |
          +-----------+-----------+
          |                       |
      REST API                 Socket.IO
          |                       |
          +-----------+-----------+
                      |
               Express Server
                      |
          +-----------+-----------+
          |                       |
      Prisma ORM             Real-Time Events
          |
      PostgreSQL
```

Socket.IO complements the REST API; it does not replace HTTP endpoints for operations that require normal request-response handling.

Real-time events must be authenticated, authorized against ride or conversation membership, and validated on the server. Use the actual event names and payload schemas implemented by the backend when connecting a client.

---

## 🔐 Authentication & Role-Based Access Control

Migo uses JWT-based authentication and role-based authorization to protect user data and application operations.

| Role | Responsibilities |
|---|---|
| **PASSENGER** | Search routes, request seats, confirm rides, view authorized ride details, pay, message, review, and manage profile |
| **COMMUTER** | Manage vehicles and routes, configure schedules, accept or reject rides, verify pickup OTPs, share location, and complete rides |
| **ADMIN** | Manage users, verifications, routes, rides, reports, payments, support tickets, incidents, and analytics |
| **SUPER_ADMIN** | Perform privileged administrative actions, including role management where authorized |

### Using an Access Token

After a successful login, save `data.accessToken` and use it in protected requests.

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

Example login request:

```http
POST /api/v1/auth/login
Content-Type: application/json
```

```json
{
  "email": "nabila@migo.app",
  "password": "Passenger@123"
}
```

The response contains the authentication data required by the client. Use the actual response schema defined by the running API.

---

## 🔄 Ride Lifecycle

The principal end-to-end ride workflow is:

```text
Search Routes
     |
     v
Select Match
     |
     v
Request a Seat
     |
     v
Commuter Accepts
     |
     v
Confirm Ride
     |
     v
Verify Pickup OTP
     |
     v
Ride In Progress
     |
     v
Complete Ride
     |
     v
Passenger Checkout
     |
     v
Payment Verification
     |
     v
Submit Reviews
```

The backend controls ride transitions and access permissions. Follow the server's actual state-transition rules when integrating a frontend or testing a workflow.

---

## 💳 Payment Integration

Migo integrates **SSLCommerz** for online payment processing.

The payment workflow includes:

1. The passenger initiates checkout for a ride.
2. The backend creates a payment record and initiates gateway checkout when valid gateway credentials are configured.
3. The passenger completes the payment on the gateway.
4. SSLCommerz redirects to the appropriate success, failure, or cancellation callback.
5. The backend validates the transaction using the gateway's verification mechanism and processes IPN notifications.
6. The payment status is updated according to the verified transaction result.

### Required Environment Variables

Configure the SSLCommerz credentials using the backend's `.env.example` and environment validation schema.

```env
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
```

**Security requirements:**

- Never trust a client-provided payment status.
- Verify transactions with the payment gateway before marking them successful.
- Validate gateway callbacks and IPN notifications according to the provider's security requirements.
- Keep payment credentials and secrets out of source control.
- Do not use a pending payment record as proof of a successful transaction.

The supplied testing guide notes that checkout may create a pending payment record when gateway credentials are absent. This is not a completed payment and must not be represented as one.

---

## 🧪 API Testing with Postman

The supplied **Migo Backend API Testing Guide** describes the recommended end-to-end testing workflow.

### Recommended Testing Order

1. Check the health and public configuration endpoints.
2. Log in as a commuter and inspect vehicles and routes.
3. Log in as a passenger and search for matching rides.
4. Create a ride request and select a match.
5. Log in as the commuter and accept the ride.
6. Confirm the ride and verify pickup using OTP.
7. Test location updates and ride completion.
8. Test payment checkout and gateway verification with properly configured credentials.
9. Test reviews, conversations, and notifications.
10. Log in as an administrator and test dashboard and moderation endpoints.

Use separate passenger and commuter sessions when testing a full ride lifecycle.

### Seeded Development Accounts

The API testing guide lists the following development accounts. These credentials should only be used in an isolated development database.

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@migo.app` | `SuperAdmin@123` |
| Admin | `admin@migo.app` | `Admin@123` |
| Passenger | `nabila@migo.app` | `Passenger@123` |
| Passenger | `rahim@migo.app` | `Passenger@123` |
| Passenger | `passenger@migo.app` | `Passenger@123` |
| Commuter | `karim@migo.app` | `Commuter@123` |
| Commuter | `ayesha@migo.app` | `Commuter@123` |
| Commuter | `commuter@migo.app` | `Commuter@123` |

The guide also documents a development OTP for a seeded passenger-commuter test ride. Use it only in the intended seeded environment.

**Important:** Never deploy these default credentials or development OTPs to production. Replace or disable seeded accounts and development-only authentication behavior before production deployment.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- PostgreSQL database
- Git
- SSLCommerz sandbox or production credentials for gateway testing

### Installation

```bash
# 1. Clone the repository
git clone YOUR_MIGO_BACKEND_REPOSITORY_URL

# 2. Navigate to the backend directory
cd migo-backend

# 3. Install dependencies
npm install

# 4. Configure environment variables
cp .env.example .env

# 5. Generate Prisma Client
npx prisma generate

# 6. Run database migrations
npx prisma migrate dev

# 7. Seed development data
npm run db:seed

# 8. Start the development server
npm run dev
```

The server is expected to run at:

```text
http://localhost:5000
```

The main API and documentation URLs are:

```text
REST API:  http://localhost:5000/api/v1
API Docs:  http://localhost:5000/docs
Health:    http://localhost:5000/api/v1/health
```

**Environment setup:** The exact required variables depend on the backend's `.env.example` and environment schema. Configure the database URL, JWT secrets, and any required external service credentials before starting the application.

---

## 🗄️ Database & Backend Architecture

Migo uses PostgreSQL for relational data storage and Prisma ORM for type-safe database operations.

The architecture separates HTTP routing, authentication, validation, business logic, and database access. This separation supports maintainability and makes it easier to test individual modules.

Core domain areas include:

- Authentication and user profiles
- Vehicles, routes, and recurring schedules
- Ride requests, matching, and ride lifecycle
- Payments and gateway transactions
- Conversations, messages, and reviews
- Notifications, reports, and safety
- Administrative moderation, analytics, and audit logs

Use the repository's actual directory structure and Prisma schema as the source of truth for model names, module boundaries, and database relationships.

---

## 🛡️ Validation & Error Handling

Migo uses Zod for request validation and a consistent JSON response envelope.

### Success Response

```json
{
  "success": true,
  "message": "OK",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 3
  }
}
```

The `meta` property is used where pagination metadata is applicable.

### Error Response

```json
{
  "success": false,
  "message": "Validation error",
  "errorDetails": []
}
```

The API testing guide documents the following HTTP status codes:

| Status | Meaning |
|---|---|
| `200` | Successful request |
| `201` | Resource created |
| `400` | Invalid request or validation failure |
| `401` | Authentication required or invalid |
| `403` | Insufficient permissions |
| `404` | Resource not found |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

Request bodies, query parameters, and path parameters should be validated according to their respective endpoint schemas. Sensitive errors and internal stack traces should not be exposed in production responses.

---

## 🌍 Production Readiness

Production deployment should include the following operational and security controls:

- Strong environment-specific JWT secrets and secure token handling.
- Role-based access control and ownership checks for protected resources.
- Input validation and consistent error handling.
- Database migrations, appropriate indexes, and backup procedures.
- Payment gateway verification and secure callback handling.
- Authenticated Socket.IO connections and room-level authorization.
- Rate limiting, CORS configuration, secure HTTP headers, and request logging.
- Monitoring, health checks, and actionable operational logs.
- Protection against unauthorized location access and message disclosure.
- Restricted development seed data and production-safe configuration.

These are recommended production controls; their implementation should be verified against the actual repository and deployment configuration.

---

## 📋 Project Information

| Property | Details |
|---|---|
| Project Name | Migo |
| Project Type | Daily Ride-Sharing Backend |
| Primary Market | Dhaka, Bangladesh |
| API Style | RESTful API |
| API Version | `/api/v1` |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT |
| Validation | Zod |
| Payments | SSLCommerz |
| Real-Time Communication | Socket.IO |
| Documentation | Swagger/OpenAPI |
| Testing | Postman |
| Documented API Inventory | Approximately 153 HTTP endpoints |

---

<div align="center">

<a href="https://i.ibb.co.com/M5GRcwJk/migo-logo.png">
  <img src="https://i.ibb.co.com/M5GRcwJk/migo-logo.png" alt="Migo Logo" width="200" />
</a>

### Migo — Making Everyday Commutes Smarter

**Built with Node.js, TypeScript, Express.js, Prisma, PostgreSQL, and Socket.IO.**

</div>
