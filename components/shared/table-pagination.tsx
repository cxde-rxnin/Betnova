"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TablePaginationProps {
  page: number;
  pageCount: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function TablePagination({ page, pageCount, totalItems, pageSize, onPageChange }: TablePaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm">
      <p className="text-xs text-muted-foreground">
        {totalItems === 0 ? "No results" : `Showing ${from}-${to} of ${totalItems}`}
      </p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2 text-xs font-medium text-muted-foreground">
          Page {Math.min(page, Math.max(pageCount, 1))} of {Math.max(pageCount, 1)}
        </span>
        <Button variant="outline" size="icon-sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
