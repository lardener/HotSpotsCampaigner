# Walking Skeleton: Battletech Campaign Manager

This is a TDD-first project for the Battletech Campaign Manager—a multi-tenant SaaS platform for managing Mercenaries campaigns using Chaos Campaign and Hinterlands rules.

## Features

 ✅ **Unified Identity System**: Support for both Google OAuth2 and "Invite-as-Identity" key-based access.
 ✅ **Invitation System**: Campaign Managers can generate secure tokens to invite players without requiring passwords or emails.
 ✅ **Role-Based Access Control (RBAC)**: Distinction between `ROLE_AUTHENTICATED` (Managers) and `ROLE_INVITED` (Players).
 ✅ **GraphQL API**: High-performance data fetching and real-time ledger updates via Spring GraphQL and Apollo Client.

## Invitation & Login System

The application uses an **"Invite-as-Identity"** model. Users exist in the `app_users` table with specific roles that determine their capabilities.

### User Roles
1.  **ROLE_AUTHENTICATED**: Logged in via Google OAuth. These users can act as Campaign Managers, create new campaigns, and generate invitation keys.
2.  **ROLE_INVITED**: Logged in via a Campaign Key. These users can participate in specific campaigns and manage their mercenary commands but cannot create or persist new campaigns.

### How to Invite a User (For Managers)
1.  **Log in** via Google to gain `ROLE_AUTHENTICATED` status.
2.  **Create a Campaign**: Use the "New Campaign" generator and save it.
3.  **Generate Token**: In the Campaign Management view, click "Generate Invite Key".
4.  **Share**: Copy the generated 12-character alphanumeric token (or the direct join link) and send it to your player (e.g., via Discord or Signal).

### How to Login as an Invited User (For Players)
1.  **Access the Site**: Navigate to the landing page.
2.  **Enter Key**: In the "Join Campaign" field, paste the token provided by your Manager.
3.  **Set Callsign**: Provide a display name (Callsign) to identify your mercenary command.
4.  **Join**: The system creates a transient session linked to that token. Your identity is stored as an `app_user` with `ROLE_INVITED`. 
5.  **Persistence**: Your session is maintained via a long-lived token in your browser. If you switch devices, simply re-enter the original Invite Key.

---

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
- **Apollo Client** for reactive data fetching and real-time subscriptions
- **CSS-based responsive layout** with centered welcome message

### Deployment
- **Docker Multi-stage builds** for optimized images
- **Docker Compose** for local orchestration
- **Environment-based configuration** for Google OAuth

## Next Steps

From this walking skeleton, you can:

1. **Event Sourcing** — Implement event store with MySQL.
2. **Kafka Integration** — Add event streaming for multi-service architecture.
3. **S3 Integration** — Implement campaign snapshot storage.
4. **JavaFX Desktop App** — Build local campaign viewer.

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
