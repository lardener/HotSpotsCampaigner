# Syncs the GraphQL schema (NOT the database schema) from the backend resources
# to the repo root so the frontend GraphQL codegen (codegen.ts) can read it.
# Database schema is now managed by Flyway migrations under
# backend/src/main/resources/db/migration (see docs/plans/plan-db-migrations.md).
$source = "backend/src/main/resources/graphql/schema.graphqls"
$destination = "schema.graphqls"

Copy-Item -Path $source -Destination $destination -Force
Write-Host "GraphQL Schema synchronized successfully." -ForegroundColor Green