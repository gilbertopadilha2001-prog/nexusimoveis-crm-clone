# Page Topology — Nexus Imóveis CRM

## App Shell (shared across all routes)

### Sidebar (fixed, 255px wide, full height, z-index above content)
- Background: hsl(220, 25%, 10%) = rgb(19, 23, 32)
- Layout: flex-col, full height
- Contains: Logo header → Nav sections → Status footer
- Collapsible: Toggle button in app header

### Header (top bar, 56px height, white bg)
- Position: inside content panel, at top of each page
- Contains: Toggle button | Page breadcrumb title | "Sair" logout button
- Border-bottom: 1px solid hsl(40, 15%, 88%)

### Content Area (flex-grow, overflow-auto)
- Padding: 24px
- Background: hsl(40, 20%, 97%) (warm off-white)

## Sidebar Structure

```
Sidebar (255px, dark navy)
├── Logo row (p-4, flex items-center gap-3)
│   ├── Logo img (40x40px circle, white bg, dark ring)
│   └── Text block
│       ├── "Nexus Imóveis" (Space Grotesk, font-bold, 16px, sidebar-primary color)
│       └── "CRM WhatsApp · Curitiba" (Inter, 11px, sidebar-foreground/60)
├── Nav "Menu Principal" section
│   ├── Section label (text-xs uppercase tracking-wider, sidebar-foreground/50)
│   └── 12 nav items (each 32px h, 8px padding, rounded-[10px])
│       Active state: bg sidebar-accent, color sidebar-primary, font-weight 500
│       Inactive state: transparent bg, color sidebar-foreground, font-weight 400
│       Hover state: bg sidebar-accent/50
│       Each item: Lucide icon (h-4 w-4) + text label
├── Nav "Sistema" section  
│   └── 1 nav item: Configurações / Settings icon
└── Status footer (rounded-lg bg-sidebar-accent p-3, mx-2 mb-2)
    ├── "Conectado via Uazapi" (text-xs sidebar-foreground/70)
    └── "Online" badge (bg-success/20 text-success text-xs px-2 py-0.5 rounded-full)
```

## All Pages (route: title: description)

| Route | Title | Description |
|-------|-------|-------------|
| / | Dashboard | Visão geral do atendimento WhatsApp |
| /conversations | Conversas | WhatsApp em tempo real |
| /contacts | Contatos | Gerencie sua base de contatos WhatsApp |
| /broadcasts | Disparos em Massa | Campanhas de mensagens via WhatsApp |
| /followups | Follow-ups | Acompanhamentos agendados automaticamente |
| /crm | CRM Kanban | Gerencie seus leads pelo funil de vendas |
| /products | Catálogo de Imóveis | Imóveis disponíveis para venda e locação |
| /agents | Corretores | Gerencie sua equipe de corretores |
| /agents-dashboard | Desempenho dos Corretores | Métricas em tempo real de visitas e leads |
| /visits | Agendamento de Visitas | Schedule management |
| /auctions | Rastreio de Leilões | Imóveis da Caixa Econômica |
| /ai-summaries | Resumos IA | Resumos automáticos de atendimentos |
| /settings | Configurações | Configurações do sistema e integrações |

## Interaction Model
- All pages: static content (no scroll-driven animations, no parallax)
- Sidebar: toggle collapse/expand (click button in header)
- Nav items: click → navigate (Next.js Link)
- Active item highlighted based on current URL
- Empty states: most pages show empty with message (demo mode)
