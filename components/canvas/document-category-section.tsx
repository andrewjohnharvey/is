"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  FileText,
  Plus,
  X,
} from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type DocumentItem = {
  id: string;
  name: string;
  isAutoDetected?: boolean;
};

type DocumentCategorySectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  documents: DocumentItem[];
  status: "filled" | "recommended" | "optional";
  recommendedType?: string;
  onRemoveDocument?: (id: string) => void;
  onAddFromLibrary?: () => void;
  className?: string;
};

export function DocumentCategorySection({
  icon,
  title,
  description,
  documents,
  status,
  recommendedType,
  onRemoveDocument,
  onAddFromLibrary,
  className,
}: DocumentCategorySectionProps) {
  const hasDocuments = documents.length > 0;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center text-lg">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{title}</h3>
            {status === "recommended" && recommendedType && (
              <Badge className="gap-1" variant="yellow">
                <AlertTriangle className="size-3" />
                Recommended: {recommendedType}
              </Badge>
            )}
            {status === "optional" && !hasDocuments && (
              <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                <Circle className="size-3" />
                Optional - empty
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-xs">{description}</p>
        </div>
        {hasDocuments ? (
          <Button
            className="shrink-0"
            onClick={onAddFromLibrary}
            size="sm"
            variant="ghost"
          >
            <Plus className="size-4" />
            Add from Library
          </Button>
        ) : null}
      </div>

      {/* Document List */}
      <div className="rounded-xl border border-border/50 bg-muted/30">
        {hasDocuments ? (
          <ul className="divide-y divide-border/50">
            {documents.map((doc) => (
              <li className="flex items-center gap-3 px-4 py-3" key={doc.id}>
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">
                  {doc.name}
                </span>
                {doc.isAutoDetected === true ? (
                  <Badge className="gap-1" variant="green">
                    <CheckCircle2 className="size-3" />
                    Auto-detected
                  </Badge>
                ) : null}
                <Button
                  className="shrink-0"
                  onClick={() => onRemoveDocument?.(doc.id)}
                  size="icon-sm"
                  variant="ghost"
                >
                  <X className="size-4" />
                  <span className="sr-only">Remove {doc.name}</span>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-between px-4 py-4">
            <span className="text-muted-foreground text-sm">
              No documents yet
            </span>
            <Button onClick={onAddFromLibrary} size="sm" variant="ghost">
              <Plus className="size-4" />
              Add from Library
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
