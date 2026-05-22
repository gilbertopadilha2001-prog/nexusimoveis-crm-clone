"use client";

import { PanelLeft, LogOut, Bell, Search } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface AppHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppHeader({ isCollapsed, onToggle }: AppHeaderProps) {
  const { data: session } = useSession();

  const userName = session?.user?.name || "Usuário";
  const userRole = session?.user?.role === "ADMIN" ? "Admin / Master" : "Corretor";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="flex items-center gap-4 px-4 bg-card border-b border-border"
      style={{ height: 56, flexShrink: 0 }}
    >
      <button
        onClick={onToggle}
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Toggle Sidebar"
      >
        <PanelLeft className="h-4 w-4" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar leads, contatos, imóveis..."
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Notifications */}
      <button
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Notificações"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-[10px] font-bold text-white flex items-center justify-center">
          3
        </span>
      </button>

      {/* User avatar */}
      <Link
        href="/profile"
        className="flex items-center gap-2 hover:opacity-80 transition-opacity rounded-lg px-2 py-1"
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer"
          style={{
            backgroundColor: "var(--nexus-gold)",
            color: "var(--nexus-dark)",
          }}
        >
          {userInitials}
        </div>
        <div className="hidden sm:flex flex-col">
          <span className="text-sm font-medium text-foreground leading-tight">
            {userName.split(" ")[0]}
          </span>
          <span className="text-[11px] text-muted-foreground leading-tight">
            {userRole}
          </span>
        </div>
      </Link>

      {/* Logout */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
        aria-label="Sair"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </header>
  );
}
