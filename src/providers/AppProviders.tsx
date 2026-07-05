import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider, useUser } from "@/context/UserContext";
import { db } from "@/db";
import { UserRepository } from "@/repositories/UserRepository";
import React, { useEffect, useMemo } from "react";

function UserBootstrap({ children }: { children: React.ReactNode }) {
  const { setUser } = useUser();
  const userRepository = useMemo(() => new UserRepository(db), []);

  useEffect(() => {
    let isMounted = true;

    userRepository.findById(1).then((user) => {
      if (isMounted) {
        setUser(user);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [setUser, userRepository]);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <UserBootstrap>
        <TooltipProvider>{children}</TooltipProvider>
      </UserBootstrap>
    </UserProvider>
  );
}
