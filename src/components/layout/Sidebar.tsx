import { Separator } from "@/components/ui/separator";
import { db } from "@/db";
import { Link } from "@tanstack/react-router";
import { WifiPen } from "lucide-react";
import React from "react";
import { SidebarRepository } from "../../repositories/SidebarRepository";

function Sidebar() {
  const sidebarRepository = new SidebarRepository(db);
  const sidebarItems = sidebarRepository.list();

  return (
    <aside className="flex flex-col gap-6 p-4 bg-gray-100 h-full @container/sidebar">
      <span className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <WifiPen className="w-6 h-6 text-gray-600" />
        ApplyFlow
      </span>

      <Separator className={undefined} />

      <ul className="flex flex-col gap-2">
        {sidebarItems.map((item) => (
          <li key={item.id}>
            <Link
              to={item.route}
              activeProps={{ className: "bg-gray-200 font-medium" }}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-200 cursor-pointer"
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;
