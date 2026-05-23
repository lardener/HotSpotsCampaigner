# Simple script to sync the backend schema to the root for frontend tooling
$source = "backend/src/main/resources/graphql/schema.graphqls"
$destination = "schema.graphqls"

Copy-Item -Path $source -Destination $destination -Force
Write-Host "GraphQL Schema synchronized successfully." -ForegroundColor Green