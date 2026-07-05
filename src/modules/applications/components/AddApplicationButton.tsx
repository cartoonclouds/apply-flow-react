import { Button } from "@/components/ui/button";
import React from "react";

function AddApplicationButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Add Application
    </Button>
  );
}

export default AddApplicationButton;
