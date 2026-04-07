import React, { createContext, useContext, useState, useCallback } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);


const TOKEN_KEY = "jwt_token";
const USER_KEY  = "user_info";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ username, password });
      const { token, role, name } = response.data;

      
      sessionStorage.setItem(TOKEN_KEY, token);

      const userData = { username, role, name: name || username };
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData));

      setUser(userData);
      setLoading(false);
      return { success: true };

    } catch (err) {
      setLoading(false);
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        return { success: false, error: "Identifiants incorrects. Veuillez réessayer." };
      }
      if (status >= 500) {
        return { success: false, error: "Erreur serveur. Contactez l'administrateur." };
      }
      return { success: false, error: "Impossible de joindre le serveur." };
    }
  }, []);

  
  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  
  const getToken = useCallback(() => {
    return sessionStorage.getItem(TOKEN_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, getToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);