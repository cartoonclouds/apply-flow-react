import type { DrizzleAppDatabase } from "@/db";
import { MenuItem } from "@/types";
import {
  Briefcase,
  Building2,
  CalendarIcon,
  LayoutDashboard,
  MapPinned,
  Users,
} from "lucide-react";

export const MENU_SEPARATOR = "MenuButtonSeparator" as const;

export class SidebarRepository {
  constructor(private readonly _db: DrizzleAppDatabase) {}

  public list(): MenuItem[] {
    return [
      {
        id: 1,
        icon: LayoutDashboard,
        label: "Dashboard",
        route: "/",
      },
      {
        id: 2,
        icon: Briefcase,
        label: "Applications",
        route: "/applications",
      },
      {
        id: 3,
        label: "Companies",
        icon: Building2,
        route: "/companies",
      },
      {
        id: 4,
        label: "Contacts",
        icon: Users,
        route: "/contacts",
      },
      MENU_SEPARATOR,
      {
        id: 5,
        label: "Map",
        icon: MapPinned,
        route: "/map",
      },
      {
        id: 6,
        label: "Calendar",
        icon: CalendarIcon,
        route: "/calendar",
      },
    ];
  }
}
