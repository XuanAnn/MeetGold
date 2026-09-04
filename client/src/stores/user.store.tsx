import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginDto, RegisterDto } from '@meetdraw/shared';
import { apiService } from '../services/api';

const USER_COLORS: Record<string, string> = {
  'alex@meetdraw.io': '#4f46e5', // Indigo
  'chloe@meetdraw.io': '#ec4899', // Pink
  'sarah@meetdraw.io': '#10b981', // Emerald
  'admin@meetdraw.io': '#06b6d4', // Cyan
};

const DEFAULT_COLORS = [
  '#4f46e5',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
];

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  displayName: string;
  userColor: string;
  setUserColor: (color: string) => void;
  updateGuestName: (name: string) => void;
  login: (dto: LoginDto) => Promise<User>;
  register: (dto: RegisterDto) => Promise<User>;
  quickLogin: (email: string) => Promise<User>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userColor, setUserColorState] = useState<string>('#4f46e5');
  const [guestName, setGuestName] = useState<string>('Guest');

  const updateGuestName = (name: string) => {
    setGuestName(name);
    if (currentUser) {
      setCurrentUser({ ...currentUser, username: name });
    }
  };

  useEffect(() => {
    const token = apiService.getToken();
    if (token) {
      apiService
        .getMe()
        .then((res) => {
          setCurrentUser(res.user);
          const color = USER_COLORS[res.user.email] || DEFAULT_COLORS[Math.abs(res.user.email.length) % DEFAULT_COLORS.length];
          setUserColorState(color);
        })
        .catch(() => {
          apiService.logout();
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (dto: LoginDto): Promise<User> => {
    const res = await apiService.login(dto);
    setCurrentUser(res.user);
    const color = USER_COLORS[res.user.email] || DEFAULT_COLORS[Math.abs(res.user.email.length) % DEFAULT_COLORS.length];
    setUserColorState(color);
    return res.user;
  };

  const register = async (dto: RegisterDto): Promise<User> => {
    const res = await apiService.register(dto);
    setCurrentUser(res.user);
    const color = USER_COLORS[res.user.email] || DEFAULT_COLORS[Math.abs(res.user.email.length) % DEFAULT_COLORS.length];
    setUserColorState(color);
    return res.user;
  };

  const quickLogin = async (email: string): Promise<User> => {
    return login({ email, password: 'password123' });
  };

  const logout = () => {
    apiService.logout();
    setCurrentUser(null);
  };

  const setUserColor = (color: string) => {
    setUserColorState(color);
    localStorage.setItem('meetdraw_user_color', color);
  };

  const displayName = currentUser?.username || guestName;

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        loading,
        displayName,
        userColor,
        setUserColor,
        updateGuestName,
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Backwards-compatible hook export
export const useUserStore = useUser;
