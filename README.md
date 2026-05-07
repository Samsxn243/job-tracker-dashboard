# Job Tracker Dashboard

A full-stack job application tracker with a Kanban board, analytics dashboard, and contact management.

> **Status:** Backend API complete · Frontend in progress
> **Prerequisites:** Java 17+ · Maven 3.9+ · MongoDB Atlas (free tier)

## Tech Stack

![Java](https://img.shields.io/badge/Java_17-ED8B00?style=flat&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat&logo=spring-boot&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Angular](https://img.shields.io/badge/Angular_17-DD0031?style=flat&logo=angular&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## Features

- **Kanban Board** — Drag-and-drop cards between status columns (Wishlist → Applied → Interview → Offer)
- **Full CRUD** — Create, edit, delete applications with contacts and notes
- **Search & Filter** — Full-text search, filter by status/tag/date range
- **Analytics** — Charts for application volume, status breakdown, response rate
- **CSV Export** — Download all applications as a spreadsheet
- **Activity Timeline** — Audit log showing every change per application
- **JWT Auth** — Secure API with token-based authentication
- **Docker** — One-command setup with docker-compose

## Quick Start

### Option A: Docker (recommended)

```bash
git clone https://github.com/Samsxn243/job-tracker-dashboard.git
cd job-tracker-dashboard
docker-compose up --build
```

API available at `http://localhost:8080`

### Option B: Manual

**Prerequisites:** Java 17+, Maven, MongoDB running on port 27017

```bash
cd backend
mvn spring-boot:run
```

### Demo credentials

On first run, the seeder creates a demo account with 15 sample applications:

```
Email:    demo@jobtracker.dev
Password: password123
```

## API Reference

### Auth

| Method | Endpoint             | Body                                    | Description     |
|--------|----------------------|-----------------------------------------|-----------------|
| POST   | `/api/auth/register` | `{ email, password, displayName }`      | Create account  |
| POST   | `/api/auth/login`    | `{ email, password }`                   | Get JWT token   |

### Applications

All endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint                        | Description                          |
|--------|---------------------------------|--------------------------------------|
| GET    | `/api/applications`             | List all (query: status, tag, search, from, to) |
| GET    | `/api/applications/:id`         | Get single application               |
| POST   | `/api/applications`             | Create application                   |
| PUT    | `/api/applications/:id`         | Full update                          |
| PATCH  | `/api/applications/:id/status`  | Update status only (Kanban moves)    |
| DELETE | `/api/applications/:id`         | Delete application                   |
| GET    | `/api/applications/:id/timeline`| Activity log for this application    |
| GET    | `/api/applications/export/csv`  | Download all as CSV                  |

### Analytics

| Method | Endpoint                 | Description                              |
|--------|--------------------------|------------------------------------------|
| GET    | `/api/analytics/summary` | Stats: by status, by week, response rate |

## API Usage Examples

### 1. Register a new account

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "yourpassword",
    "displayName": "Your Name"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "email": "you@example.com",
  "displayName": "Your Name"
}
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@jobtracker.dev", "password": "password123"}'
```

### 3. Create an application

```bash
curl -X POST http://localhost:8080/api/applications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company": "Stripe",
    "role": "Backend Engineer",
    "status": "APPLIED",
    "dateApplied": "2026-05-07",
    "tags": ["fintech", "remote"],
    "notes": ["Applied via referral from a friend"]
  }'
```

### 4. Move a card on the Kanban board (status update)

```bash
curl -X PATCH http://localhost:8080/api/applications/APP_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "INTERVIEW"}'
```

### 5. Search applications

```bash
curl -s "http://localhost:8080/api/applications?search=Google" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Get analytics summary

```bash
curl -s http://localhost:8080/api/analytics/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7. Export as CSV

```bash
curl -s http://localhost:8080/api/applications/export/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o applications.csv
```


## Architecture

```
┌─────────────────────────────────────────────┐
│              Angular 17 Frontend            │
│    Kanban Board · Analytics · Forms · Auth  │
└──────────────────┬──────────────────────────┘
                   │ REST / JSON
┌──────────────────▼──────────────────────────┐
│            Spring Boot 3 API                │
│  Controllers → Services → Repositories      │
│  JWT Auth Filter · CORS · Exception Handler │
└──────────────────┬──────────────────────────┘
                   │ Spring Data MongoDB
┌──────────────────▼──────────────────────────┐
│               MongoDB                       │
│  applications · users · activity_logs       │
└─────────────────────────────────────────────┘
```

## Project Structure

```
job-tracker-dashboard/
├── backend/
│   ├── src/main/java/com/tracker/
│   │   ├── controller/    AuthController, ApplicationController, AnalyticsController
│   │   ├── service/       ApplicationService, AnalyticsService
│   │   ├── repository/    ApplicationRepository, UserRepository, ActivityLogRepository
│   │   ├── model/         Application, User, ActivityLog, Contact, ApplicationStatus
│   │   ├── dto/           ApplicationDTO, StatusUpdateDTO, AuthDTO, AnalyticsSummaryDTO
│   │   ├── config/        SecurityConfig, CorsConfig, JwtUtil, JwtAuthFilter, DataSeeder
│   │   └── exception/     GlobalExceptionHandler, ResourceNotFoundException
│   ├── Dockerfile
│   └── pom.xml
├── frontend/               (coming week 2)
├── docker-compose.yml
├── .github/workflows/ci.yml
└── .gitignore
```

## License

MIT
