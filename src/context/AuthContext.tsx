import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventManager } from '../types';
import { authAPI } from '../utils/api';

interface AuthContextType {
  user: EventManager | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, otp: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, password: string, address: string) => Promise<void>;
  signupWithPhone: (name: string, phone: string, otp: string, address: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<EventManager>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<EventManager | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('eventManager');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData.token) {
            // Verify token with backend
            const response = await authAPI.getMe();
            if (response.success) {
              setUser(response.user);
            } else {
              localStorage.removeItem('eventManager');
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('eventManager');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const userData = {
          ...response.user,
          token: response.token
        };
        
        setUser(response.user);
        localStorage.setItem('eventManager', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, otp: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await authAPI.loginWithPhone(phone, otp);
      
      if (response.success) {
        const userData = {
          ...response.user,
          token: response.token
        };
        
        setUser(response.user);
        localStorage.setItem('eventManager', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Phone login failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Phone login failed');
    } finally {
      setLoading(false);
    }
  };


  const signup = async (name: string, email: string, phone: string, password: string, address: string): Promise<void> => {
  
    setLoading(true);
    try {
      const response = await authAPI.register(name, email, phone, password, address);
      
      if (response.success) {
        const userData = {
          ...response.user,
          token: response.token
        };
        
        setUser(response.user);
        localStorage.setItem('eventManager', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const signupWithPhone = async (name: string, phone: string, otp: string, address: string): Promise<void> => {
    setLoading(true);
    try {
      // For phone signup, we'll use email signup with a generated email
      const generatedEmail = `${phone.replace(/\D/g, '')}@phone.local`;
      const response = await authAPI.register(name, generatedEmail, 'TempPass123!', address);
      
      if (response.success) {
        const userData = {
          ...response.user,
          phone,
          token: response.token
        };
        
        setUser({ ...response.user, phone });
        localStorage.setItem('eventManager', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Phone signup failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Phone signup failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventManager');
  };

  const updateUser = (updates: Partial<EventManager>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Update localStorage while preserving token
      const savedData = localStorage.getItem('eventManager');
      if (savedData) {
        const userData = JSON.parse(savedData);
        localStorage.setItem('eventManager', JSON.stringify({
          ...userData,
          ...updatedUser
        }));
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginWithPhone,
      signup,
      signupWithPhone,
      logout,
      updateUser,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};