# HotSpots: Campaigner

A multi-tenant SaaS platform for managing Battletech Mercenaries campaigns using Chaos Campaign, Hinterlands, Draconis Reach rules.  The goal is not strict rules enforcement.  Rather, the program aims to reduce the congnitive load when dealing with the "bookkeeping" of the campaign.  Common computaitons should be precomputed but give the user the opportunity to override.  Uncommon entries can be managed by direct ledger entries.  The desired end state will allow a player group to complete their bookkeeping for a given track in just a couple of minutes after completing the game, while the game store staff is trying to close up.

## Features

 ✅ **Unified Identity System**: Support for both Google OAuth2 and "Invite-as-Identity" key-based access.
 ✅ **Invitation System**: Campaign Managers can generate secure tokens to invite players without requiring passwords or emails.
 ✅ **Role-Based Access Control (RBAC)**: Distinction between `ROLE_AUTHENTICATED` (Managers) and `ROLE_INVITED` (Players).
 ✅ **GraphQL API**: Unified reactive API entry point for all campaign, command, and ledger operations.
 ✅ **Production-Ready Persistence**: Designed for Managed MySQL and S3-compatible object storage.
 ✅ **Command & Control Navigation**: Hierarchical tree-based navigation for managing multiple detachments across different theaters.
 ✅ **Theater Management Console**: Full control for Campaign Managers to schedule tracks, manage recruitment, and audit participating forces.
 ✅ **Global Data Synchronization**: Manual and automatic real-time synchronization of tactical data across all command interfaces.
 ✅ **Temporal Logistics**: Manage campaign tracks and schedules across operational months with drag-and-drop scheduling.
 ✅ **Ledger-First Financials**: All Support Points and Reputation are derived from a verifiable transaction ledger, ensuring an immutable audit trail for every command.
 ✅ **Interactive Briefings**: Campaign managers can embed special `hsc://` links within markdown briefings. These links can trigger in-app actions for participants, such as opening a pre-filled unit procurement form for a specific asset.



## Invitation & Login System

The application uses an **"Invite-as-Identity"** model. Users exist in the `app_users` table with specific roles that determine their capabilities.

### User Roles
1.  **ROLE_AUTHENTICATED**: Logged in via Google OAuth. These users can act as Campaign Managers, create new campaigns, and generate invitation keys.
2.  **ROLE_INVITED**: Logged in via a Campaign Key. These users can participate in specific campaigns and manage their mercenary commands but cannot create or persist new campaigns.

### How to Invite a User (For Managers)
1.  **Log in** via Google to gain `ROLE_AUTHENTICATED` status.
2.  **Create a Campaign**: Use the "Campaign Generator" and save it.
3.  **Generate Token**: In the Campaign Management view, click "Generate Invite Key".
4.  **Share**: Copy the generated 12-character alphanumeric token (or the direct join link) and send it to your player (e.g., via Discord or Signal).

### How to Login as an Invited User (For Players)
1.  **Access the Site**: Navigate to the landing page.
2.  **Enter Key**: In the "Join Campaign" field, paste the token provided by your Manager.
3.  **Set Callsign**: Provide a display name (Callsign) to identify your mercenary command.
4.  **Join**: The system creates a transient session linked to that token. Your identity is stored as an `app_user` with `ROLE_INVITED`. 
5.  **Persistence**: Your session is maintained via a long-lived token in your browser. If you switch devices, simply re-enter the original Invite Key.

---

### Interactive Briefing Example

Campaign managers can embed interactive links in their markdown operational briefings. For example, to list a 'Mech for sale:

```markdown
### BLACK MARKET ASSET AVAILABLE
Intelligence reports a pristine chassis is available for immediate acquisition:

* [PURCHASE SHADOW HAWK SHD-2K (1000 SP)](hsc://procure?model=Shadow%20Hawk&variant=SHD-2K&bv=1064&pv=38&sz=2&type=BM&tech=Inner%20Sphere&tons=55&price=1000)
```

Clicking this link will open a pre-filled procurement form for the user, allowing them to purchase the unit if they have sufficient Support Points.

