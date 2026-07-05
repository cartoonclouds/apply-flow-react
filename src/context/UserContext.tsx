// context/UserContext.tsx

import { User } from "@/types";
import {
  default as React,
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";


interface UserContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}