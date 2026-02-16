import { seedState } from '../data/seed';
import type { AppState } from '../types';

const STORAGE_KEY = 'audit-management-state-v1';

export const loadState = (): AppState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedState));
    return seedState;
  }
  try {
    return JSON.parse(raw) as AppState;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedState));
    return seedState;
  }
};

export const saveState = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const resetState = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seedState));
  return seedState;
};
