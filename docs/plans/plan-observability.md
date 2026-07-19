## Plan: Observability (Actuator + Metrics)

TL;DR: The backend has **no Actuator/Micrometer** dependency and emits verbose `[TRACE]` logs. Add Spring Boot Actuator + Micrometer Prometheus for health/readiness and GraphQL/WebFlux metrics, quiet the logging, and sanitize errors (complements the Security plan).

**Steps**
- [ ] Add dependencies to `backend/pom.xml`: `spring-boot-starter-actuator` and `io.micrometer:micrometer-registry-prometheus`. *Depends on: nothing.*
- [ ] Configure `backend/src/main/resources/application.yml`: expose `health` (with `liveness`/`readiness` groups) and `prometheus` endpoints; secure actuator (not public — keep behind the same auth as `/api`). Enable GraphQL observation (`spring.graphql.observation.enabled=true`) and WebFlux metrics (auto). *Depends on step 1.*
- [ ] Quiet logging: change `logging.level.com.hotspotscamp` from `INFO` (with pervasive `[TRACE]` calls) to `INFO`/`WARN` by default; gate trace logging behind a `trace` profile so the many `log.trace("[TRACE] ...")` calls are silent in prod. *Parallel.*
- [ ] Structured logging: add `net.logstash:logstash-logback-encoder` and a JSON appender in `backend/src/main/resources/logback-spring.xml` (compiled copy at `backend/target/classes/logback-spring.xml`); add a request/correlation MDC id. *Parallel.*
- [ ] Wire probes (depends on Security plan): point K8s `livenessProbe`/`readinessProbe` at `/actuator/health/liveness` and `/actuator/health/readiness`. *Depends on Security plan step 4.*
- [ ] Error envelope (shared with Security plan): ensure `api/GlobalErrorWebExceptionHandler.java` returns a consistent, non-leaking body that Prometheus/health can still distinguish. *Parallel with Security step 6.*

**Relevant files**
- `backend/pom.xml` — add actuator + micrometer-prometheus.
- `backend/src/main/resources/application.yml` (compiled: `backend/target/classes/application.yml`) — endpoint exposure + observation.
- `backend/src/main/resources/logback-spring.xml` (compiled: `backend/target/classes/logback-spring.xml`) — JSON encoder.
- `backend/src/main/java/com/hotspotscamp/api/GlobalErrorWebExceptionHandler.java` — safe error body.
- `ovhcloud-backend-deployment.yaml` — probes (with Security plan).

**Verification**
1. `curl /actuator/health` → `{"status":"UP"}`; `/actuator/health/liveness` and `/readiness` respond.
2. `curl /actuator/prometheus` emits `http_server_requests`, `graphql` and JVM metrics.
3. Logs in JSON with correlation id; no `[TRACE]` noise at default level.
4. (Optional) Scrape target configured in Prometheus; Grafana dashboard imports.

**Decisions**
- Prometheus pull model (standard for K8s).
- Excluded: distributed tracing (Micrometer Tracing / OpenTelemetry) — can be a later add-on.

**Further Considerations**
1. Add a Grafana dashboard JSON to `docs/` for reuse.
2. Alert rules (e.g., 5xx rate, pod restart) — define in Prometheus.
