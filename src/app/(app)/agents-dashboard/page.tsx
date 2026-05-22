import { UserCheck, CalendarCheck, TrendingUp, Target } from "lucide-react";

const stats = [
  {
    label: "Corretores Ativos",
    value: "0",
    icon: UserCheck,
    iconStyle: { color: "hsl(42, 92%, 50%)" },
  },
  {
    label: "Visitas Agendadas",
    value: "0",
    icon: CalendarCheck,
    iconStyle: { color: "rgb(59, 130, 246)" },
  },
  {
    label: "Visitas Realizadas",
    value: "0",
    icon: TrendingUp,
    iconStyle: { color: "rgb(34, 197, 94)" },
  },
  {
    label: "Taxa de Conversão",
    value: "0%",
    icon: Target,
    iconStyle: { color: "rgb(245, 158, 11)" },
  },
];

export default function AgentsDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Desempenho dos Corretores
        </h1>
        <p className="text-muted-foreground text-sm">Métricas em tempo real de visitas e leads</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, iconStyle }) => (
          <div key={label} className="rounded-lg border bg-card shadow-sm shadow-card">
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-display font-bold mt-1">{value}</p>
                </div>
                <div className="rounded-lg bg-accent p-2.5">
                  <Icon className="h-5 w-5" style={iconStyle} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 py-12 text-center text-muted-foreground">
          <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Cadastre corretores para ver as métricas</p>
        </div>
      </div>
    </div>
  );
}
