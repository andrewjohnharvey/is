"use client";

import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock,
  Map as MapIcon,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// Mock data
const summaryCards = [
  {
    title: "Workforce Investment",
    icon: TrendingUp,
    content:
      "The client invests $306.7M across wages, health, and retirement (+2.3% vs last quarter). Health is above benchmark; retirement underweighted in spend and perception.",
  },
  {
    title: "Demographic Benchmarking",
    icon: BarChart3,
    content:
      "Workforce is 56% Millennial, slightly younger than peers. Retirement participation trails benchmarks (82% vs 85%) for younger groups.",
  },
  {
    title: "Strategic Roadmap",
    icon: MapIcon,
    content:
      "8 of 12 recommendations complete (67%), $240K realized ROI of $480K potential. Next focus: retirement strategy and wellness participation.",
  },
];

const recentActivity = [
  {
    user: "Ava Chen",
    action: "created a new",
    target: "Workforce Investment Report",
    time: "2 hours ago",
  },
  {
    user: "Daniel Ruiz",
    action: "updated",
    target: "Medical Plan Data",
    time: "6 hours ago",
  },
  {
    user: "Priya Patel",
    action: "shared the",
    target: "5-Year Strategic Roadmap",
    extra: "with Ava Chen",
    time: "Yesterday",
  },
  {
    user: "Liam Brooks",
    action: "uploaded a",
    target: "Census File",
    time: "2 days ago",
  },
];

const actionItems = [
  {
    label: "Upload census data",
    link: "Open Data Management",
    href: "data-management",
  },
  {
    label: "Complete medical plan data for 2025",
    link: "Open Data Management",
    href: "data-management",
  },
  {
    label: "3 recommendations still pending implementation",
    link: "Follow up with client",
    href: "#",
  },
  {
    label: "Review compliance status",
    link: "Open Benefits Resources",
    href: "/benefits-resources",
  },
];

const myTasks = [
  "Follow up with client on Q1 results",
  "Prepare slides for meeting on Nov 15",
  "Double-check retirement plan data before new upload",
];

const recommendations = [
  {
    title: "Increase default retirement contribution to 6%",
    category: "Retirement",
    categoryColor: "yellow" as const,
    impact: "participation +3%",
    impactUp: true,
    status: "Implemented",
  },
  {
    title: "Add wellness program for younger employees",
    category: "Health",
    categoryColor: "green" as const,
    impact: "$120K projected savings",
    impactUp: false,
    status: "Pending",
  },
  {
    title: "Improve benefits communication strategy",
    category: "Engagement",
    categoryColor: "blue" as const,
    impact: "perceived value +8%",
    impactUp: true,
    status: "Implemented",
  },
  {
    title: "Review 401(k) investment options",
    category: "Retirement",
    categoryColor: "yellow" as const,
    impact: "$85K cost reduction",
    impactUp: false,
    status: "Pending",
  },
];

