"use client";

import { useState } from "react";
import { Gavel, RefreshCw, Search } from "lucide-react";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors";

const states = ["PR", "SP", "RJ", "MG", "RS", "SC", "BA", "GO", "DF", "PE"];

export default function AuctionsPage() {
  const [estado, setEstado] = useState("PR");
  const [cidade, setCidade] = useState("");
  const [search, setSearch] = useState("");
  const [score, setScore] = useState("Todos");
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    // TODO: POST /functions/v1/sync-auctions { estado, cidade }
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Gavel className="h-7 w-7 text-primary" />
            Rastreio de Leilões
          </h1>
          <p className="text-muted-foreground mt-1">
            Imóveis da Caixa Econômica — leilões, licitações e venda direta
          </p>
        </div>
      </div>

      {/* Sync card */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 border-b">
          <h3 className="font-semibold text-base">Sincronizar lista oficial Caixa</h3>
        </div>
        <div className="p-6 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Estado (UF)</label>
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-ring"
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
            >
              {states.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1 flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground">
              Cidade (opcional, filtra na sincronização)
            </label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ex.: Curitiba"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
          </div>
          <button className={btnPrimary} onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Sincronizando..." : "Sincronizar Caixa"}
          </button>
        </div>
      </div>

      {/* Search/filter card */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="p-6 flex flex-wrap items-end gap-3">
          <div className="space-y-1 flex-1 min-w-[180px]">
            <label className="text-xs text-muted-foreground">Buscar por cidade</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm pl-9 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Filtrar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Score mínimo</label>
            <select
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm w-32 focus:outline-none focus:ring-2 focus:ring-ring"
              value={score}
              onChange={(e) => setScore(e.target.value)}
            >
              <option>Todos</option>
              <option>≥ 70</option>
              <option>≥ 80</option>
              <option>≥ 90</option>
            </select>
          </div>
        </div>
        <div className="px-6 pb-6">
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhum leilão encontrado. Sincronize para buscar imóveis da Caixa.
          </p>
        </div>
      </div>
    </div>
  );
}
