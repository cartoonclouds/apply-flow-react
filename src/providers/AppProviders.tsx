import { TooltipProvider } from "@/components/ui/tooltip";
import { UserProvider } from "@/context/UserContext";
import { useUser } from "@/context/useUser";
import { db } from "@/db";
import { ToastProvider } from "@/modules/notifications/context/ToastContext";
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

function ModalShortcutListener({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      const closeButtons = document.querySelectorAll<HTMLButtonElement>(
        'dialog[aria-modal="true"] button[aria-label^="Close "]',
      );

      closeButtons.forEach((button) => {
        button.click();
      });
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <UserProvider>
        <UserBootstrap>
          <ModalShortcutListener>
            <TooltipProvider>{children}</TooltipProvider>
          </ModalShortcutListener>
        </UserBootstrap>
      </UserProvider>
    </ToastProvider>
  );
}
