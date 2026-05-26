import { createContext, useContext, useEffect, useState } from 'react';
import keycloak from './keycloak';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    keycloak
      .init({
        onLoad:            'login-required',   // redirect to Keycloak if not logged in
        checkLoginIframe:  false,
        pkceMethod:        'S256',             
      })
      .then(() => setReady(true))
      .catch(console.error);

    // silent token refresh — runs every 10s, refreshes if <60s left
    const interval = setInterval(() => {
      keycloak.updateToken(60).catch(() => keycloak.logout());
    }, 10_000);

    return () => clearInterval(interval);
  }, []);

  if (!ready) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={keycloak}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);