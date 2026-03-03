const PREFIX = 'audit-management';

export const localRepository = {
  read<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(`${PREFIX}:${key}`);
    if (!raw) return fallback;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  write<T>(key: string, value: T): void {
    localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
  }
};

// TODO(Phase 2): Replace localStorage with a real database repository implementation.
