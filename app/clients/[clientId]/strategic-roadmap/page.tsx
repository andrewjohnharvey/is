import { Map as MapIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StrategicRoadmapPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="heading-lg">5-Year Strategic Roadmap</h1>
        <p className="mt-1 text-muted-foreground">
          Plan and track long-term benefits strategy recommendations and their
          implementation progress.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-base">
            <MapIcon className="size-5 text-primary" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This page is under development. Strategic roadmap planning and
            tracking features will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
