import type { LucideIcon } from "lucide-react";

export type AppRoute =
  | "/"
  | "/applications"
  | "/calendar"
  | "/companies"
  | "/contacts";

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

export interface Repository<
  TEntity = unknown,
  TCreate = Partial<TEntity>,
  TUpdate = Partial<TCreate>,
  TId = number,
> {
  list(): Promise<TEntity[]>;
  get(id: TId): Promise<TEntity | null>;
  create(data: TCreate): Promise<TEntity>;
  update(id: TId, data: TUpdate): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}
