import { Users, MessageSquare, Zap, Upload, Download, Plus, Search } from "lucide-react";

const btnOutline = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 transition-colors";
const btnPrimary = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 transition-colors";

export default function ContactsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie sua base de contatos WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <button className={btnOutline}>
            <Zap className="h-4 w-4" />
            Qualificar Todos
          </button>
          <button className={btnOutline}>
            <Upload className="h-4 w-4" />
            Importar
          </button>
          <button className={btnOutline}>
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button className={btnPrimary}>
            <Plus className="h-4 w-4" />
            Novo Contato
          </button>
        </div>
      </div>

      {/* Mini stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2.5">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">0</p>
              <p className="text-xs text-muted-foreground">Total de Contatos</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2.5">
              <MessageSquare className="h-5 w-5" style={{ color: "hsl(200, 80%, 50%)" }} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">0</p>
              <p className="text-xs text-muted-foreground">Conversas Abertas</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 flex items-center gap-3">
            <div className="rounded-lg bg-accent p-2.5">
              <Zap className="h-5 w-5" style={{ color: "hsl(38, 92%, 50%)" }} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">0</p>
              <p className="text-xs text-muted-foreground">Qualificados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Buscar contato..."
          />
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-lg border bg-card shadow-sm shadow-card">
        <div className="p-12 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">Nenhum contato cadastrado</p>
          <p className="text-xs mt-1">Adicione contatos ou importe de uma planilha</p>
        </div>
      </div>
    </div>
  );
}
