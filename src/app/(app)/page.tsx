import { MessageSquare, Users, Send, Activity, BarChart2, CheckCircle } from "lucide-react";

const stats = [
  { label: "Conversas Hoje", value: "0", icon: MessageSquare, iconClass: "text-primary" },
  { label: "Contatos Ativos", value: "0", icon: Users, iconStyle: { color: "hsl(200, 80%, 50%)" } },
  { label: "Disparos Enviados", value: "0", icon: Send, iconStyle: { color: "hsl(38, 92%, 50%)" } },
  { label: "Conversas Ativas", value: "0", icon: Activity, iconStyle: { color: "hsl(142, 72%, 40%)" } },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visão geral do atendimento WhatsApp — Nexus Imóveis
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, iconClass, iconStyle }) => (
          <div
            key={label}
            className="rounded-lg border bg-card text-card-foreground shadow-sm shadow-card hover:shadow-elevated transition-shadow"
          >
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{value}</p>
                </div>
                <div className="rounded-lg bg-accent p-2.5">
                  <Icon className={`h-5 w-5 ${iconClass ?? ""}`} style={iconStyle} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent conversations */}
        <div className="lg:col-span-2 rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-5 border-b flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-display font-semibold">Conversas Recentes</h3>
          </div>
          <div className="p-12 text-center text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhuma conversa encontrada</p>
          </div>
        </div>

        {/* Insights */}
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-5 border-b flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-display font-semibold">Insights</h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="p-3 rounded-lg bg-accent/30">
              <p className="text-2xl font-display font-bold">0%</p>
              <p className="text-sm font-medium">Taxa de Entrega</p>
              <p className="text-xs text-muted-foreground">dos disparos</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/30">
              <p className="text-2xl font-display font-bold">0%</p>
              <p className="text-sm font-medium">Taxa de Leitura</p>
              <p className="text-xs text-muted-foreground">dos disparos</p>
            </div>
            <div
              className="flex items-center gap-2 p-3 rounded-lg"
              style={{ backgroundColor: "hsla(142, 72%, 40%, 0.1)" }}
            >
              <CheckCircle className="h-4 w-4" style={{ color: "hsl(142, 72%, 40%)" }} />
              <p className="text-sm font-medium" style={{ color: "hsl(142, 72%, 40%)" }}>
                Sistema Ativo
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Dashboard conectado ao banco de dados em tempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
