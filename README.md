# Job Application Tracker

A full-stack web application for tracking job applications in one place. The project lets users register, log in, add applications, update their status, manage notes, and monitor progress through a simple dashboard.

## Overview

This project was developed for the **Managementul Proiectelor Informatice** course and follows a client-server architecture. The application combines a React frontend, a NestJS backend, a PostgreSQL database, Docker-based setup, and a GitHub-based workflow with issues, pull requests, and CI.

## Main Features

- user registration and login
- protected application area
- create a new job application
- view all applications for the current user
- filter applications by status
- edit existing applications
- delete applications with confirmation
- add, edit, and delete notes for an application
- dashboard statistics for application progress
- Docker-based local setup
- automated tests and CI workflow support

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router
- Axios

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- Jest

### DevOps / Tooling
- Docker
- Docker Compose
- GitHub Actions
- GitHub Projects
- Playwright

## Architecture

The application uses a **client-server architecture**:

- **Frontend**: React application responsible for UI, routing, forms, and API integration
- **Backend**: NestJS REST API responsible for authentication, business logic, validation, and data access
- **Database**: PostgreSQL database managed through Prisma schema and migrations

### Backend modules
- **Auth module**: register and login flows
- **Applications module**: create, list, update, delete, filter, statistics
- **Notes support**: attach notes to each application

### Database entities
- **User**
- **JobApplication**
- **ApplicationNote**

## Project Management and Workflow

The team used GitHub Issues, GitHub Projects, milestones, pull requests, and GitHub Actions to manage and deliver the application.

### GitHub Projects - Table View

<img width="1919" height="805" alt="Screenshot 2026-04-22 213156" src="https://github.com/user-attachments/assets/c4e23e72-6d53-4d77-ab03-546c3cc2bcd5" />

### GitHub Projects - Board View

<img width="1919" height="925" alt="Screenshot 2026-04-22 213230" src="https://github.com/user-attachments/assets/5dac0a61-c717-40af-b61b-40613a90989a" />

### Closed Issues

<img width="1919" height="925" alt="Screenshot 2026-04-22 213230" src="https://github.com/user-attachments/assets/9ac822ed-f6cd-46c6-a39b-d66233da6135" />

### GitHub Actions / CI Pipeline

<img width="1843" height="1005" alt="Screenshot 2026-04-22 213530" src="https://github.com/user-attachments/assets/93799627-599a-4d81-b4c3-f68c669694cf" />

### Roadmap View

<img width="1297" height="657" alt="Screenshot 2026-04-22 215006" src="https://github.com/user-attachments/assets/e5acf5a5-9285-4bb5-9e15-aa2878855014" />

### Burnup Chart

<img width="1154" height="766" alt="Screenshot 2026-04-22 212816" src="https://github.com/user-attachments/assets/5baff9dd-2873-4094-a563-5a0b76cb5767" />

## Local Setup

### Run with Docker

From the project root:

```bash
docker compose up --build
```

### Services

- frontend: available on port **80**
- backend: available on port **3000**
- database: PostgreSQL on port **5432**

## Backend Testing

Run backend unit tests:

```bash
cd backend
npm install
npm test
```

Run backend build:

```bash
npm run build
```

## Frontend Testing

Run frontend development server:

```bash
cd frontend
npm install
npm run dev
```

Playwright tests are available in the frontend test folder.

## Example Repository Structure

```text
MPI-Project/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── test/
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   ├── e2e/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Team

Example role split for the project:

- **Backend Developer** - API, business logic, database, tests
- **Frontend Developer** - UI, routing, forms, API integration
- **QA Engineer** - test cases, E2E testing, validation
- **DevOps Engineer** - Docker, CI/CD, workflow automation


## Notes

- backend uses Prisma with PostgreSQL
- backend unit tests are written with Jest
- frontend is built with Vite and React
- the project can be started from the root using Docker Compose

## Quick Start

```bash
docker compose up --build
```


