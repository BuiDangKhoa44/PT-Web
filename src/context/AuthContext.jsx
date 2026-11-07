import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/endpoints.js';
import { tokenStore } from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // Khôi phục phiên khi F5
  useEffect(() => {
    if (!tokenStore.get()) { setBooting(false); return; }
    authApi.me().then(setUser).catch(() => tokenStore.clear()).finally(() => setBooting(false));
  }, []);

  // client.js bắn sự kiện này khi API trả 401
  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  const login = async (username, password) => {
    const res = await authApi.login(username, password);
    tokenStore.set(res.accessToken);
    setUser(res.user);
  };

  return <AuthContext.Provider value={{ user, booting, login, logout }}>{children}</AuthContext.Provider>;
}
