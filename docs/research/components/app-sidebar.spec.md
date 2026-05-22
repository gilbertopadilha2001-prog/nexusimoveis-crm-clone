# AppSidebar Specification

## Overview
- **Target file:** `src/components/app-sidebar.tsx`
- **Interaction model:** click-driven (nav links + collapse toggle)

## Exact Dimensions
- Width: 255px (expanded), ~56px (collapsed icon-only)
- Height: 100vh (full screen height)
- Background: hsl(220, 25%, 10%) = rgb(19, 23, 32)

## DOM Structure
```
aside.sidebar
├── div.sidebar-logo (p-4, flex items-center gap-3, border-b border-sidebar-border)
│   ├── div.logo-avatar (w-10 h-10 rounded-full overflow-hidden bg-white ring-1 ring-sidebar-border flex items-center justify-center flex-shrink-0)
│   │   └── img src="/images/nexus-logo.avif" (w-9 h-9 rounded-full)
│   └── div.logo-text (flex flex-col, hidden when collapsed)
│       ├── span "Nexus Imóveis" (font-display font-bold text-sm text-sidebar-primary)
│       └── span "CRM WhatsApp · Curitiba" (text-[11px] text-sidebar-foreground/60)
├── nav.sidebar-nav (flex-1 overflow-y-auto p-2 space-y-4)
│   ├── section "Menu Principal"
│   │   ├── p.section-label (text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50 px-2 mb-1 hidden when collapsed)
│   │   └── ul (space-y-0.5)
│   │       └── 12 × NavItem (see below)
│   └── section "Sistema"
│       ├── p.section-label (same as above)
│       └── ul → 1 × NavItem (Configurações)
└── div.sidebar-footer (p-2)
    └── div (rounded-lg bg-sidebar-accent p-3)
        ├── p "Conectado via Uazapi" (text-xs text-sidebar-foreground/70)
        └── span "Online" (inline-flex items-center text-xs font-medium bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full)

NavItem structure:
  Link (href, display:flex, items-center, gap-2, p-2, rounded-[10px], w-full, transition-colors, text-sm)
  - Active:   bg-sidebar-accent   color: hsl(42 70% 65%) = rgb(228,191,103)  font-weight:500
  - Inactive: bg-transparent      color: hsl(40 10% 80%) = rgb(209,206,199)  font-weight:400
  - Hover:    bg-sidebar-accent/60
  Contains: LucideIcon (h-4 w-4, flex-shrink-0) + span (label text, hidden when collapsed)
```

## Nav Items (in order)

### Menu Principal
1. href="/"           label="Dashboard"       icon=LayoutDashboard
2. href="/conversations"  label="Conversas"   icon=MessageSquare
3. href="/contacts"   label="Contatos"        icon=Users
4. href="/broadcasts" label="Disparos"        icon=Send
5. href="/followups"  label="Follow-ups"      icon=RotateCcw
6. href="/crm"        label="CRM Kanban"      icon=Kanban
7. href="/products"   label="Catálogo"        icon=House
8. href="/agents"     label="Corretores"      icon=UserCheck
9. href="/agents-dashboard" label="Desempenho" icon=TrendingUp
10. href="/visits"    label="Agendamento"     icon=CalendarCheck
11. href="/auctions"  label="Leilões Caixa"   icon=Gavel
12. href="/ai-summaries" label="Resumos IA"   icon=BrainCircuit

### Sistema
13. href="/settings"  label="Configurações"   icon=Settings

## Responsive
- Desktop (>= 768px): always visible, 255px wide
- Mobile (< 768px): hidden by default, overlay drawer when open
- Collapsed state: icon-only, ~56px wide, labels hidden, logo text hidden

## Implementation Notes
- Use Next.js `usePathname()` to determine active item
- Sidebar collapse state: useState, toggle via button in AppHeader
- Pass `isCollapsed` + `onToggle` props from parent layout
- Logo image: `/images/nexus-logo.avif` (download from https://nexusimoveis.life/assets/nexus-logo-ZAeI-A3h.avif)
