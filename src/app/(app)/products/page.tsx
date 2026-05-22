import { RefreshCw, Globe, House } from "lucide-react";

const btnOutline = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-2 transition-colors";
const btnPrimary = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 gap-2 transition-colors";

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Catálogo de Imóveis</h1>
          <p className="text-muted-foreground mt-1">
            Imóveis disponíveis para venda e locação — Nexus Imóveis
          </p>
        </div>
        <div className="flex gap-2">
          <button className={btnOutline}>
            <RefreshCw className="h-4 w-4" />
            Sincronizar Catálogo
          </button>
          <a
            href="https://nexusinovacoesimobiliarias.com.br/"
            target="_blank"
            rel="noopener noreferrer"
            className={btnPrimary}
          >
            <Globe className="h-4 w-4" />
            Ver Site
          </a>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-end">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Negócio</label>
          <select className="flex h-9 items-center rounded-md border border-input bg-background px-3 py-2 text-sm w-[130px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Todos</option>
            <option>Venda</option>
            <option>Locação</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Tipo</label>
          <select className="flex h-9 items-center rounded-md border border-input bg-background px-3 py-2 text-sm w-[150px] focus:outline-none focus:ring-2 focus:ring-ring">
            <option>Todos</option>
            <option>Casa</option>
            <option>Apartamento</option>
            <option>Terreno</option>
            <option>Comercial</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Buscar</label>
          <input
            className="flex h-9 rounded-md border border-input bg-background px-3 py-2 text-sm w-[200px] placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Cidade, bairro..."
          />
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-12 text-center text-muted-foreground">
          <House className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>Nenhum imóvel encontrado</p>
          <p className="text-sm mt-1">Sincronize o catálogo para importar imóveis</p>
        </div>
      </div>
    </div>
  );
}
