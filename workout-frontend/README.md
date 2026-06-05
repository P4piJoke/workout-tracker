Frontend: workout-frontend

Overview
- React 19 single-page app built with Vite. Provides UI for logging workouts, viewing stats, managing exercises and preferences.

Features
- Dashboard with stats and progress charts
- Exercise list and management
- Log workout flow with modals and stepper
- Workout heatmap and progress charts
- Templates, personal records, and user preferences

Key technologies
- React 19, Vite
- @tanstack/react-query for data fetching
- axios for API calls
- keycloak-js for authentication
- recharts for charts
- ESLint for linting

Important files
- Config & deps: [package.json](package.json#L1-L40)
- Keycloak init: [src/auth/keycloak.js](src/auth/keycloak.js#L1-L120)
- API client: [src/api/axiosClient.js](src/api/axiosClient.js#L1-L120)
- Main entry: [src/main.jsx](src/main.jsx#L1-L120)

Run (development)

```bash
cd workout-frontend
npm install
npm run dev
```

Notes
- Adjust Keycloak settings in `src/auth/keycloak.js` to match your Keycloak server.
