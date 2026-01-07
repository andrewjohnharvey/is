"use client";

import {
  ChevronDown,
  Copy,
  Download,
  FileText,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { CANVAS_TYPES } from "@/lib/canvas-types";

// Mock data for canvas reports matching the design
const canvasReports = [
  {
    id: "1",
    clientName: "Acme Corporation",
    title: "2025 Benefits Renewal",
    effectiveDate: "Jan 1, 2025",
    docCount: 4,
    lastUpdated: "Updated 2 hours ago",
    status: "published" as const,
  },
  {
    id: "2",
    clientName: "TechStart Inc.",
    title: "Q1 2025 Renewal Analysis",
    effectiveDate: "Mar 1, 2025",
    docCount: 2,
    lastUpdated: "Updated yesterday",
    status: "draft" as const,
  },
  {
    id: "3",
    clientName: "Global Manufacturing Co.",
    title: "Annual Benefits Review",
    effectiveDate: "Feb 15, 2025",
    docCount: 6,
    lastUpdated: "Started 5 min ago",
    status: "processing" as const,
    progress: 45,
  },
  {
    id: "4",
    clientName: "Sunrise Healthcare",
    title: "2025 Open Enrollment",
    effectiveDate: "Nov 1, 2024",
    docCount: 8,
    lastUpdated: "Updated 3 days ago",
    status: "published" as const,
  },
  {
    id: "5",
    clientName: "Pacific Retail Group",
    title: "Benefits Benchmarking",
    effectiveDate: "Dec 1, 2024",
    docCount: 3,
    lastUpdated: "Updated 1 week ago",
    status: "draft" as const,
  },
];

type CanvasStatus = "published" | "draft" | "processing";

function getStatusBadge(status: CanvasStatus) {
  switch (status) {
    case "published":
      return (
        <Badge className="gap-1.5" variant="green">
          <span className="size-1.5 rounded-full bg-current" />
          Published
        </Badge>
      );
    case "draft":
      return (
        <Badge className="gap-1.5" variant="neutral">
          <span className="size-1.5 rounded-full border border-current" />
          Draft
        </Badge>
      );
    case "processing":
      return (
        <Badge className="gap-1.5" variant="blue">
          <span className="size-1.5 rounded-full bg-current" />
          Processing
        </Badge>
      );
    default:
      return null;
  }
}

export default function CanvasPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = canvasReports.filter(
    (report) =>
      report.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="heading-lg">My Canvases</h1>
          <p className="mt-1 text-muted-foreground">
            Create and manage your benefits presentation canvases.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="shrink-0">
              New Canvas
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {CANVAS_TYPES.map((type) => (
              <DropdownMenuItem asChild key={type.value}>
                <Link
                  href={`/clients/${clientId}/canvas/new?type=${type.value}`}
                >
                  {type.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search canvases..."
          value={searchQuery}
        />
      </div>

      {/* Canvas Cards List */}
      <div className="flex flex-col gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4">
                {/* Top Row: Title and Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        className="font-semibold text-lg hover:text-primary hover:no-underline"
                        href={`/clients/${clientId}/canvas/${report.id}`}
                      >
                        {report.clientName}
                      </Link>
                      {getStatusBadge(report.status)}
                    </div>
                    <p className="mt-0.5 text-muted-foreground">
                      {report.title}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-sm" variant="ghost">
                        <MoreHorizontal className="size-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          href={`/clients/${clientId}/canvas/${report.id}/edit`}
                        >
                          <Pencil className="size-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="size-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="size-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Metadata Row */}
                <div className="flex items-center gap-4 text-muted-foreground text-sm">
                  <span>{report.effectiveDate}</span>
                  <span className="text-border">•</span>
                  <span className="flex items-center gap-1">
                    <FileText className="size-3.5" />
                    {report.docCount} docs
                  </span>
                  <span className="text-border">•</span>
                  <span>{report.lastUpdated}</span>
                </div>

                {/* Progress Bar for Processing Status */}
                {report.status === "processing" && report.progress && (
                  <div className="flex items-center gap-3">
                    <Progress className="flex-1" value={report.progress} />
                    <span className="text-muted-foreground text-sm">
                      {report.progress}%
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                {report.status !== "processing" && (
                  <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/clients/${clientId}/canvas/${report.id}`}>
                        <Pencil className="size-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="size-4" />
                      Export
                    </Button>
                    {report.status === "published" ? (
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost">
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <FileText className="size-12 text-muted-foreground" />
                <div>
                  <p className="font-medium">No canvases found</p>
                  <p className="text-muted-foreground text-sm">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "Create your first canvas to get started"}
                  </p>
                </div>
                {!searchQuery && (
                  <Button asChild>
                    <Link href={`/clients/${clientId}/canvas/new`}>
                      Create Canvas
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
