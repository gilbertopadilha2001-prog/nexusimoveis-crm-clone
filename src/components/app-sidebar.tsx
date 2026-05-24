"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Send,
  RotateCcw,
  Kanban,
  House,
  UserCheck,
  Settings,
  Target,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navMain = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/conversations", label: "Conversas", icon: MessageSquare },
  { href: "/contacts", label: "Contatos", icon: Users },
  { href: "/crm", label: "CRM Kanban", icon: Kanban },
  { href: "/lead-distribution", label: "Distribuição", icon: Target },
  { href: "/recent-contacts", label: "Últimos Contatos", icon: Clock },
  { href: "/broadcasts", label: "Disparos", icon: Send },
  { href: "/followups", label: "Follow-ups", icon: RotateCcw },
  { href: "/products", label: "Imóveis", icon: House },
  { href: "/agents", label: "Corretores", icon: UserCheck },
];

const navSystem = [
  { href: "/settings", label: "Configurações", icon: Settings },
];

interface AppSidebarProps {
  isCollapsed: boolean;
}

interface WhatsAppStatus {
  status: "connected" | "disconnected" | "scanning";
  phone: string | null;
  instanceName: string | null;
  userName: string | null;
  disconnectionCode?: number | null;
  disconnectionReason?: string | null;
}

export function AppSidebar({ isCollapsed }: AppSidebarProps) {
  const pathname = usePathname();
  const [wa, setWa] = useState<WhatsAppStatus | null>(null);

  useEffect(() => {
    const fetchStatus = () => {
      fetch("/api/evolution/status")
        .then((r) => r.ok ? r.json() : null)
        .then((d) => d && setWa(d))
        .catch(() => {});
    };
    fetchStatus();
    const id = setInterval(fetchStatus, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside
      className={cn(
        "flex h-full flex-col transition-all duration-200 ease-in-out",
        "bg-sidebar border-r border-sidebar-border",
        isCollapsed ? "w-14" : "w-[255px]"
      )}
      style={{ flexShrink: 0 }}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-3 border-b border-sidebar-border",
          isCollapsed ? "p-2 justify-center" : "p-4"
        )}
        style={{ minHeight: 64 }}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0 ring-1 ring-sidebar-border">
          <Image
            src="/images/nexus-logo.png"
            alt="Nexus Imóveis"
            width={36}
            height={36}
            className="rounded-full"
          />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <span
              className="font-display font-bold text-sm leading-tight truncate"
              style={{ color: "var(--nexus-gold)" }}
            >
              Nexus Imóveis
            </span>
            <span
              className="text-[11px] leading-tight truncate"
              style={{ color: "hsl(40, 10%, 60%)" }}
            >
              Dashboard CRM
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-4">
        <NavSection
          label="Menu Principal"
          items={navMain}
          pathname={pathname}
          isCollapsed={isCollapsed}
        />
        <NavSection
          label="Sistema"
          items={navSystem}
          pathname={pathname}
          isCollapsed={isCollapsed}
        />
      </nav>

      {/* Footer status */}
      {!isCollapsed && (
        <div className="p-2">
          <div className="rounded-lg p-3 space-y-2" style={{ backgroundColor: "hsl(220, 20%, 16%)" }}>
            <p className="text-xs font-semibold" style={{ color: "hsl(40, 10%, 65%)" }}>
              Evolution API
            </p>
            {wa ? (
              <>
                <div className="flex items-center gap-1.5">
                  {wa.status === "connected" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "rgb(74, 222, 128)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      Conectado
                    </span>
                  ) : wa.status === "scanning" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "rgb(251, 191, 36)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block animate-pulse" />
                      Aguardando QR
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "rgb(252, 129, 129)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      Desconectado
                    </span>
                  )}
                </div>
                {wa.userName && (
                  <p className="text-[11px] truncate" style={{ color: "hsl(40, 10%, 80%)" }}>
                    {wa.userName}
                  </p>
                )}
                {wa.disconnectionCode === 403 && (
                  <p className="text-[10px] leading-snug" style={{ color: "rgb(252, 129, 129)" }}>
                    ⚠️ Conta bloqueada pelo WhatsApp. Aguarde 24-72h.
                  </p>
                )}
                {wa.instanceName && (
                  <p className="text-[10px] font-mono truncate" style={{ color: "hsl(40, 10%, 50%)" }}>
                    #{wa.instanceName}
                    {wa.phone ? ` · ${wa.phone}` : ""}
                  </p>
                )}
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.15)", color: "rgb(74, 222, 128)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online
              </span>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}

interface NavSectionProps {
  label: string;
  items: typeof navMain;
  pathname: string;
  isCollapsed: boolean;
}

function NavSection({ label, items, pathname, isCollapsed }: NavSectionProps) {
  return (
    <div>
      {!isCollapsed && (
        <p
          className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1"
          style={{ color: "hsl(40, 10%, 50%)" }}
        >
          {label}
        </p>
      )}
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-[10px] w-full transition-colors text-sm",
                  isCollapsed && "justify-center",
                  isActive
                    ? "font-medium"
                    : "font-normal hover:bg-sidebar-accent/60"
                )}
                style={
                  isActive
                    ? {
                        backgroundColor: "hsl(220, 20%, 16%)",
                        color: "hsl(42, 70%, 65%)",
                      }
                    : { color: "hsl(40, 10%, 80%)" }
                }
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
