"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Info,
  Lightbulb,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Types for content blocks (matching the schema)
interface NarrativeBlock {
  type: "narrative";
  text: string;
  tone: "informative" | "persuasive" | "cautionary" | "celebratory";
}

interface KeyMetricBlock {
  type: "key_metric";
  label: string;
  value: string;
  change?: {
    direction: "up" | "down" | "flat";
    amount: string;
    context: string;
  };
}

interface ComparisonBlock {
  type: "comparison";
  items: Array<{
    label: string;
    values: Record<string, unknown>;
  }>;
  highlightBest?: boolean;
}

interface TimelineBlock {
  type: "timeline";
  events: Array<{
    date: string;
    title: string;
    description: string;
  }>;
}

interface RecommendationBlock {
  type: "recommendation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
}

interface RiskBlock {
  type: "risk";
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  mitigation?: string;
}

interface CalloutBlock {
  type: "callout";
  style: "info" | "warning" | "success" | "question";
  content: string;
}

interface VisualizationBlock {
  type: "visualization";
  chartType: string;
  title: string;
  data: unknown;
  insight?: string;
}

type ContentBlock = {
  type: string;
  data:
    | NarrativeBlock
    | KeyMetricBlock
    | ComparisonBlock
    | TimelineBlock
    | RecommendationBlock
    | RiskBlock
    | CalloutBlock
    | VisualizationBlock;
};

// Chart colors for visualizations
const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

/**
 * Main renderer component that delegates to specific block renderers
 */
export function ContentBlockRenderer({ block }: { block: ContentBlock }) {
  const blockData = block.data;
  const blockType = block.type;

  switch (blockType) {
    case "narrative":
      return <NarrativeBlockRenderer data={blockData as NarrativeBlock} />;
    case "key_metric":
      return <KeyMetricBlockRenderer data={blockData as KeyMetricBlock} />;
    case "comparison":
      return <ComparisonBlockRenderer data={blockData as ComparisonBlock} />;
    case "timeline":
      return <TimelineBlockRenderer data={blockData as TimelineBlock} />;
    case "recommendation":
      return (
        <RecommendationBlockRenderer data={blockData as RecommendationBlock} />
      );
    case "risk":
      return <RiskBlockRenderer data={blockData as RiskBlock} />;
    case "callout":
      return <CalloutBlockRenderer data={blockData as CalloutBlock} />;
    case "visualization":
      return (
        <VisualizationBlockRenderer data={blockData as VisualizationBlock} />
      );
    default:
      return (
        <div className="rounded-lg border border-dashed p-4 text-muted-foreground">
          Unknown block type: {blockType}
        </div>
      );
  }
}

/**
 * Narrative block - rich text content
 */
function NarrativeBlockRenderer({ data }: { data: NarrativeBlock }) {
  const toneStyles = {
    informative: "border-l-blue-500",
    persuasive: "border-l-purple-500",
    cautionary: "border-l-amber-500",
    celebratory: "border-l-green-500",
  };

  return (
    <div
      className={`border-l-4 pl-4 ${toneStyles[data.tone] || "border-l-gray-300"}`}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: AI-generated HTML content for narrative blocks
      dangerouslySetInnerHTML={{ __html: data.text }}
    />
  );
}

/**
 * Key metric block - single important metric with optional change indicator
 */
