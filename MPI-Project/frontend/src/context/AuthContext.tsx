import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { BasicUser } from '../types/auth';

const AUTH_STORAGE_KEY = 'mpi.auth.user';

interface AuthContextValue {
  user: BasicUser | null;
  isAuthenticated: boolean;
  login: (nextUser: BasicUser) => void;
  logout: () => void;
}

const readStoredUser = (): BasicUser | null => {
  const serializedUser = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!serializedUser) {
    return null;
  }

  try {
    return JSON.parse(serializedUser) as BasicUser;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<BasicUser | null>(readStoredUser);

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: (nextUser) => {
        setUser(nextUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return value;
}
