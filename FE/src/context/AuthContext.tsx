import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';
import { userData } from '../data/userData';
import { useLoginMutation } from '../store/api/codeApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginApi, { loginApiLoading }] = useLoginMutation();
  // In a real app, this would make an API call to authenticate
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await loginApi({ email, password });
    
    // For demo, any non-empty combination works, and we use the sample user
    if (email && password) {
      setUser(userData);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  // In a real app, this would make an API call to register
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (name && email && password) {
      // Create new user based on input (in a real app this would be stored in a database)
      const newUser = {
        ...userData,
        name,
        email,
      };
      setUser(newUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};