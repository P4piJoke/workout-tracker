Backend: workout-tracker-be

Summary
- Spring Boot 4 backend providing REST API and data persistence for the Workout Tracker.

Core responsibilities / features
- Exposes APIs for workouts, exercises, templates, stats, user preferences and body metrics.
- Integrates with MongoDB for primary data storage and Elasticsearch for search/analytics.
- Uses Redis for caching.
- Secured as an OAuth2 resource server (Keycloak) for authentication/authorization.

Key technologies
- Java 26, Spring Boot 4
- Spring Data MongoDB, Spring Data Elasticsearch
- Spring Security OAuth2 resource server (Keycloak)
- Redis caching, Spring Cache
- Validation, WebMVC, Lombok

Configuration & important files
- Main app: [src/main/java/com/ppjk/workouttracker/WorkoutTrackerApplication.java](src/main/java/com/ppjk/workouttracker/WorkoutTrackerApplication.java#L1-L120)
- Application properties: [src/main/resources/application.yaml](src/main/resources/application.yaml#L1-L80)
- Dependencies: [pom.xml](workout-tracker-be/pom.xml#L1-L160)

Run (development)

```bash
cd workout-tracker-be
# Unix/macOS
./mvnw spring-boot:run
# Windows
mvnw.cmd spring-boot:run
```

Run tests

```bash
cd workout-tracker-be
./mvnw test
# or on Windows: mvnw.cmd test
```

Notes
- Ensure MongoDB, Elasticsearch, Redis, and Keycloak are running and reachable.
