import { Plus, UserRound } from "lucide-react";

const btnPrimary = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Corretores</h1>
          <p className="text-muted-foreground text-sm">Gerencie sua equipe de corretores</p>
        </div>
        <button className={btnPrimary}>
          <Plus className="h-4 w-4" />
          Novo Corretor
        </button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 py-12 text-center text-muted-foreground">
          <UserRound className="h-12 w-12 mx-auto mb-4 opacity-40" />
          <p>Nenhum corretor cadastrado</p>
        </div>
      </div>
    </div>
  );
}
