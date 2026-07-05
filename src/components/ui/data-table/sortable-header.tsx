import { Button } from "@/components/ui/button";
import { ArrowDownWideNarrow, ArrowUpDown } from "lucide-react";
import React from "react";

interface SortableHeaderProps {
  label: string;
  column: any;
}

function SortableHeader({ label, column }: SortableHeaderProps) {
  return (
    <Button
      className="px-0"
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}

      {column.getIsSorted() === "asc" ? (
        <ArrowDownWideNarrow className="ml-2 h-4 w-4" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDownWideNarrow className="ml-2 h-4 w-4 rotate-180" />
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );
}

export default SortableHeader;
