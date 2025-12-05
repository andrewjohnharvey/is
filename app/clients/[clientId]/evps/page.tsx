import { Heart } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EVPSPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="heading-lg">EVPS</h1>
        <p className="mt-1 text-muted-foreground">
          Employee Value Proposition Score - measure and improve how employees
          perceive their total rewards.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-base">
            <Heart className="size-5 text-primary" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This page is under development. EVPS analytics and survey tools will
            be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
