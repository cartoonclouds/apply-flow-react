import {
    ACTION_BUTTON_SEPARATOR,
    ActionButton,
} from "@/components/ui/data-table/action-button";
import SortableHeader from "@/components/ui/data-table/sortable-header";
import { sortTemporalColumn } from "@/components/ui/data-table/temporal-sorting";
import { formatRelativeDateTime } from "@/lib/date-utils";
import type { Contact } from "@/modules/contacts/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

export const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: "fullName",
    header: ({ column }) => SortableHeader({ label: "Name", column }),
  },
  {
    id: "companyName",
    accessorFn: (row) => row.company?.name ?? "",
    header: ({ column }) => SortableHeader({ label: "Company", column }),
    cell: ({ row }) => row.original.company?.name ?? "-",
  },
  {
    accessorKey: "type",
    header: ({ column }) => SortableHeader({ label: "Type", column }),
  },
  {
    accessorKey: "email",
    header: ({ column }) => SortableHeader({ label: "Email", column }),
    cell: ({ row }) => row.original.email ?? "-",
  },
  {
    accessorKey: "phone",
    header: ({ column }) => SortableHeader({ label: "Phone", column }),
    cell: ({ row }) => row.original.phone ?? "-",
  },
  {
    id: "applicationsCount",
    accessorFn: (row) => row.applications?.length ?? 0,
    header: ({ column }) => SortableHeader({ label: "Applications", column }),
    cell: ({ row }) => row.original.applications?.length ?? 0,
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => SortableHeader({ label: "Updated At", column }),
    sortingFn: sortTemporalColumn,
    cell: ({ row }) => {
      return formatRelativeDateTime(row.original.updatedAt);
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const contact = row.original;

      return (
        <ActionButton
          children={[
            {
              label: "Copy contact ID",
              onClick: () => {
                if (contact.id) {
                  navigator.clipboard.writeText(contact.id);
                }
              },
            },
            {
              label: "View contact",
              onClick: () => {
                // Implement view contact logic here.
              },
            },
            ACTION_BUTTON_SEPARATOR,
            {
              label: "View details",
              onClick: () => {
                // Implement view details logic here.
              },
            },
          ]}
        />
      );
    },
  },
];
