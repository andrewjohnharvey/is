"use client";

import { Briefcase, ChevronDown, Home, Menu, User, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/clients", label: "Clients", icon: Users, hasDropdown: true },
  { href: "/benefits-resources", label: "Benefits Resources", icon: Briefcase },
];

function NavLink({
  href,
  label,
  isActive,
  hasDropdown,
}: {
  href: string;
  label: string;
  isActive: boolean;
  hasDropdown?: boolean;
}) {
  if (hasDropdown) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1 px-3 py-2 font-medium text-sm transition-colors hover:text-primary",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
            type="button"
          >
            {label}
            <ChevronDown className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <Link href="/clients">All Clients</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Link
      className={cn(
        "px-3 py-2 font-medium text-sm transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground"
      )}
      href={href}
    >
      {label}
    </Link>
  );
}

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
          type="button"
        >
          <Avatar className="size-9 border border-border">
            <AvatarFallback className="bg-muted text-muted-foreground text-sm">
              <User className="size-4" />
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNav() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="lg:hidden" size="icon" variant="ghost">
          <Menu className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-72" side="left">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Image
              alt="OneDigital"
              height={24}
              src="/ODLogo2.0_New-OneDigital-Logo-Triad-Large.png"
              width={24}
            />
            <span className="font-semibold text-sm tracking-wide">
              IMPACT STUDIO
            </span>
          </SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium text-sm transition-colors",
                pathname === link.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              href={link.href}
              key={link.href}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-border/50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 md:px-6">
        {/* Left: Mobile menu + Logo */}
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link className="flex items-center gap-2.5" href="/">
            <Image
              alt="OneDigital"
              className="size-7"
              height={28}
              src="/ODLogo2.0_New-OneDigital-Logo-Triad-Large.png"
              width={28}
            />
            <span className="font-semibold text-primary text-sm tracking-wide">
              IMPACT STUDIO
            </span>
          </Link>
        </div>

        {/* Right: Desktop Navigation + User menu */}
        <div className="flex items-center gap-1">
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <NavLink
                hasDropdown={link.hasDropdown}
                href={link.href}
                isActive={
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href)
                }
                key={link.href}
                label={link.label}
              />
            ))}
          </nav>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
