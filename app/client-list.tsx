"use client";

import { useMutation, usePaginatedQuery } from "convex/react";
import {
  ArrowRight,
  Building2,
  Loader2,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ArrowButton } from "@/components/ui/arrow-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

/** Skeleton loading cards for initial page load */
function ClientSkeletons() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={`skeleton-${i.toString()}`}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4 rounded-lg" />
            <Skeleton className="h-4 w-full rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-3 h-8 w-24 rounded-md" />
            <Skeleton className="h-4 w-2/3 rounded-lg" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full rounded-lg" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

/** Empty state when no clients exist or no search results */
function EmptyState({
  hasSearchQuery,
  isSeeding,
  onSeed,
}: {
  hasSearchQuery: boolean;
  isSeeding: boolean;
  onSeed: () => void;
}) {
  return (
    <div className="flex justify-center py-16">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
            <Building2 className="size-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">
            {hasSearchQuery ? "No clients found" : "No clients yet"}
          </CardTitle>
          <CardDescription className="text-base">
            {hasSearchQuery
              ? "Try adjusting your search term to find what you're looking for."
              : "Get started by seeding the database with sample client data."}
          </CardDescription>
        </CardHeader>
        {hasSearchQuery ? null : (
          <CardFooter className="flex-col gap-4">
            <Button
              className="w-full"
              disabled={isSeeding}
              onClick={onSeed}
              size="lg"
            >
              {isSeeding ? "Seeding..." : "Seed Sample Clients"}
              <ArrowRight className="size-4" />
            </Button>
            <div className="w-full rounded-xl bg-muted/50 p-4 text-left">
              <p className="mb-2 font-semibold text-sm">Or seed manually:</p>
              <ol className="list-inside list-decimal space-y-1 text-muted-foreground text-sm">
                <li>Open the Convex dashboard</li>
                <li>Go to Functions tab</li>
                <li>Run the seedClients mutation</li>
              </ol>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

/** Individual client card */
function ClientCard({ client }: { client: Doc<"clients"> }) {
  return (
    <Link href={`/clients/${client._id}`}>
      <Card interactive>
        <CardHeader>
          <CardTitle>{client.name}</CardTitle>
          <CardDescription className="flex items-start gap-1.5">
            <MapPin className="mt-0.5 size-4 shrink-0 transition-colors group-hover:text-primary-foreground/80 max-md:group-data-[interactive]:text-primary-foreground/80" />
            <span>{client.address}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Badge className="mb-3" variant="blue">
            {client.sicCode}
          </Badge>
          <p className="line-clamp-2 text-muted-foreground text-sm transition-colors group-hover:text-primary-foreground/80 max-md:group-data-[interactive]:text-primary-foreground/80">
            {client.sicDescription}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-border/50 border-t pt-4 transition-colors group-hover:border-primary-foreground/30 max-md:group-data-[interactive]:border-primary-foreground/30">
          <div className="flex items-center gap-2 text-sm">
            <Users className="size-4 text-muted-foreground transition-colors group-hover:text-primary-foreground/80 max-md:group-data-[interactive]:text-primary-foreground/80" />
            <span className="font-semibold transition-colors group-hover:text-primary-foreground max-md:group-data-[interactive]:text-primary-foreground">
              {client.employeeCount.toLocaleString()}
            </span>
            <span className="text-muted-foreground transition-colors group-hover:text-primary-foreground/80 max-md:group-data-[interactive]:text-primary-foreground/80">
              employees
            </span>
          </div>
          <ArrowButton />
        </CardFooter>
      </Card>
    </Link>
  );
}

export function ClientList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  // Track if we've ever loaded data to avoid flashing skeletons on search
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // usePaginatedQuery injects paginationOpts automatically - only pass other args
  const queryResult = usePaginatedQuery(
    api.clients.list,
    {
      searchQuery: debouncedSearch || undefined,
    },
    { initialNumItems: 12 }
  );

  const { results, status, loadMore } = queryResult;

  // Track when we've loaded data for the first time
  if (status !== "LoadingFirstPage" && !hasLoadedOnce.current) {
    hasLoadedOnce.current = true;
  }

  // Show skeletons only on initial load, not during search
  const showSkeletons = status === "LoadingFirstPage" && !hasLoadedOnce.current;
  // Show loading indicator when searching (after initial load)
  const isSearching = status === "LoadingFirstPage" && hasLoadedOnce.current;
  const seedClients = useMutation(api.seed.seedClients);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedClients({});
      console.log("Seeded:", result);
    } catch (error) {
      console.error("Error seeding:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      {/* Header Section */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          {/* Eyebrow uses muted-foreground per brand guidelines */}
          <span className="eyebrow">Client Directory</span>
          <h1 className="heading-xl text-primary">Impact Studio</h1>
          <p className="body-md max-w-2xl text-muted-foreground">
            Browse and manage your client portfolio. Search by company name to
            find specific clients.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xl">
          <Search className="-translate-y-1/2 absolute top-1/2 left-4 size-5 text-muted-foreground" />
          <Input
            className="pl-12"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients by name..."
            type="search"
            value={searchQuery}
          />
          {/* Show spinner in search input when searching */}
          {isSearching ? (
            <Loader2 className="-translate-y-1/2 absolute top-1/2 right-4 size-5 animate-spin text-muted-foreground" />
          ) : null}
        </div>
      </header>

      {/* Loading State - only show skeletons on initial load, not during search */}
      {showSkeletons ? <ClientSkeletons /> : null}

      {/* Empty State - show when not loading skeletons and no results */}
      {!showSkeletons && results.length === 0 && !isSearching ? (
        <EmptyState
          hasSearchQuery={Boolean(debouncedSearch)}
          isSeeding={isSeeding}
          onSeed={handleSeed}
        />
      ) : null}

      {/* Client Grid - show when we have results (keep visible during search) */}
      {(results.length > 0 || isSearching) && (
        <>
          <div
            className={`grid gap-6 transition-opacity duration-200 md:grid-cols-2 xl:grid-cols-3 ${
              isSearching ? "opacity-60" : "opacity-100"
            }`}
          >
            {results.map((client) => (
              <ClientCard client={client} key={client._id} />
            ))}
          </div>

          {/* Load More */}
          {status === "CanLoadMore" && (
            <div className="flex justify-center pt-4">
              {/* Tertiary button per brand guidelines: for routing/navigation CTAs */}
              <Button onClick={() => loadMore(12)} size="lg" variant="tertiary">
                Load More Clients
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
