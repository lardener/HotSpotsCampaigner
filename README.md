# Walking Skeleton: Battletech Campaign Manager

This is a TDD-first project for the Battletech Campaign Manager—a multi-tenant SaaS platform for managing Mercenaries campaigns using Chaos Campaign and Hinterlands rules.

## Features

- ✅ Google OAuth2 login
- ✅ User profile display
- ✅ Welcome message centered on screen
- ✅ **Random Campaign Generator**: Procedural generation of theater tracks, missions, and contracts based on Hinterlands rules.
- ✅ **Ledger & SP Tracking**: Full Support Point (SP) lifecycle management with automated command-level synchronization.
- ✅ **Active Deployment Dashboard**: Real-time view of ongoing mercenary contracts and sector intelligence.
- ✅ Docker containerization for local deployment
- ✅ Test-driven development approach

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Google OAuth2 credentials (for production; not needed for local testing)

### Local Development with Docker

1. **Set up Google OAuth credentials** (optional for local testing):
   ```bash
   cp .env.example .env
   # Edit .env with your Google OAuth credentials
   ```

2. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

> The MySQL data is persisted in a named Docker volume (`mysql_data`) so the database is not destroyed when the container is recreated. Use `docker compose down -v` only if you want to remove the stored data.

#### Docker volume management
- Inspect available volumes:
  ```bash
  docker volume ls
  ```
- Inspect the Battletech volume:
  ```bash
  docker volume inspect battletech_mysql_data
  ```
- Remove the persisted database data intentionally:
  ```bash
  docker compose down -v
  ```

### Local Development (No Docker)

**Backend Setup**:
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will run on http://localhost:8080

**Frontend Setup**:
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:3000

### Running Tests

**Backend Tests**:
```bash
cd backend
mvn test
```

**Frontend Tests**:
```bash
cd frontend
npm test
```

## Project Structure

```
.
├── backend/                  # Spring Boot 3 GraphQL backend
│   ├── src/main/java/com/hotspotscamp/
│   │   ├── BattletechCampaignApplication.java
│   │   ├── SchemaGenerator.java      # MySQL Schema utility
│   │   ├── api/
│   │   │   ├── CampaignController.java
│   │   │   ├── LedgerController.java
│   │   │   └── UserController.java
│   │   ├── config/
│   │   │   └── SecurityConfig.java   # Reactive Security
│   │   ├── entity/                   # R2DBC Entities (Campaign, Contract, Ledger, etc.)
│   │   ├── repository/               # Reactive R2DBC Repositories
│   │   └── service/                  # Business Logic (Campaign Generation, Ledger Sync)
│   ├── src/test/java/com/hotspotscamp/api/
│   │   └── UserControllerTest.java
│   └── pom.xml
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/               # UI Components
│   │   │   ├── LedgerEntryForm.tsx
│   │   │   ├── RandomCampaignGenerator.tsx
│   │   │   └── Welcome.tsx
│   │   ├── services/                 # API Clients (campaignApi, ledgerApi)
│   │   ├── styles/
│   │   │   ├── index.css
│   │   │   └── ...
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── .github/agents/
│   └── battletech-campaign-builder.agent.md
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── .env.example
└── README.md
```

## Architecture

### Backend (Spring Boot 3)
- **Spring WebFlux** for high-concurrency, reactive, non-blocking I/O
- **Spring Security** with OAuth2 for Google login
- **Spring Data R2DBC** for reactive SQL persistence (MySQL)
- **Testable controller layer** with full security context

### Frontend (React + TypeScript)
- **Vite** for fast development and optimized builds
- **Vitest** for component testing
- **Apollo Client** ready (for future GraphQL integration)
- **CSS-based responsive layout** with centered welcome message

### Deployment
- **Docker Multi-stage builds** for optimized images
- **Docker Compose** for local orchestration
- **Environment-based configuration** for Google OAuth

## Next Steps

From this walking skeleton, you can:

1. **GraphQL Migration** — Transition REST endpoints to Spring GraphQL for flexible queries.
2. **Event Sourcing** — Implement event store with PostgreSQL
4. **Kafka Integration** — Add event streaming for multi-service architecture
5. **PostgreSQL Move** — Migrate from MySQL to PostgreSQL for advanced JSONB support.
6. **S3 Integration** — Implement campaign snapshot storage
7. **JavaFX Desktop App** — Build local campaign viewer

## Testing Strategy

This project follows **Test-Driven Development (TDD)**:

1. **Backend**: JUnit 5 with Spring Test, Mockito, Reactor Test
2. **Frontend**: Vitest with React Testing Library
3. **Integration**: Docker Compose for full-stack local testing

Run tests:
```bash
# Backend
cd backend && mvn test

# Frontend
cd frontend && npm test
```

## Environment Variables

Create a `.env` file (copy from `.env.example`):

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

## Security Notes

- This is a walking skeleton; for production, secure credentials storage (Vault, environment variables)
- CORS is configured for localhost:3000 only
- JWT implementation is prepared for future use
- OAuth2 token handling follows Spring Security best practices

## Technologies

- **Backend**: Spring Boot 3, Spring WebFlux, Spring Security, OAuth2
- **Frontend**: React 18, TypeScript, Vite, Vitest
- **Container**: Docker, Docker Compose
- **Build**: Maven (backend), npm (frontend)

## License

(Add your license here)
