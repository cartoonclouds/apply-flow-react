import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { Button } from "../button";

export interface DataTableSettings {
  pagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
}

const defaultSettings: DataTableSettings = Object.freeze({
  pagination: true,
  pageSize: 10,
  sortable: true,
});

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  settings?: DataTableSettings;
}

function Datatable<TData, TValue>({
  columns,
  data,
  settings = defaultSettings,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: settings.pagination
      ? getPaginationRowModel()
      : undefined,
    onSortingChange: settings.sortable ? setSorting : undefined,
    getSortedRowModel: settings.sortable ? getSortedRowModel() : undefined,
    initialState: {
      pagination: {
        pageSize: settings.pageSize,
      },
    },
    state: {
      sorting,
    },
  });

  return (
    <div>
      <div className="overflow-hidden container rounded-md border">
        <Table className={undefined}>
          <TableHeader className={undefined}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className={undefined} key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className={undefined} key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className={undefined}>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className={undefined}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className={undefined} key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className={undefined}>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          className={undefined}
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          className={undefined}
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Datatable;
