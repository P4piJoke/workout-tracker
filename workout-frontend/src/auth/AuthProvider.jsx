import { createContext, useContext, useEffect, useState } from 'react';
import keycloak from './keycloak';
import Toast from '../components/Toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    keycloak
      .init({
        onLoad: 'login-required',
        checkLoginIframe: false,
        pkceMethod: 'S256',
      })
      .then(() => {
        setReady(true);
        // Keycloak sets email_verified on the token after verification
        if (keycloak.tokenParsed?.email_verified) {
          const alreadyShown = sessionStorage.getItem('email_verified_toast');
          if (!alreadyShown) {
            setShowToast(true);
            sessionStorage.setItem('email_verified_toast', 'true');
          }
        }
      })
      .catch(console.error);

    const interval = setInterval(() => {
      keycloak.updateToken(60).catch(() => keycloak.logout());
    }, 10_000);

    return () => clearInterval(interval);
  }, []);

  if (!ready) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={keycloak}>
      {children}
      {showToast && (
        <Toast
          message="✓ Email confirmed — welcome to Workout Tracker!"
          onClose={() => setShowToast(false)}
        />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);