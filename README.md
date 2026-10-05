# Migo Backend

Smart daily ride-sharing API. Express + TypeScript + Prisma + PostgreSQL.

Folder layout follows the Project-Prisma style: `src/app.ts`, `src/server.ts`, `src/config`, `src/middlewares`, `src/utils`, `src/modules/<domain>/{route,controller,service}`, split Prisma schema under `prisma/schema`.

## Install

```bash
cd migo-backend
cp .env.example .env
# paste DATABASE_URL and SSLCommerz keys into .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

API: `http://localhost:5000/api/v1`  
Swagger: `http://localhost:5000/docs`

## Dependencies

**Runtime**

- express
- @prisma/client
- @prisma/adapter-pg
- pg
- bcryptjs
- jsonwebtoken
- cookie-parser
- cors
- dotenv
- helmet
- morgan
- http-status
- zod
- express-rate-limit
- google-auth-library
- ioredis
- socket.io
- swagger-ui-express

**Dev**

- typescript
- tsx
- prisma
- @types/express
- @types/node
- @types/cors
- @types/cookie-parser
- @types/jsonwebtoken
- @types/morgan
- @types/swagger-ui-express
- @types/pg
- @types/bcryptjs

## Seed accounts (Postman)

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

Pending ride OTP (Nabila × Karim morning commute): **`246810`**

In development, `POST /auth/otp/send` and password-reset endpoints return the token in the JSON body so you can test without SMS/email.

## Env you must fill

```
DATABASE_URL=
SSLCOMMERZ_STORE_ID=
SSLCOMMERZ_STORE_PASSWORD=
SSLCOMMERZ_IS_LIVE=false
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
```

Google OAuth and Redis are optional.

See `POSTMAN.md` for a full click-through of the APIs.
