import { MENU_SEPARATOR } from "@/repositories/SidebarRepository";
import type { LucideIcon } from "lucide-react";

export type AppRoute =
  | "/"
  | "/applications"
  | "/calendar"
  | "/companies"
  | "/contacts"
  | "/map";

export type MenuItem =
  | {
      id: number;
      icon: LucideIcon;
      label: string;
      route: AppRoute;
    }
  | typeof MENU_SEPARATOR;

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
  /**
   * Lists all entities in the repository.
   *
   * @returns A promise that resolves to an array of entities.
   */
  list(): Promise<TEntity[]>;

  /**
   * Retrieves a single entity by its unique identifier.
   *
   * @param id The unique identifier of the entity.
   * @returns A promise that resolves to the entity if found, or null if not found.
   */
  get(id: TId): Promise<TEntity | null>;

  /**
   * Creates a new entity in the repository.
   *
   * @param data The data for the new entity.
   * @returns A promise that resolves to the created entity.
   */
  create(data: TCreate): Promise<TEntity>;

  /**
   * Updates an existing entity in the repository.
   *
   * @param id The unique identifier of the entity to update.
   * @param data The updated data for the entity.
   * @returns A promise that resolves to the updated entity.
   */
  update(id: TId, data: TUpdate): Promise<TEntity>;

  /**
   * Deletes an entity from the repository.
   *
   * @param id The unique identifier of the entity to delete.
   * @returns A promise that resolves when the entity is deleted.
   */
  delete(id: TId): Promise<void>;
}
