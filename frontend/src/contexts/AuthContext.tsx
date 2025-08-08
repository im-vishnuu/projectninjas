import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface User {
  userId: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean; // <-- New state to track loading
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // <-- Initialize as true

  useEffect(() => {
    const storedToken = localStorage.getItem('projectninjas_token');
    const storedUser = localStorage.getItem('projectninjas_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch (e) {
        console.error('Failed to parse stored auth data:', e);
        localStorage.clear(); // Clear corrupted data
      }
    }
    // Finished checking storage, so set loading to false
    setIsAuthLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      localStorage.setItem('projectninjas_token', receivedToken);
      localStorage.setItem('projectninjas_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/register`, { email, password });
        const { token: receivedToken, user: receivedUser } = response.data;

        localStorage.setItem('projectninjas_token', receivedToken);
        localStorage.setItem('projectninjas_user', JSON.stringify(receivedUser));

        setToken(receivedToken);
        setUser(receivedUser);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
        return true;
    } catch (error) {
        console.error('Registration failed:', error);
        return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('projectninjas_token');
    localStorage.removeItem('projectninjas_user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    delete axios.defaults.headers.common['Authorization'];
  };

  const contextValue = { user, token, isAuthenticated, isAuthLoading, login, register, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};