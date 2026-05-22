"use client";

import { useState } from "react";
import { Webhook, Users, RefreshCw, Save, CheckCircle, XCircle } from "lucide-react";

const btnOutline =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-colors";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors";

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");

  const handleTestConnection = async () => {
    setTestStatus("testing");
    // TODO: POST /functions/v1/test-uazapi-connection { api_url, token }
    setTimeout(() => setTestStatus("ok"), 1500);
  };

  const handleSave = () => {
    // TODO: PATCH /rest/v1/settings?id=eq.1 { uazapi_url, uazapi_token }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configurações do sistema e integrações
        </p>
      </div>

      {/* API Uazapi */}
      <div className="rounded-lg border bg-card shadow-sm shadow-card">
        <div className="p-6 border-b">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Webhook className="h-5 w-5 text-primary" />
            API Uazapi
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {/* Status row */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">Status da Conexão</p>
              <p className="text-xs text-muted-foreground">
                {testStatus === "ok"
                  ? "Conectado via Uazapi"
                  : testStatus === "error"
                  ? "Falha na conexão"
                  : "Não testado"}
              </p>
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
              style={{
                backgroundColor:
                  testStatus === "ok"
                    ? "hsl(142, 72%, 40%)"
                    : testStatus === "error"
                    ? "hsl(0, 72%, 51%)"
                    : "hsl(220, 10%, 46%)",
              }}
            >
              {testStatus === "ok" && <CheckCircle className="h-3 w-3" />}
              {testStatus === "error" && <XCircle className="h-3 w-3" />}
              {testStatus === "ok"
                ? "Configurado"
                : testStatus === "error"
                ? "Erro"
                : "Pendente"}
            </span>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">URL da API</label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://api.uazapi.com/v1"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">Token de Acesso</label>
            <input
              type="password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••••••••••"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
            />
          </div>

          <div className="p-3 rounded-lg bg-accent/50 border border-border">
            <p className="text-xs font-medium mb-1">URL do Webhook (configure na Uazapi):</p>
            <code className="text-xs text-primary break-all select-all">
              https://kmbecvzxxpppmmyhokah.supabase.co/functions/v1/uazapi-webhook
            </code>
          </div>

          <div className="flex gap-3">
            <button
              className={btnOutline}
              onClick={handleTestConnection}
              disabled={testStatus === "testing"}
            >
              {testStatus === "testing" ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Webhook className="h-4 w-4" />
              )}
              {testStatus === "testing" ? "Testando..." : "Testar Conexão"}
            </button>
            <button className={btnPrimary} onClick={handleSave}>
              <Save className="h-4 w-4" />
              Salvar
            </button>
          </div>
        </div>
      </div>

      {/* Grupos de Resumo */}
      <div className="rounded-lg border bg-card shadow-sm shadow-card">
        <div className="p-6 border-b">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Grupos de Resumo
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Selecione os grupos do WhatsApp que receberão o resumo ao encerrar um atendimento.
          </p>
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full transition-colors"
            onClick={() => {
              // TODO: POST /functions/v1/sync-whatsapp-groups
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Sincronizar Grupos
          </button>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum grupo configurado
          </p>
        </div>
      </div>
    </div>
  );
}
