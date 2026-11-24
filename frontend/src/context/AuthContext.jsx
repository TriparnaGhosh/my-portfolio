import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("portfolio_user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("portfolio_user");
      return null;
    }
  });
  async function signIn(password) {
    const { data } = await api.post("/auth/login", { password });
    localStorage.setItem("portfolio_token", data.token);
    localStorage.setItem("portfolio_user", JSON.stringify(data.user));
    setUser(data.user);
  }
  function signOut() { localStorage.removeItem("portfolio_token"); localStorage.removeItem("portfolio_user"); setUser(null); }
  return <AuthContext.Provider value={{ user, signIn, signOut }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
