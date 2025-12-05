import { TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WorkforceInvestmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="heading-lg">Workforce Investment</h1>
        <p className="mt-1 text-muted-foreground">
          Analyze and optimize your client's total workforce investment across
          wages, benefits, and retirement.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-base">
            <TrendingUp className="size-5 text-primary" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This page is under development. Workforce investment analytics and
            reporting features will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
