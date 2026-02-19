import React, {createContext, useContext, useState, useCallback} from 'react';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = useCallback((userData, authToken = null) => {
    setUser(userData);
    setToken(authToken);
    setIsLoggedIn(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
  }, []);

  return (
    <AuthContext.Provider value={{isLoggedIn, user, token, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