function KeyMetricBlockRenderer({ data }: { data: KeyMetricBlock }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-muted-foreground text-sm">
              {data.label}
            </p>
            <p className="font-bold text-3xl">{data.value}</p>
          </div>
          {data.change && (
            <div className="text-right">
              <div
                className={`flex items-center gap-1 ${
                  data.change.direction === "up"
                    ? "text-green-600"
                    : data.change.direction === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {data.change.direction === "up" && (
                  <TrendingUp className="size-4" />
                )}
                {data.change.direction === "down" && (
                  <TrendingDown className="size-4" />
                )}
                {data.change.direction === "flat" && (
                  <ArrowRight className="size-4" />
                )}
                <span className="font-semibold">{data.change.amount}</span>
              </div>
              <p className="text-muted-foreground text-xs">
                {data.change.context}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Comparison block - side-by-side comparison of items
 */
function ComparisonBlockRenderer({ data }: { data: ComparisonBlock }) {
  if (!data.items || data.items.length === 0) {
    return null;
  }

  // Get all unique keys from all items
  const allKeys = new Set<string>();
  for (const item of data.items) {
    for (const key of Object.keys(item.values)) {
      allKeys.add(key);
    }
  }
  const keys = Array.from(allKeys);

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Item</TableHead>
              {keys.map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="pl-4 font-medium">{item.label}</TableCell>
                {keys.map((key) => (
                  <TableCell key={key}>
                    {String(item.values[key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

/**
 * Timeline block - chronological events
 */
function TimelineBlockRenderer({ data }: { data: TimelineBlock }) {
  return (
    <div className="space-y-4">
      {data.events.map((event, index) => (
        <div className="flex gap-4" key={index}>
          <div className="flex flex-col items-center">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
              {index + 1}
            </div>
            {index < data.events.length - 1 && (
              <div className="w-0.5 flex-1 bg-border" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <p className="font-medium text-muted-foreground text-xs">
              {event.date}
            </p>
            <p className="font-semibold">{event.title}</p>
            <p className="text-muted-foreground text-sm">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Recommendation block - actionable recommendation with impact/effort
 */
function RecommendationBlockRenderer({ data }: { data: RecommendationBlock }) {
  const impactColors = {
    high: "green",
    medium: "yellow",
    low: "neutral",
  } as const;

  const effortColors = {
    high: "orange",
    medium: "yellow",
    low: "green",
  } as const;

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="size-5 text-purple-500" />
            <CardTitle className="text-base">{data.title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Badge variant={impactColors[data.impact]}>
              Impact: {data.impact}
            </Badge>
            <Badge variant={effortColors[data.effort]}>
              Effort: {data.effort}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{data.description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * Risk block - identified risk with severity and mitigation
 */
function RiskBlockRenderer({ data }: { data: RiskBlock }) {
  const severityConfig = {
    critical: {
      color: "border-l-red-600",
      icon: AlertCircle,
      badge: "orange" as const,
    },
    high: {
      color: "border-l-orange-500",
      icon: AlertTriangle,
      badge: "orange" as const,
    },
    medium: {
      color: "border-l-yellow-500",
      icon: AlertTriangle,
      badge: "yellow" as const,
    },
    low: {
      color: "border-l-blue-500",
      icon: Info,
      badge: "blue" as const,
    },
  };

  const config = severityConfig[data.severity];
  const Icon = config.icon;

  return (
    <Card className={`border-l-4 ${config.color}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="size-5" />
            <CardTitle className="text-base">{data.title}</CardTitle>
          </div>
          <Badge variant={config.badge}>
            {data.severity.charAt(0).toUpperCase() + data.severity.slice(1)}{" "}
            Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-muted-foreground">{data.description}</p>
        {data.mitigation && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm">
              <span className="font-medium">Mitigation: </span>
              {data.mitigation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Callout block - highlighted information
 */
function CalloutBlockRenderer({ data }: { data: CalloutBlock }) {
  const styleConfig = {
    info: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      icon: Info,
      iconColor: "text-blue-600",
    },
    warning: {
      bg: "bg-amber-50 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800",
      icon: AlertTriangle,
      iconColor: "text-amber-600",
    },
    success: {
      bg: "bg-green-50 dark:bg-green-950/30",
      border: "border-green-200 dark:border-green-800",
      icon: CheckCircle2,
      iconColor: "text-green-600",
    },
    question: {
      bg: "bg-purple-50 dark:bg-purple-950/30",
      border: "border-purple-200 dark:border-purple-800",
      icon: HelpCircle,
      iconColor: "text-purple-600",
    },
  };

  const config = styleConfig[data.style];
  const Icon = config.icon;

  return (
    <div
      className={`flex gap-3 rounded-lg border p-4 ${config.bg} ${config.border}`}
    >
      <Icon className={`size-5 shrink-0 ${config.iconColor}`} />
      <p className="text-sm">{data.content}</p>
    </div>
  );
}

/**
 * Visualization block - charts and data visualizations
 */
function VisualizationBlockRenderer({ data }: { data: VisualizationBlock }) {
  const chartData = Array.isArray(data.data) ? data.data : [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {data.chartType === "bar" && (
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={chartData}>
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      key={`cell-${index}`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}

          {data.chartType === "line" && (
            <ResponsiveContainer height="100%" width="100%">
              <LineChart data={chartData}>
                <XAxis
                  axisLine={false}
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip />
                <Line
                  dataKey="value"
                  dot={{ fill: CHART_COLORS[0] }}
                  stroke={CHART_COLORS[0]}
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {data.chartType === "pie" && (
            <ResponsiveContainer height="100%" width="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={chartData}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                  outerRadius={80}
                >
                  {chartData.map((_, index) => (
                    <Cell
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      key={`cell-${index}`}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}

          {data.chartType === "table" && (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {chartData.length > 0 &&
                      Object.keys(chartData[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chartData.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {!["bar", "line", "pie", "table"].includes(data.chartType) && (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Unsupported chart type: {data.chartType}
            </div>
          )}
        </div>

        {data.insight && (
          <p className="mt-4 text-muted-foreground text-sm italic">
            {data.insight}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
