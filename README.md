# KiliRide Management System

KiliRide Management System is a Docker-based monorepo for one Moshi-based car rental and transport company. This includes React + TypeScript customer/admin web app, a NestJS API, PostgreSQL, Prisma ORM, Tailwind CSS, and future shadcn/ui components.

## What Is Included

- `apps/web`: React + TypeScript frontend powered by Vite and Tailwind CSS
- `apps/api`: NestJS backend with authentication-ready module structure
- `packages/types`: shared TypeScript types for frontend/backend contracts
- `docker-compose.yml`: local PostgreSQL, API, and web containers
- Prisma schema with initial user, session, profile, and role models
- Environment templates and setup instructions

Business features such as vehicles, bookings, services, payments, and reports are intentionally not implemented yet. They should be added after authentication is in place.

## Prerequisites

- Docker Desktop
- Node.js 20+ if you want to run commands outside Docker
- Git

## First Setup

1. Copy the environment template:

```powershell
Copy-Item .env.example .env
```

2. Start the full development stack:

```powershell
docker compose up --build
```

3. Open the apps:

- Web app: http://localhost:5173
- API health check: http://localhost:4000/health

## Database Setup

After the containers are running, apply the first Prisma migration:

```powershell
docker compose exec api npm --workspace apps/api run prisma:migrate
```

To inspect the database with Prisma Studio:

```powershell
docker compose exec api npm --workspace apps/api run prisma:studio
```

## Recommended Development Order

1. Implement authentication: register, login, refresh token, logout
2. Add JWT strategy and role-based route guards for `ADMIN`, `STAFF`, `DRIVER`, and `CUSTOMER`
3. Add the admin dashboard shell
4. Add vehicle management
5. Add booking requests and approval flow
6. Add transport services such as VIP, airport transfer, wedding, funeral, and tourism transport

## Auth API Test Guide

See [docs/auth-testing.md](docs/auth-testing.md) for PowerShell examples that register, log in, refresh, and log out a user.

## Frontend Auth Screens

After the API and web containers are running:

- Public website: http://localhost:5173
- Login page: http://localhost:5173/login
- Admin dashboard: http://localhost:5173/admin

Use the seeded admin account to sign in locally.

## Seed The First Admin

After the database migration has been applied, create or update the first local admin account:

```powershell
docker compose exec api npm --workspace apps/api run db:seed
```

The default local credentials are configured in `.env.example`. Change them in `.env` before seeding for a real environment.

## Docker Init Note

This scaffold is already prepared for Docker Compose. If you still want to use Docker Desktop's `docker init`, run it only as a comparison tool and keep the existing `docker-compose.yml`, `apps/web/Dockerfile`, and `apps/api/Dockerfile` as the source of truth unless you deliberately replace them.
