"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  ChevronLeft,
  Server,
  User,
  Zap,
} from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { ThemeToggleButton } from "@/src/components/ui/ThemeToggleButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

type AdminShellProps = {
  children: React.ReactNode;
};

type AdminMenuItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>;
};

const ADMIN_MENU_ITEMS: AdminMenuItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Analytics",
    href: "/admin#campaigns",
    icon: BarChart3,
  },
  {
    label: "Crawling Logs",
    href: "/admin#content-report",
    icon: FileText,
  },
  {
    label: "Server Logs",
    href: "/admin#server-logs",
    icon: Server,
  },
];

const fakeUser = {
  name: "Admin User",
  avatarInitial: "A",
};

export default function HeaderAdmin({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedHref, setSelectedHref] = useState("/admin");

  const sidebarWidth = isCollapsed ? "w-20" : "w-72";
  const contentOffset = isCollapsed ? "md:pl-20" : "md:pl-72";

  return (
    <div className="min-h-screen bg-[var(--body-bg)] text-foreground">
      <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
        <defs>
          <linearGradient
            id="admin-sidebar-icon-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#0fb490" />
            <stop offset="55%" stopColor="#1070e4" />
            <stop offset="100%" stopColor="#6913cb" />
          </linearGradient>
        </defs>
      </svg>
      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden border-r border-slate-200 bg-white shadow-sm transition-[width] duration-300 dark:border-slate-800 dark:bg-[#111217] md:block ${sidebarWidth}`}
      >
        <div className="flex h-20 items-center gap-3 px-3">
          <div className="shrink-0">
            <Image src="/LOGO.png" alt="Biểu trưng" width={40} height={40} />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xl font-semibold hidden md:flex bg-clip-text text-transparent bg-[image:var(--FN-Gradient-2)]">
                Fake Finance Detector
              </p>
            </div>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((value) => !value)}
            className="h-8 w-8 shrink-0 rounded-full border border-slate-200 bg-white shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-[#181a20] dark:hover:bg-slate-800"
            aria-label={isCollapsed ? "Mở sidebar" : "Đóng sidebar"}
          >
            <ChevronLeft
              className={`h-4 w-4 text-slate-600 transition-transform duration-300 dark:text-slate-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        <nav className="p-0">
          <div className="flex flex-col gap-0">
            {ADMIN_MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                selectedHref === item.href ||
                (selectedHref === "/admin" &&
                  item.href === "/admin" &&
                  pathname === "/admin");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSelectedHref(item.href)}
                  title={isCollapsed ? item.label : undefined}
                  className={`group relative flex h-14 items-center overflow-hidden rounded-none text-sm font-semibold transition-colors ${
                    isActive
                      ? "text-slate-950 dark:text-white"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  } ${isCollapsed ? "justify-center px-0" : "gap-3 px-5"}`}
                >
                  {isActive && (
                    <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,180,144,0.18),rgba(16,112,228,0.13),rgba(105,19,203,0.04),transparent)] dark:bg-[linear-gradient(90deg,rgba(77,229,197,0.22),rgba(106,171,251,0.14),rgba(145,51,255,0.06),transparent)]" />
                  )}
                  <span
                    className={`relative shrink-0 transition-colors ${
                      isActive ? "text-primary" : ""
                    }`}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={
                        isActive
                          ? { stroke: "url(#admin-sidebar-icon-gradient)" }
                          : undefined
                      }
                    />
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="relative min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                      {isActive && (
                        <span className="relative h-2 w-2 rounded-full bg-primary/45 dark:bg-cyan-300/60" />
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      <header
        className={`fixed right-0 top-0 z-40 h-16 border-b bg-background/95 backdrop-blur transition-[left] duration-300 md:h-20 ${
          isCollapsed ? "md:left-20" : "md:left-72"
        } left-0`}
      >
        <div className="flex h-full items-center justify-end gap-3 px-4 md:px-6">
          <div className="flex flex-1 md:hidden">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[image:var(--FN-Gradient-2)] text-white">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-bold text-primary">Crawl Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggleButton />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="ml-auto flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[image:var(--FN-Gradient-2)] text-sm font-bold text-white shadow-md shadow-primary/20">
                    <Image
                      src={"/image/default.png"}
                      alt={fakeUser.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </div>
                  <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-sm font-bold text-foreground">
                      {fakeUser.name}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="gap-2">
                  <User className="h-4 w-4" />
                  {fakeUser.name}
                </DropdownMenuItem>
                <Link href="/admin/login">
                  <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main
        className={`min-h-screen pt-16 transition-[padding-left] duration-300 md:pt-20 ${contentOffset}`}
      >
        <div className="min-w-0 px-4 py-6 md:px-8">{children}</div>
      </main>
    </div>
  );
}
