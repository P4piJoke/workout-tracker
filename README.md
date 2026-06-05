Project: Workout Tracker

Overview
- Monorepo with a React + Vite frontend and a Spring Boot backend.
- Features: dashboard, exercise library, log workouts, templates, overload tracking, statistics, body metrics, personal records, preferences.

Key technologies
- Frontend: React 19, Vite, @tanstack/react-query, axios, keycloak-js, recharts. See [workout-frontend/package.json](workout-frontend/package.json#L1-L40).
- Backend: Spring Boot 4 (Java 26), Spring Data MongoDB, Elasticsearch, Redis, OAuth2 resource server (Keycloak), caching, validation, Lombok. See [workout-tracker-be/pom.xml](workout-tracker-be/pom.xml#L1-L120).

Runtime services (expected)
- MongoDB: mongodb://localhost:27017 (db: workout_tracker)
- Elasticsearch: http://localhost:9200
- Redis: localhost:6379
- Keycloak: http://localhost:8180 (realm: workout-tracker)
- Backend server port: 8080
- Frontend dev server port: 5173

How to run (quick)
- Start required services: MongoDB, Elasticsearch, Redis, Keycloak.
- Backend (from repo root):

```bash
cd workout-tracker-be
./mvnw spring-boot:run    # Unix/macOS
# or on Windows:
mvnw.cmd spring-boot:run
```

- Frontend:

```bash
cd workout-frontend
npm install
npm run dev
```

Notes
- Backend config is in [workout-tracker-be/src/main/resources/application.yaml](workout-tracker-be/src/main/resources/application.yaml#L1-L50).
- Frontend Keycloak config is in [workout-frontend/src/auth/keycloak.js](workout-frontend/src/auth/keycloak.js#L1-L120).