Campaign managers can also embed links for pilot recruitment. For example, to hire a veteran pilot at a special rate:
```markdown
### RECRUITMENT OPPORTUNITY 
A seasoned pilot, "Viper," is available for immediate hire:

* [HIRE PILOT "VIPER" (200 SP)](hsc://hire?name=Viper&unitType=BM&gunnerySpEarned=300&pilotingSpEarned=100&price=200&edgeTokensSpEarned=150&edgeAbilities=Hot%20Shot%2C%20Part%20Deux)


hsc://procure Link Parameters:
* model: Chassis name (e.g., Shadow%20Hawk).
* variant: Specific variant code (e.g., SHD-2K).
* bv: Battle Value. Used for default price calculation.
* pv: Point Value (Alpha Strike).
* sz: Unit Size (Alpha Strike, 1-4).
* type: Unit classification code (BM, CV, BA, etc.).
* tech: Technology base (e.g., Inner%20Sphere, Clan).
* tons: Unit tonnage.
* price: (Optional) Manual Support Point cost override. If omitted, cost is calculated from BV and Tech Base.

hsc://hire Link Parameters: 
* name: Pilot's callsign/name (e.g., Viper). 
* unitType: Preferred unit type (e.g., BM, CV). 
* wounds: Initial wounds (e.g., 0). 
* gunnerySpEarned: SP allocated to Gunnery. 
* pilotingSpEarned: SP allocated to Piloting. 
* edgeTokensSpEarned: SP allocated to Edge Tokens. 
* edgeAbilitySpEarned: SP allocated to Edge Abilities. 
* edgeAbilities: Description of Edge Abilities (e.g., Hot%20Shot). 
* price: (Optional) Manual Support Point hiring cost override. If omitted, cost is calculated from campaign rules or default.
```

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

## Database Migrations

The database schema is managed with **Flyway** (versioned SQL migrations), not the
old destructive `schema.sql` init script. Migrations run automatically at
application startup against the configured MySQL database.

### How it works
- Migrations live in `backend/src/main/resources/db/migration/` and follow the
  Flyway naming convention: `V<version>__<description>.sql` (e.g.
  `V1__init_schema.sql`).
- On startup, Flyway applies any pending migrations in version order and records
  them in a `flyway_schema_history` table. Each migration runs **exactly once**.
- Configuration is in `backend/src/main/resources/application.yml` under the
  `spring.flyway` key (`enabled`, `locations`, and `baseline-on-migrate`).

### First run on an existing database
The production database already has the schema from the old `schema.sql`. To
avoid re-creating (and dropping) that data, Flyway is configured with
`baseline-on-migrate: true` (baseline version `0`). The first boot records the
existing schema as already-applied at V1 and only applies *newer* migrations
going forward. **No data is lost.**

### Adding a schema change
1. Create a new migration file, e.g. `V2__add_unit_notes.sql`, with the
   `CREATE`/`ALTER` statements. Use `IF NOT EXISTS` where reasonable.
2. Never edit an already-applied migration — add a new, higher-versioned one.
3. Run the backend (or `mvn test`) to apply it. Flyway validates checksums, so
   changing an applied file will fail fast.

### Regenerating the V1 migration (optional)
`backend/src/main/java/com/hotspotscamp/SchemaGenerator.java` is a standalone
utility (`main` method) that regenerates `V1__init_schema.sql` from the entity
definitions. It is **non-destructive** (uses `CREATE TABLE IF NOT EXISTS`) and
is only a convenience — the migration file in `db/migration/` is the single
source of truth. Run it with:
```bash
cd backend
mvn -q compile exec:java -Dexec.mainClass=com.hotspotscamp.SchemaGenerator
```

### Local Docker note
`docker-compose.yml` no longer mounts a schema file into the MySQL container's
initdb. The schema is created entirely by Flyway when the backend starts, so
the database container only needs the data volume.

## Project Structure

