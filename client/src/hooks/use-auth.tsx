import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Client } from '../lib/api-client';

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Check if user is already logged in
  const { data, isLoading } = useQuery({
    queryKey: ['auth-status'],
    queryFn: async () => {
      try {
        const response = await Client.get('/api/auth/me');
        return response.data;
      } catch (error) {
        return null;
      }
    },
  });

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  const login = async (email: string, password: string) => {
    const response = await Client.post('/api/auth/login', {
      email,
      password,
    });
    setUser(response.data);
  };

  const signup = async (name: string, email: string, password: string) => {
    const response = await Client.post('/api/auth/signup', {
      name,
      email,
      password,
    });
    setUser(response.data);
  };

  const logout = async () => {
    await Client.post('/api/auth/logout');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
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

export default useAuth;