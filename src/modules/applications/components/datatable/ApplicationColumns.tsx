import Badge from "@/components/ui/badge";
import {
  ACTION_BUTTON_SEPARATOR,
  ActionButton,
} from "@/components/ui/data-table/action-button";
import SortableHeader from "@/components/ui/data-table/sortable-header";
import { sortTemporalColumn } from "@/components/ui/data-table/temporal-sorting";
import { formatRelativeDateTime } from "@/lib/date-utils";
import {
  getAttendanceLabel,
  getEmploymentLabel,
} from "@/modules/applications/labels";
import type { Application } from "@/modules/applications/types";
import { ColumnDef } from "@tanstack/react-table";
import React from "react";

type ApplicationColumnOptions = {
  onOpenApplication: (application: Application) => void;
};

const ATTENDANCE_TYPE_BADGE_CLASS: Record<string, string> = {
  remote: "border-emerald-200 bg-emerald-50 text-emerald-700",
  hybrid: "border-amber-200 bg-amber-50 text-amber-700",
  "on-site": "border-indigo-200 bg-indigo-50 text-indigo-700",
};

const EMPLOYMENT_TYPE_BADGE_CLASS: Record<string, string> = {
  "full-time": "border-blue-200 bg-blue-50 text-blue-700",
  "part-time": "border-teal-200 bg-teal-50 text-teal-700",
  contract: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  internship: "border-orange-200 bg-orange-50 text-orange-700",
  volunteer: "border-lime-200 bg-lime-50 text-lime-700",
};

export function getApplicationColumns({
  onOpenApplication,
}: ApplicationColumnOptions): ColumnDef<Application>[] {
  return [
    {
      id: "companyName",
      accessorFn: (row) => row.company?.name ?? "",
      header: ({ column }) => SortableHeader({ label: "Company", column }),
      cell: ({ row }) => row.original.company?.name ?? "-",
    },
    {
      accessorKey: "title",
      header: ({ column }) => SortableHeader({ label: "Title", column }),
    },
    {
      accessorKey: "attendanceType",
      header: ({ column }) =>
        SortableHeader({ label: "Attendance Type", column }),
      cell: ({ row }) => {
        const attendanceType = row.original.attendanceType;
        const label = getAttendanceLabel(attendanceType);
        const badgeClass =
          (attendanceType && ATTENDANCE_TYPE_BADGE_CLASS[attendanceType]) ||
          "border-slate-200 bg-slate-50 text-slate-700";

        return <Badge className={badgeClass}>{label}</Badge>;
      },
    },
    {
      accessorKey: "employmentType",
      header: ({ column }) =>
        SortableHeader({ label: "Employment Type", column }),
      cell: ({ row }) => {
        const employmentType = row.original.employmentType;
        const label = getEmploymentLabel(employmentType);
        const badgeClass =
          (employmentType && EMPLOYMENT_TYPE_BADGE_CLASS[employmentType]) ||
          "border-slate-200 bg-slate-50 text-slate-700";

        return <Badge className={badgeClass}>{label}</Badge>;
      },
    },
    {
      accessorKey: "locationText",
      header: ({ column }) => SortableHeader({ label: "Location", column }),
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
        const application = row.original;

        return (
          <ActionButton>
            {[
              {
                label: "Copy application ID",
                onClick: () => {
                  if (application.id) {
                    navigator.clipboard.writeText(application.id);
                  }
                },
              },
              {
                label: "View application",
                onClick: () => {
                  onOpenApplication(application);
                },
              },
              ACTION_BUTTON_SEPARATOR,
              {
                label: "View details",
                onClick: () => {
                  onOpenApplication(application);
                },
              },
            ]}
          </ActionButton>
        );
      },
    },
  ];
}
