import { useState, useEffect } from 'react';
import { User } from '@meetdraw/shared';
import { apiService } from '../services/api';

const COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#facc15', // yellow
  '#4ade80', // green
  '#2dd4bf', // teal
  '#38bdf8', // sky
  '#818cf8', // indigo
  '#c084fc', // purple
  '#f472b6', // pink
];

function getRandomColor(): string {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

export function useUserStore() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('meetdraw_guest_name') || `User-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [userColor, setUserColor] = useState<string>(() => {
    return localStorage.getItem('meetdraw_user_color') || getRandomColor();
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = apiService.getToken();
    if (token) {
      apiService
        .getMe()
        .then((res) => {
          setCurrentUser(res.user);
        })
        .catch(() => {
          apiService.logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const updateGuestName = (name: string) => {
    const trimmed = name.trim() || `User-${Math.floor(1000 + Math.random() * 9000)}`;
    setGuestName(trimmed);
    localStorage.setItem('meetdraw_guest_name', trimmed);
  };

  const displayName = currentUser ? currentUser.username : guestName;

  return {
    currentUser,
    guestName,
    displayName,
    userColor,
    setUserColor,
    updateGuestName,
    setCurrentUser,
    loading,
  };
}
