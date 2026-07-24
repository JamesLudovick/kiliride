# Architecture

KiliRide is structured as a single-company web application, not a SaaS platform.

```text
Customer / Staff / Admin
        |
        v
React Web App
        |
        v
NestJS API
        |
        v
PostgreSQL + Prisma
```

## Applications

- `apps/web`: public website, customer portal, and admin dashboard
- `apps/api`: API, authentication, business logic, and database access
- `packages/types`: shared domain types

## Initial Backend Modules

- `AuthModule`: register/login/session architecture will live here
- `UsersModule`: user lookup and role management will live here
- `PrismaModule`: shared database client

## Initial Roles

- `ADMIN`: company manager with full access
- `STAFF`: booking and operations staff
- `DRIVER`: driver account with assigned trips later
- `CUSTOMER`: public customer account

## Business Modules To Add Later

- Vehicles
- Vehicle categories
- Services
- Bookings
- Drivers
- Payments
- Maintenance
- Reports
- Notifications
