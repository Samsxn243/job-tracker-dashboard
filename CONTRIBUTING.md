# Contributing to Job Tracker Dashboard

Thanks for your interest in contributing! This project is open for improvements and new features.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/job-tracker-dashboard.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit with a descriptive message: `git commit -m "feat: add your feature"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Prerequisites

- Java 17+
- Maven 3.9+
- Node 18+
- MongoDB (local or [Atlas free tier](https://www.mongodb.com/cloud/atlas))

## Local Development

```bash
# Backend (Terminal 1)
cd backend
mvn spring-boot:run

# Frontend (Terminal 2)
cd frontend
npm install
ng serve
```

The API runs on `http://localhost:8080` and the frontend on `http://localhost:4200`.

## Running Tests

```bash
cd backend
mvn test
```

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `test:` — Adding or updating tests
- `refactor:` — Code refactoring
- `style:` — Formatting, no logic change
- `chore:` — Build process, dependencies

## Project Structure

- `backend/` — Spring Boot 3 REST API
- `frontend/` — Angular 17 SPA
- `docs/` — Screenshots and documentation assets

## Ideas for Contribution

- [ ] Add a contact management UI
- [ ] Build timeline view for each application
- [ ] Add tag-based filtering in the Kanban sidebar
- [ ] Email reminders for follow-ups
- [ ] Deploy to AWS/GCP with Terraform
- [ ] Add end-to-end tests with Cypress

## Code of Conduct

Be respectful, constructive, and collaborative. We're all here to learn and build.
