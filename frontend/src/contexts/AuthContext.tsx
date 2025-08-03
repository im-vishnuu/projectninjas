import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define the shape of your user object
interface User {
  userId: number;
  email: string;
}

// Define the shape of the authentication context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load token and user from localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem('projectninjas_token');
    const storedUser = localStorage.getItem('projectninjas_user');

    // --- ADDED CONSOLE.LOGS ---
    console.log('[AUTH_CONTEXT]: Initializing. Stored Token:', storedToken ? 'Exists' : 'Missing');
    console.log('[AUTH_CONTEXT]: Initializing. Stored User:', storedUser ? 'Exists' : 'Missing');

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        console.log('[AUTH_CONTEXT]: User and token restored from localStorage.');
      } catch (e) {
        console.error('[AUTH_CONTEXT]: Failed to parse stored user or token:', e);
        // Clear invalid data
        localStorage.removeItem('projectninjas_token');
        localStorage.removeItem('projectninjas_user');
      }
    } else {
        console.log('[AUTH_CONTEXT]: No user or token found in localStorage.');
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      // --- ADDED CONSOLE.LOGS ---
      console.log('[AUTH_CONTEXT]: Login API response received. Token:', receivedToken ? 'Exists' : 'Missing', 'User:', receivedUser);

      localStorage.setItem('projectninjas_token', receivedToken);
      localStorage.setItem('projectninjas_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      console.log('[AUTH_CONTEXT]: User logged in successfully and state updated.');
      return true;
    } catch (error: any) {
      console.error('[AUTH_CONTEXT]: Login failed:', error.response?.data || error.message || error);
      // Clear any potentially stale or invalid data
      localStorage.removeItem('projectninjas_token');
      localStorage.removeItem('projectninjas_user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
      return false;
    }
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;

      // --- ADDED CONSOLE.LOGS ---
      console.log('[AUTH_CONTEXT]: Register API response received. Token:', receivedToken ? 'Exists' : 'Missing', 'User:', receivedUser);

      localStorage.setItem('projectninjas_token', receivedToken);
      localStorage.setItem('projectninjas_user', JSON.stringify(receivedUser));

      setToken(receivedToken);
      setUser(receivedUser);
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      console.log('[AUTH_CONTEXT]: User registered and logged in successfully.');
      return true;
    } catch (error: any) {
      console.error('[AUTH_CONTEXT]: Registration failed:', error.response?.data || error.message || error);
      localStorage.removeItem('projectninjas_token');
      localStorage.removeItem('projectninjas_user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      delete axios.defaults.headers.common['Authorization'];
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
    console.log('[AUTH_CONTEXT]: User logged out.');
  };

  const contextValue = { user, token, isAuthenticated, login, register, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
