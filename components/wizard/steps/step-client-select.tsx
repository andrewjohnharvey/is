"use client";

import { Building2, Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WizardNavigation } from "@/components/wizard/wizard-navigation";
import { WizardStep } from "@/components/wizard/wizard-step";
import { cn } from "@/lib/utils";

interface Client {
  id: string;
  name: string;
  industry?: string;
  location?: string;
  employeeCount?: number;
  lastCanvasDate?: string;
}

interface StepClientSelectProps {
  clients: Client[];
  selectedClientId: string | null;
  onSelectClient: (client: Client) => void;
  onBack: () => void;
  onContinue: () => void;
  onAddNewClient?: () => void;
}

export function StepClientSelect({
  clients,
  selectedClientId,
  onSelectClient,
  onBack,
  onContinue,
  onAddNewClient,
}: StepClientSelectProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <WizardStep
        description="Choose the client for this renewal presentation."
        stepId="client"
        title="Who is this presentation for?"
      >
        {/* Search */}
        <div className="relative mb-6">
          <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-4 text-muted-foreground" />
          <Input
            className="pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            type="search"
            value={searchQuery}
          />
        </div>

        {/* Client list */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium text-muted-foreground text-sm uppercase tracking-wide">
            {searchQuery ? "Search Results" : "Recent Clients"}
          </h3>
          <div className="flex flex-col gap-2">
            {filteredClients.map((client) => (
              <Card
                className={cn(
                  "cursor-pointer p-4 transition-all hover:border-primary",
                  selectedClientId === client.id &&
                    "border-primary bg-primary/5 ring-1 ring-primary"
                )}
                key={client.id}
                onClick={() => onSelectClient(client)}
              >
                <div className="flex items-start gap-4">
                  {/* Radio indicator */}
                  <div
                    className={cn(
                      "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                      selectedClientId === client.id
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/30"
                    )}
                  >
                    {selectedClientId === client.id && (
                      <div className="size-2 rounded-full bg-white" />
                    )}
                  </div>

                  {/* Client info */}
                  <div className="flex-1">
                    <h4 className="font-semibold">{client.name}</h4>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-sm">
                      {client.industry && (
                        <span className="flex items-center gap-1">
                          <Building2 className="size-3" />
                          {client.industry}
                        </span>
                      )}
                      {client.location && <span>{client.location}</span>}
                      {client.employeeCount && (
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {client.employeeCount.toLocaleString()} employees
                        </span>
                      )}
                    </div>
                    {client.lastCanvasDate && (
                      <p className="mt-1 text-muted-foreground text-xs">
                        Last canvas: {client.lastCanvasDate}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {filteredClients.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <p>No clients found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Add new client */}
        {onAddNewClient && (
          <button
            className="flex w-full items-center gap-2 rounded-lg border border-border border-dashed p-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            onClick={onAddNewClient}
            type="button"
          >
            <Plus className="size-4" />
            <span className="text-sm">
              Don't see your client? Add a new one
            </span>
          </button>
        )}
      </WizardStep>

      <WizardNavigation
        canContinue={selectedClientId !== null}
        onBack={onBack}
        onContinue={onContinue}
      />
    </>
  );
}
