"use client";

import { useState, useRef } from "react";
import { Users, MessageSquare, Zap, Upload, Download, Plus, Search } from "lucide-react";

const btnOutline =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 transition-colors";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3 transition-colors";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // TODO: POST /functions/v1/import-contacts (multipart/form-data, field: file)
    e.target.value = "";
  };

  const handleExport = () => {
    // TODO: GET /functions/v1/export-contacts?format=csv — triggers file download
  };

  const handleQualifyAll = () => {
    // TODO: POST /functions/v1/qualify-contacts { contact_ids: ["all"] }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Contatos</h1>
          <p className="text-muted-foreground text-sm mt-1">Gerencie sua base de contatos WhatsApp</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className={btnOutline} onClick={handleQualifyAll}>
            <Zap className="h-4 w-4" />
            Qualificar Todos
          </button>
          <button className={btnOutline} onClick={handleImport}>
            <Upload className="h-4 w-4" />
            Importar
          </button>
          <button className={btnOutline} onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exportar
          </button>
          <button
            className={btnPrimary}
            onClick={() => {
              // TODO: open new-contact modal
            }}
          >
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Empty state */}
      <div className="rounded-lg border bg-card shadow-sm shadow-card">
        <div className="p-12 text-center text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-sm">
            {search ? `Nenhum contato encontrado para "${search}"` : "Nenhum contato cadastrado"}
          </p>
          <p className="text-xs mt-1">Adicione contatos ou importe de uma planilha</p>
        </div>
      </div>
    </div>
  );
}
