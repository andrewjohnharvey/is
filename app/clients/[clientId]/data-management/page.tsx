import { Database } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DataManagementPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="heading-lg">Data Management</h1>
        <p className="mt-1 text-muted-foreground">
          Upload, manage, and validate client census and benefits data files.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans text-base">
            <Database className="size-5 text-primary" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This page is under development. Data upload and management features
            will be available here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
