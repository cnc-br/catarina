"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";
import { User } from "neocatecumenal";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const pendingRefresh = useRef<(() => void) | null>(null);

  useEffect(() => {
    let ativo = true;

    const fetchUserData = async () => {
      try {
        const res = await fetch("/api/ambrosio/auth/me");
        if (res.ok) {
          const response = await res.json();
          if (ativo) {
            setUser(response.data);
          }
        } else if (ativo) {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error);
        if (ativo) {
          setUser(null);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
        pendingRefresh.current?.();
        pendingRefresh.current = null;
      }
    };

    fetchUserData();

    return () => {
      ativo = false;
    };
  }, [refreshKey]);

  const refreshUser = () => {
    setLoading(true);
    return new Promise<void>((resolve) => {
      pendingRefresh.current?.();
      pendingRefresh.current = resolve;
      setRefreshKey((key) => key + 1);
    });
  };

  const value = {
    user,
    setUser,
    loading,
    refreshUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
}
