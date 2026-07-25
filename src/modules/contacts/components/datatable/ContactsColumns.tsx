import Badge from "@/components/ui/badge";
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

type ContactColumnOptions = {
  onOpenContact: (contact: Contact) => void;
  onDeleteContact: (contact: Contact) => void;
};

const CONTACT_TYPE_BADGE_CLASS: Record<string, string> = {
  company: "border-cyan-200 bg-cyan-50 text-cyan-700",
  recruiter: "border-violet-200 bg-violet-50 text-violet-700",
};

export function getContactColumns({
  onOpenContact,
  onDeleteContact,
}: ContactColumnOptions): ColumnDef<Contact>[] {
  return [
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
      cell: ({ row }) => {
        const type = row.original.type;
        const label = type
          ? `${type.charAt(0).toUpperCase()}${type.slice(1)}`
          : "-";
        const badgeClass =
          (type && CONTACT_TYPE_BADGE_CLASS[type]) ||
          "border-slate-200 bg-slate-50 text-slate-700";

        return <Badge className={badgeClass}>{label}</Badge>;
      },
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
      cell: ({ row }) => {
        const count = row.original.applications?.length ?? 0;
        return (
          <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">
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
        const contact = row.original;

        return (
          <ActionButton>
            {[
              {
                label: "Copy contact ID",
                onClick: () => {
                  if (contact.id) {
                    navigator.clipboard.writeText(contact.id);
                  }
                },
              },
              {
                label: "Edit contact",
                onClick: () => {
                  onOpenContact(contact);
                },
              },
              {
                label: "Delete contact",
                onClick: () => {
                  onDeleteContact(contact);
                },
              },
              ACTION_BUTTON_SEPARATOR,
              {
                label: "View details",
                onClick: () => {
                  onOpenContact(contact);
                },
              },
            ]}
          </ActionButton>
        );
      },
    },
  ];
}
