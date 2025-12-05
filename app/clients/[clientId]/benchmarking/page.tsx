import { BarChart3 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BenchmarkingPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="heading-lg">Benchmarking</h1>
        <p className="mt-1 text-muted-foreground">
          Compare your client's benefits and compensation against industry peers
          and market benchmarks.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-base">
            <BarChart3 className="size-5 text-primary" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This page is under development. Demographic and competitive
            benchmarking features will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
