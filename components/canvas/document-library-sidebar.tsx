"use client";

import {
  BarChart3,
  BookOpen,
  ChevronRight,
  DollarSign,
  FileText,
  FolderOpen,
  Pin,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type LibraryDocument = {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  source: "user" | "system";
  date: string;
};

type DocumentLibrarySidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectDocument?: (doc: LibraryDocument) => void;
};

// Mock library documents
const recentDocuments: LibraryDocument[] = [
  {
    id: "lib-1",
    name: "Claims_Report_Acme_2023.pdf",
    category: "Financial Data",
    categoryIcon: "financial",
    source: "user",
    date: "Dec 2023",
  },
  {
    id: "lib-2",
    name: "Industry_Benchmark_Tech_2024.pdf",
    category: "Benchmarking",
    categoryIcon: "benchmarking",
    source: "system",
    date: "Nov 2024",
  },
  {
    id: "lib-3",
    name: "ACA_1095C_Acme_2024.pdf",
    category: "Compliance",
    categoryIcon: "compliance",
    source: "user",
    date: "Oct 2024",
  },
];

const categoryBrowse = [
  { id: "plan", icon: BookOpen, label: "Plan Documents", count: 12 },
  { id: "financial", icon: DollarSign, label: "Financial Data", count: 8 },
  { id: "renewal", icon: FileText, label: "Renewal Packages", count: 5 },
  { id: "census", icon: Users, label: "Census Data", count: 3 },
  { id: "benchmarking", icon: BarChart3, label: "Benchmarking", count: 4 },
  { id: "compliance", icon: FileText, label: "Compliance", count: 6 },
  { id: "other", icon: Pin, label: "Other Context", count: 2 },
];

function getCategoryIcon(categoryIcon: string) {
  switch (categoryIcon) {
    case "financial":
      return <DollarSign className="size-4" />;
    case "benchmarking":
      return <BarChart3 className="size-4" />;
    case "compliance":
      return <FileText className="size-4" />;
    default:
      return <FileText className="size-4" />;
  }
}

export function DocumentLibrarySidebar({
  open,
  onOpenChange,
  onSelectDocument,
}: DocumentLibrarySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | "client" | "org">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState<"all" | "user" | "system">(
    "all"
  );

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md" side="right">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <FolderOpen className="size-5" />
            Document Library
          </SheetTitle>
          <SheetDescription>
            Browse and add documents from your library
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6">
          {/* Search */}
          <div className="relative">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              value={searchQuery}
            />
          </div>

          {/* Source Filter */}
          <div className="flex flex-col gap-2">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Filter by Source
            </span>
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "client", label: "This Client" },
                { value: "org", label: "Organization-wide" },
              ].map((option) => (
                <Button
                  className={cn(
                    "flex-1",
                    sourceFilter === option.value && "ring-2 ring-primary"
                  )}
                  key={option.value}
                  onClick={() =>
                    setSourceFilter(option.value as typeof sourceFilter)
                  }
                  size="sm"
                  variant={
                    sourceFilter === option.value ? "default" : "outline"
                  }
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col gap-2">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Filter by Type
            </span>
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "user", label: "User Uploaded" },
                { value: "system", label: "System Generated" },
              ].map((option) => (
                <Button
                  className={cn(
                    "flex-1",
                    typeFilter === option.value && "ring-2 ring-primary"
                  )}
                  key={option.value}
                  onClick={() =>
                    setTypeFilter(option.value as typeof typeFilter)
                  }
                  size="sm"
                  variant={typeFilter === option.value ? "default" : "outline"}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Recent Documents */}
          <div className="flex flex-col gap-3">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Recent Documents
            </span>
            <div className="flex flex-col gap-2">
              {recentDocuments.map((doc) => (
                <button
                  className="flex items-start gap-3 rounded-lg border border-border/50 p-3 text-left transition-colors hover:bg-muted/50"
                  key={doc.id}
                  onClick={() => onSelectDocument?.(doc)}
                  type="button"
                >
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-sm">{doc.name}</p>
                    <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      {getCategoryIcon(doc.categoryIcon)}
                      {doc.category}
                      <span className="text-border">•</span>
                      {doc.source === "user" ? "Uploaded" : "System Generated"}{" "}
                      {doc.date}
                    </p>
                  </div>
                  <Button
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDocument?.(doc);
                    }}
                    size="icon-sm"
                    variant="ghost"
                  >
                    <Plus className="size-4" />
                    <span className="sr-only">Add {doc.name}</span>
                  </Button>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Browse by Category */}
          <div className="flex flex-col gap-3">
            <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Browse by Category
            </span>
            <div className="flex flex-col gap-1">
              {categoryBrowse.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                    key={category.id}
                    type="button"
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 text-sm">
                      {category.label}
                    </span>
                    <Badge variant="muted">{category.count}</Badge>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
