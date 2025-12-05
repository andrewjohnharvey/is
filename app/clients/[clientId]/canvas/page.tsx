"use client";

import {
  ChevronDown,
  Copy,
  Download,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock data for canvas reports
const canvasReports = [
  {
    id: "1",
    name: "Q4 2024 Benefits Strategy Canvas",
    template: "Workforce Investment",
    status: "Published",
    lastModified: "Nov 28, 2024",
    modifiedBy: "Ava Chen",
  },
  {
    id: "2",
    name: "2025 Open Enrollment Overview",
    template: "Benchmarking",
    status: "Draft",
    lastModified: "Nov 25, 2024",
    modifiedBy: "Daniel Ruiz",
  },
  {
    id: "3",
    name: "Retirement Plan Analysis",
    template: "Strategic Roadmap",
    status: "Published",
    lastModified: "Nov 20, 2024",
    modifiedBy: "Priya Patel",
  },
  {
    id: "4",
    name: "Healthcare Cost Comparison",
    template: "Benchmarking",
    status: "Draft",
    lastModified: "Nov 15, 2024",
    modifiedBy: "Liam Brooks",
  },
  {
    id: "5",
    name: "Employee Wellness Initiative",
    template: "Workforce Investment",
    status: "In Review",
    lastModified: "Nov 10, 2024",
    modifiedBy: "Ava Chen",
  },
];

function getStatusVariant(status: string) {
  switch (status) {
    case "Published":
      return "green";
    case "Draft":
      return "neutral";
    case "In Review":
      return "yellow";
    default:
      return "neutral";
  }
}

function getTemplateVariant(template: string) {
  switch (template) {
    case "Workforce Investment":
      return "blue";
    case "Benchmarking":
      return "orange";
    case "Strategic Roadmap":
      return "green";
    default:
      return "neutral";
  }
}

export default function CanvasPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="heading-lg">Canvas</h1>
          <p className="mt-1 text-muted-foreground">
            Create and collaborate on visual strategy canvases for your client's
            benefits planning.
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="shrink-0">
              New Report
              <ChevronDown className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/clients/${clientId}/canvas/new`}>Blank Canvas</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/clients/${clientId}/canvas/new?template=workforce`}>
                Workforce Investment
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/clients/${clientId}/canvas/new?template=benchmarking`}
              >
                Benchmarking
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/clients/${clientId}/canvas/new?template=roadmap`}>
                Strategic Roadmap
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Canvas Reports List */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Modified By</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {canvasReports.map((report) => (
                <TableRow className="group/row" key={report.id}>
                  <TableCell className="pl-4">
                    <Link
                      className="flex items-center gap-2 font-medium hover:text-primary hover:no-underline"
                      href={`/clients/${clientId}/canvas/${report.id}`}
                    >
                      <FileText className="size-4 text-muted-foreground" />
                      {report.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTemplateVariant(report.template)}>
                      {report.template}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(report.status)}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {report.lastModified}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {report.modifiedBy}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
