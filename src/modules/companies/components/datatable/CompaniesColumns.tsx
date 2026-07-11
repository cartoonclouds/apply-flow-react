import {
    ACTION_BUTTON_SEPARATOR,
    ActionButton,
} from "@/components/ui/data-table/action-button";
import SortableHeader from "@/components/ui/data-table/sortable-header";
import { sortTemporalColumn } from "@/components/ui/data-table/temporal-sorting";
import { formatRelativeDateTime } from "@/lib/date-utils";
import type { Company } from "@/modules/companies/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

export const columns: ColumnDef<Company>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => SortableHeader({ label: "Name", column }),
  },
  {
    accessorKey: "industry",
    header: ({ column }) => SortableHeader({ label: "Industry", column }),
    cell: ({ row }) => row.original.industry ?? "-",
  },
  {
    accessorKey: "size",
    header: ({ column }) => SortableHeader({ label: "Size", column }),
    cell: ({ row }) => row.original.size ?? "-",
  },
  {
    accessorKey: "locationText",
    header: ({ column }) => SortableHeader({ label: "Location", column }),
    cell: ({ row }) => row.original.locationText ?? "-",
  },
  {
    id: "contactsCount",
    accessorFn: (row) => row.contacts?.length ?? 0,
    header: ({ column }) => SortableHeader({ label: "Contacts", column }),
    cell: ({ row }) => row.original.contacts?.length ?? 0,
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
      const company = row.original;

      return (
        <ActionButton
          children={[
            {
              label: "Copy company ID",
              onClick: () => {
                if (company.id) {
                  navigator.clipboard.writeText(company.id);
                }
              },
            },
            {
              label: "View company",
              onClick: () => {
                // Implement view company logic here.
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
