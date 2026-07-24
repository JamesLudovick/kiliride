# Authentication Testing

Run these commands after the Docker stack is running.

## Register A Customer

Public registration always creates a `CUSTOMER` account. Staff, driver, and admin accounts should be created later through a protected admin flow or a seed script.

```powershell
$body = @{
  name = "Test Customer"
  email = "customer@example.com"
  phone = "+255700000000"
  password = "password123"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/auth/register" `
  -ContentType "application/json" `
  -Body $body
```

## Login

```powershell
$body = @{
  email = "customer@example.com"
  password = "password123"
} | ConvertTo-Json

$login = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/auth/login" `
  -ContentType "application/json" `
  -Body $body

$login
```

## Refresh Token

```powershell
$body = @{
  refreshToken = $login.refreshToken
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/auth/refresh" `
  -ContentType "application/json" `
  -Body $body
```

## Current User

```powershell
Invoke-RestMethod `
  -Method Get `
  -Uri "http://localhost:4000/auth/me" `
  -Headers @{ Authorization = "Bearer $($login.accessToken)" }
```

## Seed The First Admin

Public registration cannot create admin accounts. Seed the first manager account from inside the API container:

```powershell
docker compose exec api npm --workspace apps/api run db:seed
```

Default local admin login:

```text
Email: admin@kiliride.local
Password: AdminPassword123
```

Change these values in `.env` before seeding if you want different local credentials:

```text
SEED_ADMIN_NAME=KiliRide Admin
SEED_ADMIN_EMAIL=admin@kiliride.local
SEED_ADMIN_PASSWORD=AdminPassword123
```

Then log in as admin:

```powershell
$body = @{
  email = "admin@kiliride.local"
  password = "AdminPassword123"
} | ConvertTo-Json

$adminLogin = Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/auth/login" `
  -ContentType "application/json" `
  -Body $body

$adminLogin.user
```

## Logout

```powershell
$body = @{
  refreshToken = $login.refreshToken
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "http://localhost:4000/auth/logout" `
  -ContentType "application/json" `
  -Body $body
```
