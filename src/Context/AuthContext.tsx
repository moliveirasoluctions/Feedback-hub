import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration
const MOCK_USERS = {
  'admin@feedbackhub.com': {
    id: '1',
    name: 'Sarah Johnson',
    email: 'admin@feedbackhub.com',
    role: 'admin' as UserRole,
    status: 'active' as const,
    department: 'Technology',
    position: 'System Administrator',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-15',
    lastLogin: new Date().toISOString(),
  },
  'manager@feedbackhub.com': {
    id: '2',
    name: 'Michael Chen',
    email: 'manager@feedbackhub.com',
    role: 'manager' as UserRole,
    status: 'active' as const,
    department: 'Sales',
    position: 'Sales Manager',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-01-20',
    lastLogin: new Date().toISOString(),
  },
  'user@feedbackhub.com': {
    id: '3',
    name: 'Emma Davis',
    email: 'user@feedbackhub.com',
    role: 'user' as UserRole,
    status: 'active' as const,
    department: 'Marketing',
    position: 'Marketing Specialist',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    createdAt: '2024-02-01',
    lastLogin: new Date().toISOString(),
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('feedbackhub_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call your API
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    const userData = MOCK_USERS[email as keyof typeof MOCK_USERS];
    if (userData && password === 'password123') {
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('feedbackhub_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('feedbackhub_user');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}