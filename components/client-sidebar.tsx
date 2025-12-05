"use client";

import {
  BarChart3,
  Building2,
  ChevronRight,
  Database,
  Heart,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  PanelsTopLeft,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const getNavItems = (clientId: string): NavItem[] => [
  {
    href: `/clients/${clientId}`,
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: `/clients/${clientId}/canvas`,
    label: "Canvas",
    icon: PanelsTopLeft,
  },
  {
    href: `/clients/${clientId}/strategic-roadmap`,
    label: "5-Year Roadmap",
    icon: MapIcon,
  },
  {
    href: `/clients/${clientId}/benchmarking`,
    label: "Benchmarking",
    icon: BarChart3,
  },
  {
    href: `/clients/${clientId}/workforce-investment`,
    label: "Workforce Investment",
    icon: TrendingUp,
  },
  {
    href: `/clients/${clientId}/evps`,
    label: "EVPS",
    icon: Heart,
  },
  {
    href: `/clients/${clientId}/data-management`,
    label: "Data Management",
    icon: Database,
  },
];

// Mock client data - will be replaced with real data later
const mockClient = {
  name: "BrightWave Solutions",
};

function ClientSelector({ clientName }: { clientName: string }) {
  return (
    <Link
      className="group flex items-center justify-between rounded-xl border border-border bg-background p-4 transition-colors hover:bg-muted"
      href="/clients"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          <Building2 className="size-5 text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground text-xs">Current Client</span>
          <span className="font-semibold text-sm">{clientName}</span>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function NavLinks({
  items,
  currentPath,
  clientId,
}: {
  items: NavItem[];
  currentPath: string;
  clientId: string;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const isActive =
          item.href === `/clients/${clientId}`
            ? currentPath === item.href
            : currentPath.startsWith(item.href);

        return (
          <Link
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            href={item.href}
            key={item.href}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ClientSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const clientId = params.clientId as string;
  const navItems = getNavItems(clientId);

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-20 flex flex-col gap-6">
        <ClientSelector clientName={mockClient.name} />
        <NavLinks clientId={clientId} currentPath={pathname} items={navItems} />
      </div>
    </aside>
  );
}

export function ClientSidebarMobile() {
  const params = useParams();
  const pathname = usePathname();
  const clientId = params.clientId as string;
  const navItems = getNavItems(clientId);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="lg:hidden" size="sm" variant="outline">
          <Menu className="size-4" />
          <span>Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-72" side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col gap-6">
          <ClientSelector clientName={mockClient.name} />
          <NavLinks
            clientId={clientId}
            currentPath={pathname}
            items={navItems}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
