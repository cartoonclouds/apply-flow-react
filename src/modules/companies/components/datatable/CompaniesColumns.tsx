import Badge from "@/components/ui/badge";
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

type CompanyColumnOptions = {
  onOpenCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
};

export function getCompanyColumns({
  onOpenCompany,
  onDeleteCompany,
}: CompanyColumnOptions): ColumnDef<Company>[] {
  return [
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
      cell: ({ row }) => {
        const count = row.original.contacts?.length ?? 0;
        return (
          <Badge className="border-violet-200 bg-violet-50 text-violet-700">
            {count}
          </Badge>
        );
      },
    },
    {
      id: "applicationsCount",
      accessorFn: (row) => row.applications?.length ?? 0,
      header: ({ column }) => SortableHeader({ label: "Applications", column }),
      cell: ({ row }) => {
        const count = row.original.applications?.length ?? 0;
        return (
          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
            {count}
          </Badge>
        );
      },
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
          <ActionButton>
            {[
              {
                label: "Copy company ID",
                onClick: () => {
                  if (company.id) {
                    navigator.clipboard.writeText(company.id);
                  }
                },
              },
              {
                label: "Edit company",
                onClick: () => {
                  onOpenCompany(company);
                },
              },
              {
                label: "Delete company",
                onClick: () => {
                  onDeleteCompany(company);
                },
              },
              ACTION_BUTTON_SEPARATOR,
              {
                label: "View details",
                onClick: () => {
                  onOpenCompany(company);
                },
              },
            ]}
          </ActionButton>
        );
      },
    },
  ];
}
