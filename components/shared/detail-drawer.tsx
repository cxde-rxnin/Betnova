"use client";

import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

interface DetailField {
  label: string;
  value: ReactNode;
}

interface DetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  fields: DetailField[];
  footer?: ReactNode;
}

export function DetailDrawer({ open, onOpenChange, title, description, fields, footer }: DetailDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {fields.map((field) => (
            <div key={field.label} className="flex items-center justify-between gap-4 border-b border-border/60 pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted-foreground">{field.label}</span>
              <span className="text-right text-sm font-medium">{field.value}</span>
            </div>
          ))}
        </div>
        {footer && <div className="mt-auto flex flex-col gap-2 border-t p-6">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
