"use client";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  virtualize?: boolean;
  rowHeight?: number;
  globalFilter?: string;
  onGlobalFilterChange?: (v: string) => void;
  onRowClick?: (row: TData) => void;
  className?: string;
  density?: "cozy" | "compact";
  stickyHeader?: boolean;
  emptyMessage?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  virtualize = false,
  rowHeight = 40,
  globalFilter,
  onGlobalFilterChange,
  onRowClick,
  className,
  density = "cozy",
  stickyHeader = true,
  emptyMessage = "No rows.",
}: Props<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 10,
    enabled: virtualize,
  });

  const rowPad = density === "compact" ? "h-8 text-[12px]" : "h-10 text-[13px]";
  const headPad =
    density === "compact" ? "h-8 text-[10px]" : "h-9 text-[10px]";

  const content = virtualize ? (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ maxHeight: "calc(100vh - 300px)" }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        <table className="w-full border-collapse">
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-card-2 border-b border-rule">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={cn(
                      "eyebrow text-left px-3 border-r border-rule-2 last:border-r-0 cursor-pointer select-none",
                      headPad,
                    )}
                    style={{ width: h.getSize() !== 150 ? h.getSize() : undefined }}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getCanSort() && (
                        <SortIcon dir={h.column.getIsSorted()} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        </table>
        {virtualizer.getVirtualItems().map((v) => {
          const row = rows[v.index];
          return (
            <div
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={cn(
                "absolute top-0 left-0 w-full flex border-b border-rule-2 items-center",
                onRowClick && "cursor-pointer hover:bg-blueprint/5",
                rowPad,
              )}
              style={{ transform: `translateY(${v.start}px)`, height: rowHeight }}
            >
              {row.getVisibleCells().map((c) => (
                <div
                  key={c.id}
                  className="px-3 border-r border-rule-2/50 last:border-r-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{
                    width:
                      c.column.getSize() !== 150 ? c.column.getSize() : undefined,
                    flex:
                      c.column.getSize() === 150 ? "1 1 0" : undefined,
                  }}
                >
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <div className="overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="bg-card-2 border-y border-rule">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  onClick={h.column.getToggleSortingHandler()}
                  className={cn(
                    "eyebrow text-left px-3 cursor-pointer select-none",
                    headPad,
                  )}
                  style={{ width: h.getSize() !== 150 ? h.getSize() : undefined }}
                >
                  <span className="inline-flex items-center gap-1">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getCanSort() && (
                      <SortIcon dir={h.column.getIsSorted()} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
              className={cn(
                "border-b border-rule-2 group",
                onRowClick && "cursor-pointer hover:bg-blueprint/5",
                rowPad,
              )}
            >
              {row.getVisibleCells().map((c) => (
                <td
                  key={c.id}
                  className="px-3 align-middle"
                  style={{
                    width:
                      c.column.getSize() !== 150 ? c.column.getSize() : undefined,
                  }}
                >
                  {flexRender(c.column.columnDef.cell, c.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="py-10 text-center text-[13px] text-slate">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}

function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  const sz = 10;
  if (dir === "asc") return <ArrowUp size={sz} />;
  if (dir === "desc") return <ArrowDown size={sz} />;
  return <ArrowUpDown size={sz} className="opacity-40" />;
}