```
.
├── backend/                  # Spring Boot 3 GraphQL backend
│   ├── src/main/java/com/hotspotscamp/
│   │   ├── BattletechCampaignApplication.java
│   │   ├── SchemaGenerator.java      # MySQL Schema utility (aligned with R2DBC)
│   │   ├── api/
│   │   │   ├── CampaignGraphQLController.java
│   │   │   ├── CommandGraphQLController.java
│   │   │   ├── UserGraphQLController.java
│   │   │   └── UserGraphQLController.java
│   │   ├── config/
│   │   │   └── SecurityConfig.java   # Reactive Security
│   │   ├── entity/                   # R2DBC Entities (Campaign, Contract, Ledger, etc.)
│   │   ├── repository/               # Reactive R2DBC Repositories
│   │   └── service/                  # Business Logic (Campaign Service, Command Service)
│   ├── src/test/java/com/hotspotscamp/api/ # GraphQL Integration Tests
│   └── pom.xml
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/               # UI Components
│   │   │   ├── CommandDashboard.tsx
│   │   │   ├── NavigationTree.tsx
│   │   │   ├── MyDeploymentsList.tsx
│   │   │   ├── LedgerEntryForm.tsx
│   │   │   ├── CampaignGenerator.tsx
│   │   │   ├── PilotEditor.tsx
│   │   │   ├── CampaignTheaterView.tsx
│   │   │   └── Welcome.tsx
│   │   ├── styles/
│   │   │   ├── theme.css             # Dynamic CRT Terminal Theming
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

### Production Deployment (OVHcloud)
The platform is designed to run on **Managed Kubernetes (MKS)**.
1.  **Secrets**: Managed via K8s Secrets (not `.env` files).
2.  **Ingress**: NGINX Ingress with TLS termination via `cert-manager`.
3.  **Database**: OVHcloud Managed MySQL (Business Plan) for HA.
4.  **Snapshots**: S3-compatible Object Storage for immutable campaign backups. 

### Security Roadmap

*   **Encryption**: All traffic must be served over HTTPS (TLS 1.3).
*   **GraphQL Safety**: 
    *   Query Depth Limiting (Max depth: 10).
    *   Query Complexity Analysis.
*   **Rate Limiting**: 
    *   Global API throttling.
    *   Specific brute-force protection on the `joinCampaign` mutation.
*   **Audit Logging**: All Campaign Manager actions (Invite generation, Detachment removal) are logged to an immutable audit trail.

### Backend (Spring Boot 3)
- **Reactive Stack**: Spring WebFlux and Project Reactor for non-blocking I/O.
- **Persistence**: Direct relational persistence using **Spring Data R2DBC** for reactive SQL connectivity to MySQL. (Event Sourcing has been deprecated in favor of this model).
- **Security**: Spring Security with dual OAuth2 (Google) and Token-based (Invite Key) identity providers. 
- **Persistence**: Spring Data R2DBC for reactive SQL connectivity to MySQL.
- **API**: Spring GraphQL acting as the sole gateway, reducing over-fetching and supporting real-time subscriptions.
- **Mapping**: The backend uses **MapStruct** for DTO-to-entity update flows, reducing repetitive field-copying boilerplate in services. Current mapper usage includes combat unit, pilot, command, campaign, and track updates under the backend mapper package.

### Frontend (React + TypeScript)
- **Apollo Client**: Manages local state and GraphQL communication with optimistic UI updates.
- **Tactical UI**: Custom CSS Grid-based layout featuring a terminal aesthetic and a persistent "Command & Control" sidebar.
- **TDD Tools**: Vitest and React Testing Library for component-level verification.

### Deployment
- **Docker Multi-stage builds** for optimized images
- **Docker Compose** for local orchestration
- **Environment-based configuration** for Google OAuth

## Next Steps

Upcoming development milestones:

1. **Automated Upkeep Logic** — Intelligent generation of ledger entries for maintenance and payroll based on active rosters.
2. **After-Action Workflow** — Streamlined interface for resolving combat pay, scrap values, and pilot medical recovery. 
3. **S3 Integration** — Implement campaign snapshot storage.
4. **JavaFX Desktop App** — Build local campaign viewer.

## Testing Strategy

This project follows **Test-Driven Development (TDD)**:
Not exactly.  The test strategy for this project needs revision.  It's become difficult to generate tests that can exercise the individual components and the full stack.

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
**Build**: Maven (backend), npm (frontend)
## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0) — the
latest version of the GPL. You should have received a copy of the license with this
project; if not, it is available at <https://www.gnu.org/licenses/gpl-3.0.html>.

```
                    GNU GENERAL PUBLIC LICENSE
                       Version 3, 29 June 2007

 Copyright (C) 2007 Free Software Foundation, Inc. <https://fsf.org/>
 Everyone is permitted to copy and distribute verbatim copies
 of this license document, but changing it is not allowed.

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
