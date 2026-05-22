import { BrainCircuit, Star, Clock } from "lucide-react";

export default function AiSummariesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Resumos IA</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Resumos automáticos de atendimentos gerados por IA
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Resumos Gerados */}
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 flex items-center gap-3">
            <div
              className="rounded-lg p-2.5 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, hsl(42, 92%, 50%), hsl(38, 85%, 55%))",
              }}
            >
              <BrainCircuit className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">0</p>
              <p className="text-xs text-muted-foreground">Resumos Gerados (mês)</p>
            </div>
          </div>
        </div>

        {/* Card 2: Confiança Média */}
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 flex items-center gap-3">
            <div
              className="rounded-lg p-2.5 flex-shrink-0"
              style={{ backgroundColor: "hsla(142, 72%, 40%, 0.1)" }}
            >
              <Star className="h-5 w-5" style={{ color: "hsl(142, 72%, 40%)" }} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">0/5</p>
              <p className="text-xs text-muted-foreground">Confiança Média</p>
            </div>
          </div>
        </div>

        {/* Card 3: Total de Resumos */}
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 flex items-center gap-3">
            <div
              className="rounded-lg p-2.5 flex-shrink-0"
              style={{ backgroundColor: "hsla(200, 80%, 50%, 0.1)" }}
            >
              <Clock className="h-5 w-5" style={{ color: "hsl(200, 80%, 50%)" }} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total de Resumos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum resumo encontrado
        </p>
      </div>
    </div>
  );
}
