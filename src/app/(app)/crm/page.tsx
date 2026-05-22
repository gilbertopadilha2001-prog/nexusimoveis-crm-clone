import { UserCheck } from "lucide-react";

const btnPrimary = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 transition-colors";

const columns = [
  { name: "Novo Lead", color: "rgb(59, 130, 246)" },
  { name: "Qualificando", color: "rgb(245, 158, 11)" },
  { name: "Proposta Enviada", color: "rgb(168, 85, 247)" },
  { name: "Negociando", color: "rgb(249, 115, 22)" },
  { name: "Fechado", color: "rgb(34, 197, 94)" },
  { name: "Perdido", color: "rgb(239, 68, 68)" },
];

export default function CrmPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">CRM Kanban</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus leads pelo funil de vendas de imóveis
          </p>
        </div>
        <button className={btnPrimary}>
          <UserCheck className="h-4 w-4" />
          Distribuir Leads
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(({ name, color }) => (
          <div key={name} className="flex-shrink-0 w-72">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <h3 className="text-sm font-semibold text-foreground">{name}</h3>
              <span className="ml-auto inline-flex items-center rounded-full border border-transparent bg-secondary text-secondary-foreground text-xs px-2.5 py-0.5 font-semibold">
                0
              </span>
            </div>

            {/* Column body */}
            <div className="h-[calc(100vh-220px)] overflow-y-auto">
              <div className="space-y-2 pr-2">
                <div className="rounded-lg border-2 border-dashed border-border p-6 text-center">
                  <p className="text-xs text-muted-foreground">Nenhum lead</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
