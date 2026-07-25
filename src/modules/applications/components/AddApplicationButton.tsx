import { Button } from "@/components/ui/button";
import { triggerOpenCreateApplicationModal } from "@/modules/applications/events";
import { useNavigate } from "@tanstack/react-router";
import React from "react";

function AddApplicationButton() {
  const navigate = useNavigate();

  async function handleClick() {
    triggerOpenCreateApplicationModal();
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
