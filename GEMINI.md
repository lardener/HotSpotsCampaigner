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

## Refactoring Progress

### ✅ Completed Frontend Refactoring (2025-05-22)

#### 1. Skill Thresholds Extraction
- **File Created**: `frontend/src/constants/pilotThresholds.ts`
- **Contains**: `gunneryThresholds`, `pilotingThresholds`, `edgeTokensThresholds`, `edgeAbilityThresholds` arrays + `getActiveThreshold()` helper
- **Benefit**: Centralized threshold definitions, improved testability

#### 2. Pilot Calculation Logic Extraction
- **File Created**: `frontend/src/util/pilotCalculations.ts`
- **Contains**: `recalcDerived()` function (calculates totalSpEarned, maps SP→skills, asSkill, handicap)
- **Benefit**: Separated calculation logic from UI, reduced component complexity
- **Status**: Both extractions verified via TypeScript compilation (no errors)

### 📋 Pending Refactoring Tasks
- [ ] Extract pricing logic from `CombatUnitEditor.tsx`
- [ ] Extract financial calculations from `AfterActionReportEditor.tsx`
- [ ] Backend service decomposition (CampaignService, MercenaryCommandService)
- [ ] Unified GraphQL client standardization

## Key Directories
- `backend/src/main/java/` - Java backend source
- `frontend/src/components/` - React UI components
- `frontend/src/constants/` - Application constants and thresholds
- `frontend/src/util/` - Utility functions and helpers
- `frontend/src/services/` - API/GraphQL client services
- `docs/plans/` - Detailed expansion and migration plans
- `ssl_cert/` - Kubernetes SSL/TLS certificates
