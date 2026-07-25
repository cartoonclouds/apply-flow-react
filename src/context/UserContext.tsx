import { UserContext, type UserContextValue } from "@/context/useUser";
import React, { type ReactNode, useMemo, useState } from "react";

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<UserContextValue["user"]>(null);

  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
