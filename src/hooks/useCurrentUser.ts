import { useState, useCallback } from 'react';
import { CurrentUser, UserRole } from '../types';
import { STORAGE_KEYS } from '../utils/storage';

const loadCurrentUser = (): CurrentUser | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

const saveCurrentUser = (user: CurrentUser | null): void => {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};

export function useCurrentUser() {
  const [currentUser, setCurrentUserState] = useState<CurrentUser | null>(loadCurrentUser);

  const setCurrentUser = useCallback((user: CurrentUser | null) => {
    saveCurrentUser(user);
    setCurrentUserState(user);
  }, []);

  const isIndividual = currentUser?.role === UserRole.INDIVIDUAL;
  const isManager = currentUser?.role === UserRole.MANAGER;
  const isPeople = currentUser?.role === UserRole.PEOPLE;

  return {
    currentUser,
    setCurrentUser,
    isIndividual,
    isManager,
    isPeople,
  };
}
