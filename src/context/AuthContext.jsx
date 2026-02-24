import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username, password) => {
    // Single user credentials - replace with Spring Boot API call later
    if (username === "admin" && password === "admin123") {
      const userData = { username: "admin", role: "ADMIN", name: "Administrateur" };
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    }
    return { success: false, error: "Identifiants incorrects" };
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
