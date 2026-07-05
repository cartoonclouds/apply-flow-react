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

export interface Repository<T = unknown> {
  list(): Promise<T[]>;
  get(id: number): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: number, data: Partial<T>): Promise<T>;
  delete(id: number): Promise<void>;
}
