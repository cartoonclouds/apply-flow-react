import { Button } from "@/components/ui/button";
import { triggerOpenCreateApplicationDrawer } from "@/modules/applications/events";
import { useNavigate } from "@tanstack/react-router";
import React from "react";

function AddApplicationButton() {
  const navigate = useNavigate();

  async function handleClick() {
    triggerOpenCreateApplicationDrawer();
    await navigate({ to: "/applications" });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      onClick={() => {
        void handleClick();
      }}
    >
      New Application
    </Button>
  );
}

export default AddApplicationButton;
