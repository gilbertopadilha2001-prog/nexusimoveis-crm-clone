"use client";

import { useState } from "react";
import { Plus, CalendarCheck } from "lucide-react";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors";

const filters = ["Todas", "Agendada", "Confirmada", "Realizada", "Cancelada", "Reagendada"];

export default function VisitsPage() {
  const [activeFilter, setActiveFilter] = useState("Todas");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Agendamento de Visitas
          </h1>
          <p className="text-muted-foreground text-sm">0 visitas no total</p>
        </div>
        <button
          className={btnPrimary}
          onClick={() => {
            // TODO: open new-visit modal
          }}
        >
          <Plus className="h-4 w-4" />
          Nova Visita
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={
              activeFilter === f
                ? "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 transition-colors"
                : "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 transition-colors"
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Empty state */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-12 text-center text-muted-foreground">
          <CalendarCheck className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Nenhuma visita agendada</p>
          {activeFilter !== "Todas" && (
            <p className="text-xs mt-1">
              Nenhuma visita com status &quot;{activeFilter}&quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
