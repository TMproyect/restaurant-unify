
import React, { createContext, useState, useContext, ReactNode } from 'react';

// Define user roles
export type UserRole = 'admin' | 'waiter' | 'kitchen' | 'delivery' | 'manager';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Define auth context type
interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample user data (in a real app, this would come from a backend)
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@restaurant.com',
    role: 'admin',
    avatar: '/admin-avatar.jpg',
  },
  {
    id: '2',
    name: 'Carlos Mesero',
    email: 'waiter@restaurant.com',
    role: 'waiter',
    avatar: '/waiter-avatar.jpg',
  },
  {
    id: '3',
    name: 'Maria Cocinera',
    email: 'kitchen@restaurant.com',
    role: 'kitchen',
    avatar: '/chef-avatar.jpg',
  },
  {
    id: '4',
    name: 'Pedro Delivery',
    email: 'delivery@restaurant.com',
    role: 'delivery',
    avatar: '/delivery-avatar.jpg',
  },
];

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user is stored in localStorage on init
    const storedUser = localStorage.getItem('restaurant_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email: string, password: string) => {
    // This is a mock implementation - in a real app this would call a backend API
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = MOCK_USERS.find(u => u.email === email);
        
        // For demo purposes, any password works
        if (foundUser) {
          setUser(foundUser);
          localStorage.setItem('restaurant_user', JSON.stringify(foundUser));
          resolve();
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 800); // Simulate API delay
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('restaurant_user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
