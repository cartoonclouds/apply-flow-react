import type { DrizzleAppDatabase } from "@/db";
import { MenuItem } from "@/types";
import {
  Briefcase,
  Building2,
  CalendarIcon,
  LayoutDashboard,
  Users,
} from "lucide-react";

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
        label: "Calendar",
        icon: CalendarIcon,
        route: "/calendar",
      },
      {
        id: 4,
        label: "Companies",
        icon: Building2,
        route: "/companies",
      },
      {
        id: 5,
        label: "Contacts",
        icon: Users,
        route: "/contacts",
      },
    ];
  }
}