const complianceItems = [
  { title: "Annual Fiduciary Report", due: "Due: Sep 15", complete: true },
  { title: "Q3 Investment Review", due: "Due: Oct 1", complete: true },
  { title: "Benefits Enrollment Audit", due: "Due: Oct 10", complete: true },
  { title: "Q4 Investment Review", due: "Due: Oct 15", complete: false },
  { title: "Annual Benefits Survey", due: "Due: Nov 30", complete: false },
  { title: "Year-end Compliance Review", due: "Due: Dec 31", complete: false },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

function SummaryCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {summaryCards.map((card) => (
        <Card className="border-border/50" key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 font-sans text-base">
              <card.icon className="size-4 text-primary" />
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {card.content}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {recentActivity.map((activity, index) => (
          <div
            className="flex items-start gap-3 rounded-lg border border-border/50 bg-background p-4"
            key={`activity-${index.toString()}`}
          >
            <Avatar className="size-10">
              <AvatarFallback className="bg-muted">
                <User className="size-4 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm">
                <span className="font-semibold">{activity.user}</span>{" "}
                {activity.action}{" "}
                <span className="font-semibold">{activity.target}</span>
                {activity.extra ? ` ${activity.extra}` : ""}.
              </p>
              <span className="text-muted-foreground text-xs">
                {activity.time}
              </span>
            </div>
          </div>
        ))}
        <Button className="mt-2 self-end" variant="tertiary">
          View all activity
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ActionItems() {
  const params = useParams();
  const clientId = params.clientId as string;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold">Action Items</h3>
      <div className="flex flex-col gap-3">
        {actionItems.map((item, index) => (
          <div
            className="flex items-start gap-3"
            key={`action-${index.toString()}`}
          >
            <Checkbox className="mt-0.5" id={`action-${index}`} />
            <div className="flex flex-col gap-0.5">
              <label
                className="cursor-pointer text-sm leading-tight"
                htmlFor={`action-${index}`}
              >
                {item.label}
              </label>
              <Link
                className="flex items-center gap-1 text-primary text-xs hover:underline"
                href={
                  item.href.startsWith("/")
                    ? item.href
                    : `/clients/${clientId}/${item.href}`
                }
              >
                {item.link}
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyTasks() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-semibold">My Tasks</h3>
      <div className="flex flex-col gap-3">
        {myTasks.map((task, index) => (
          <div
            className="flex items-start gap-3"
            key={`task-${index.toString()}`}
          >
            <Checkbox className="mt-0.5" id={`task-${index}`} />
            <label
              className="cursor-pointer text-sm leading-tight"
              htmlFor={`task-${index}`}
            >
              {task}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecommendationsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-lg">
          5-Year Strategic Roadmap Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* Progress stats */}
        <div className="grid gap-6 rounded-lg border border-border/50 bg-muted/30 p-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                Implementation Progress
              </span>
              <span className="font-semibold">8 of 12</span>
            </div>
            <Progress className="h-2" value={67} />
            <span className="text-muted-foreground text-xs">67% complete</span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                ROI Progress
              </span>
              <span className="font-semibold">$240K</span>
            </div>
            <Progress className="h-2 [&>div]:bg-green-dark" value={50} />
            <span className="text-muted-foreground text-xs">
              $240K realized of $480K potential
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-border border-b text-left text-muted-foreground text-xs">
                <th className="pr-4 pb-3 font-medium">Recommendation</th>
                <th className="pr-4 pb-3 font-medium">Category</th>
                <th className="pr-4 pb-3 font-medium">Impact</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recommendations.map((rec, index) => (
                <tr
                  className="border-border/50 border-b last:border-0"
                  key={`rec-${index.toString()}`}
                >
                  <td className="py-4 pr-4">{rec.title}</td>
                  <td className="py-4 pr-4">
                    <Badge variant={rec.categoryColor}>{rec.category}</Badge>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="flex items-center gap-1">
                      {rec.impactUp ? (
                        <TrendingUp className="size-3 text-green-dark" />
                      ) : null}
                      {rec.impact}
                    </span>
                  </td>
                  <td className="py-4">
                    <Badge
                      variant={
                        rec.status === "Implemented" ? "green" : "neutral"
                      }
                    >
                      {rec.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Button className="self-center">
          Talk to a Consultant
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ComplianceProgress() {
  const completedCount = complianceItems.filter((item) => item.complete).length;
  const totalCount = complianceItems.length;
  const progressValue = (completedCount / totalCount) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="font-semibold">Compliance Progress</h3>
        <p className="text-muted-foreground text-xs">
          Annual regulatory requirements tracker
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-semibold">
            {completedCount} of {totalCount} complete
          </span>
        </div>
        <Progress className="h-2 [&>div]:bg-green-dark" value={progressValue} />
      </div>

      <div className="flex flex-col gap-3">
        {complianceItems.map((item, index) => (
          <div
            className="flex items-center justify-between gap-2"
            key={`compliance-${index.toString()}`}
          >
            <div className="flex items-start gap-2">
              {item.complete ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-dark" />
              ) : (
                <Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              )}
              <div className="flex flex-col">
                <span className="text-sm">{item.title}</span>
                <span className="text-muted-foreground text-xs">
                  {item.due}
                </span>
              </div>
            </div>
            <Badge variant={item.complete ? "green" : "yellow"}>
              {item.complete ? "Complete" : "Pending"}
            </Badge>
          </div>
        ))}
      </div>

      {/* Next deadline alert */}
      <div className="mt-2 flex items-start gap-2 rounded-lg border border-yellow-dark/20 bg-yellow-lightest/10 p-3">
        <AlertCircle className="mt-0.5 size-4 shrink-0 text-yellow-dark" />
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            Next Deadline Approaching
          </span>
          <span className="text-muted-foreground text-xs">
            Q4 Investment Review due on October 15, 2024.
          </span>
        </div>
      </div>
    </div>
  );
}

function MobileRightSidebar() {
  return (
    <div className="md:hidden">
      <Accordion collapsible type="single">
        <AccordionItem value="sidebar">
          <AccordionTrigger className="font-semibold text-base">
            Action Items, Tasks & Compliance
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-6">
              <ActionItems />
              <hr className="border-border" />
              <MyTasks />
              <hr className="border-border" />
              <ComplianceProgress />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default function ClientDashboardPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="heading-lg">{getGreeting()},</h1>
          <p className="mt-1 text-muted-foreground">
            Here's an overview of your client's benefits strategy, progress, and
            open actions to stay ahead of their needs.
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
              <Link href={`/clients/${clientId}/canvas`}>Canvas</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/clients/${clientId}/strategic-roadmap`}>
                5-Year Roadmap
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/clients/${clientId}/benchmarking`}>
                Benchmarking
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/clients/${clientId}/workforce-investment`}>
                Workforce Investment
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/clients/${clientId}/evps`}>EVPS</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Recent Activity + Action Items row - 3 column grid matching summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recent Activity - spans 2 columns */}
        <div className="md:col-span-2">
          <RecentActivity />
        </div>

        {/* Action Items + My Tasks - 1 column, desktop only */}
        <div className="hidden md:block">
          <Card className="h-full">
            <CardContent className="flex flex-col gap-6 p-5">
              <ActionItems />
              <hr className="border-border" />
              <MyTasks />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile accordion for action items and tasks */}
      <MobileRightSidebar />

      {/* Recommendations + Compliance row - 3 column grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Recommendations table - spans 2 columns */}
        <div className="md:col-span-2">
          <RecommendationsTable />
        </div>

        {/* Compliance Progress - 1 column, desktop only */}
        <div className="hidden md:block">
          <Card className="h-full">
            <CardContent className="p-5">
              <ComplianceProgress />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
