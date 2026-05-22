"use client";

import { Plus } from "lucide-react";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors";

const stats = [
  { label: "Total Pendentes", value: "0", color: undefined },
  { label: "Atrasados", value: "0", color: "hsl(0, 72%, 51%)" },
  { label: "Hoje", value: "0", color: "hsl(200, 80%, 50%)" },
  { label: "Concluídos (mês)", value: "0", color: "hsl(142, 72%, 40%)" },
];

export default function FollowupsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Follow-ups</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhamentos agendados automaticamente
          </p>
        </div>
        <button
          className={btnPrimary}
          onClick={() => {
            // TODO: open new-followup modal
            // POST /rest/v1/follow_ups { contact_id, mensagem, agendado_em, recorrente, intervalo_dias }
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Follow-up
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className="rounded-lg border bg-card shadow-sm shadow-card">
            <div className="p-4 text-center">
              <p className="text-2xl font-display font-bold" style={color ? { color } : undefined}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum follow-up encontrado
        </p>
      </div>
    </div>
  );
}
