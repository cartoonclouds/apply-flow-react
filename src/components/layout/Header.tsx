import { useUser } from "@/context/UserContext";
import { greeting } from "@/lib/date-utils";
import AddApplicationButton from "@/modules/applications/components/AddApplicationButton";
import NotificationIcon from "@/modules/notifications/components/NotificationIcon";
import SearchInput from "@/modules/search/components/SearchInput";
import { Hand } from "lucide-react";
import React from "react";

function Header() {
  const { user } = useUser();

  return (
    <header className="flex flex-col gap-8 lg:flex-row p-4 border-b justify-between border-gray-200">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold text-gray-800">
          {greeting(user?.first_name ?? "Job Hunter")}
          <Hand className="inline-block ml-2 text-yellow-500" size={32} />
        </h1>

        <p>Track your applications, interviews and next steps.</p>
      </div>

      <div className="flex items-center gap-6">
        <SearchInput />

        <NotificationIcon />

        <AddApplicationButton />
      </div>
    </header>
  );
}

export default Header;
