import type { LucideIcon } from "lucide-react";

export type AppRoute = "/" | "/applications" | "/calendar";

export type MenuItem = {
  id: number;
  icon: LucideIcon;
  label: string;
  route: AppRoute;
};

export type User = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};
