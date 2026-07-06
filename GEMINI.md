# HotSpots Campaigner - Project Documentation

## Overview
A web application for managing mercenary campaigns in a tactical combat game, featuring pilot management, campaign lifecycle tracking, and after-action reporting.

## Architecture

### Backend (Java 25 + Spring Boot 3.5.14)
- **Framework**: Spring Boot 3.5.14 with Spring Data R2DBC (reactive database access)
- **API**: GraphQL API layer
- **Reactive Stack**: Project Reactor for async/non-blocking operations
- **Build**: Maven (see `backend/pom.xml`)

### Frontend (React 19 + TypeScript)
- **Framework**: React 19 with TypeScript
- **Build**: Vite
- **State**: useReducer, useState, useMemo, useEffect
- **GraphQL Client**: Apollo Client
- **UI**: @floating-ui/react for overlays/dropdowns

### Deployment
- Docker containers (backend, frontend, database)
- Kubernetes manifests for OVHcloud deployment
- Docker Compose for local development

## Key Directories
- `backend/src/main/java/` - Java backend source
- `frontend/src/components/` - React UI components
- `frontend/src/constants/` - Application constants and thresholds
- `frontend/src/util/` - Utility functions and helpers
- `frontend/src/services/` - API/GraphQL client services
- `docs/plans/` - Detailed expansion and migration plans
- `ssl_cert/` - Kubernetes SSL/TLS certificates

## Environment Notes
- **Build Environment**
    - **Local PowerShell Policy** - issue shell commands using the Windows command shim