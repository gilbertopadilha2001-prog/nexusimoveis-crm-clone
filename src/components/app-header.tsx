"use client";

import { PanelLeft, LogOut } from "lucide-react";

interface AppHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AppHeader({ isCollapsed, onToggle }: AppHeaderProps) {
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

      <span className="font-medium text-sm text-foreground flex-1">
        Demo Nexus Imóveis
      </span>

      <button
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 h-8 rounded-md hover:bg-accent"
        aria-label="Sair"
      >
        <LogOut className="h-4 w-4" />
        <span>Sair</span>
      </button>
    </header>
  );
}
