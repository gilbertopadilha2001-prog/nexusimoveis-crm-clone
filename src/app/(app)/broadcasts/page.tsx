"use client";

import { useState } from "react";
import { Plus, Send } from "lucide-react";

const btnPrimary =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors";

export default function BroadcastsPage() {
  const [audience, setAudience] = useState("");
  const [message, setMessage] = useState("");
  const [interval, setInterval] = useState("");
  const [sending, setSending] = useState(false);

  const handleQuickSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    // TODO: POST /functions/v1/quick-broadcast { audience_tag, message, interval_seconds }
    setTimeout(() => setSending(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight">Disparos em Massa</h1>
          <p className="text-muted-foreground text-sm mt-1">Campanhas de mensagens via WhatsApp</p>
        </div>
        <button
          className={btnPrimary}
          onClick={() => {
            // TODO: open new-campaign modal
          }}
        >
          <Plus className="h-4 w-4" />
          Nova Campanha
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 text-center">
            <p className="text-2xl font-display font-bold">0</p>
            <p className="text-xs text-muted-foreground">Total Enviados</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 text-center">
            <p className="text-2xl font-display font-bold" style={{ color: "hsl(142, 72%, 40%)" }}>0%</p>
            <p className="text-xs text-muted-foreground">Taxa de Entrega</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 text-center">
            <p className="text-2xl font-display font-bold" style={{ color: "hsl(200, 80%, 50%)" }}>0%</p>
            <p className="text-xs text-muted-foreground">Taxa de Leitura</p>
          </div>
        </div>
        <div className="rounded-lg border bg-card shadow-sm shadow-card">
          <div className="p-4 text-center">
            <p className="text-2xl font-display font-bold" style={{ color: "hsl(38, 92%, 50%)" }}>0</p>
            <p className="text-xs text-muted-foreground">Campanhas Ativas</p>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign list */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma campanha encontrada
          </p>
        </div>

        {/* Quick send panel */}
        <div className="rounded-lg border bg-card shadow-sm shadow-card h-fit">
          <div className="p-6 border-b">
            <h3 className="font-display font-semibold text-lg flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Disparo Rápido
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Audiência</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Ex: Residencial, Uberlândia"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Mensagem</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                placeholder="Digite sua mensagem..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Intervalo entre envios</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Ex: 5 segundos"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              />
            </div>
            <button
              className="w-full inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleQuickSend}
              disabled={!message.trim() || sending}
            >
              <Send className="h-4 w-4" />
              {sending ? "Enviando..." : "Iniciar Disparo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
