"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Send, Loader2, MessageSquare, Plus, RefreshCw, Smartphone, X, QrCode } from "lucide-react";

interface ConvSummary {
  id: string;
  phone: string;
  name: string | null;
  unread: number;
  lastMessage: string | null;
  lastAt: string | null;
  agent: { id: string; name: string } | null;
}

interface Message {
  id: string;
  text: string;
  sent: boolean;
  read: boolean;
  createdAt: string;
}

interface WAStatus {
  status: "connected" | "disconnected" | "scanning";
  phone: string | null;
  instanceName: string | null;
  userName: string | null;
  disconnectionCode?: number | null;
  disconnectionReason?: string | null;
}

function getDisconnectHelp(code?: number | null, reason?: string | null): string | null {
  if (!code && !reason) return null;
  if (code === 403) return "Conta bloqueada pelo WhatsApp por uso de API não-oficial. Aguarde 24-72h ou use outro número.";
  if (code === 401 && reason === "device_removed") return "Dispositivo removido. Escaneie o QR code novamente.";
  if (code === 401) return "Sessão encerrada. Escaneie o QR code para reconectar.";
  return "Conexão encerrada. Escaneie o QR code para reconectar.";
}

function initials(name: string | null, phone: string) {
  if (name) return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return phone.slice(-4);
}

function fmtTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function ConversationsPage() {
  const [convs, setConvs] = useState<ConvSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [search, setSearch] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WhatsApp status
  const [wa, setWa] = useState<WAStatus | null>(null);

  // QR Code modal
  const [showQR, setShowQR] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrCount, setQrCount] = useState(0);

  // Nova conversa modal
  const [showNew, setShowNew] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newText, setNewText] = useState("");
  const [sendingNew, setSendingNew] = useState(false);

  // Fetch WhatsApp status
  const fetchWAStatus = useCallback(async () => {
    const res = await fetch("/api/evolution/status").catch(() => null);
    if (res?.ok) setWa(await res.json());
  }, []);

  useEffect(() => {
    fetchWAStatus();
    const id = setInterval(fetchWAStatus, 15_000);
    return () => clearInterval(id);
  }, [fetchWAStatus]);

  // Auto-sync quando conectado
  useEffect(() => {
    if (wa?.status === "connected") syncConversations(true);
  }, [wa?.status]);

  // Polling QR
  useEffect(() => {
    if (!showQR || wa?.status !== "scanning") return;
    const id = setInterval(async () => {
      const res = await fetch("/api/evolution/qrcode", { method: "POST" }).catch(() => null);
      if (res?.ok) {
        const d = await res.json();
        if (d.qrcode) setQrCode(d.qrcode);
      }
      setQrCount((c) => c + 1);
      fetchWAStatus();
    }, 3000);
    return () => clearInterval(id);
  }, [showQR, wa?.status, fetchWAStatus]);

  // Fecha QR ao conectar
  useEffect(() => {
    if (wa?.status === "connected" && showQR) {
      setShowQR(false);
      setQrCode(null);
      fetchConvs();
    }
  }, [wa?.status, showQR]);

  const fetchConvs = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) setConvs(await res.json());
    setLoadingConvs(false);
  }, []);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);

  const syncConversations = async (silent = false) => {
    if (syncing) return;
    setSyncing(true);
    const res = await fetch("/api/evolution/sync", { method: "POST" }).catch(() => null);
    if (res?.ok) await fetchConvs();
    if (!silent) setSyncing(false);
    else setSyncing(false);
  };

  const selectConv = useCallback(async (id: string) => {
    setSelectedId(id);
    setLoadingMsgs(true);
    setMessages([]);
    const res = await fetch(`/api/conversations/${id}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
      setConvs((prev) => prev.map((c) => c.id === id ? { ...c, unread: 0 } : c));
    }
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedId || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    const optimistic: Message = { id: `tmp-${Date.now()}`, text, sent: true, read: false, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, optimistic]);
    const res = await fetch(`/api/conversations/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? data.message : m));
      setConvs((prev) => prev.map((c) => c.id === selectedId ? { ...c, lastMessage: text, lastAt: new Date().toISOString() } : c));
    }
    setSending(false);
  };

  const openQR = async () => {
    setQrLoading(true);
    setShowQR(true);
    setQrCode(null);
    const res = await fetch("/api/evolution/qrcode", { method: "POST" }).catch(() => null);
    if (res?.ok) {
      const d = await res.json();
      setQrCode(d.qrcode || null);
      fetchWAStatus();
    }
    setQrLoading(false);
  };

  const startNewConversation = async () => {
    if (!newPhone.trim() || !newText.trim()) return;
    setSendingNew(true);
    // Cria a conversa via POST na API de mensagens (vai criar a conversa se não existir)
    const phone = newPhone.replace(/\D/g, "");
    // Primeiro cria ou busca a conversa
    const convRes = await fetch("/api/conversations/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name: newName || phone, text: newText }),
    });
    if (convRes.ok) {
      const data = await convRes.json();
      await fetchConvs();
      setSelectedId(data.conversationId);
      const msgRes = await fetch(`/api/conversations/${data.conversationId}/messages`);
      if (msgRes.ok) setMessages((await msgRes.json()).messages || []);
    }
    setShowNew(false);
    setNewPhone(""); setNewName(""); setNewText("");
    setSendingNew(false);
  };

  const selectedConv = convs.find((c) => c.id === selectedId);
  const filtered = convs.filter(
    (c) => (c.name || "").toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const isConnected = wa?.status === "connected";
  const isScanning = wa?.status === "scanning";

  return (
    <div className="animate-fade-in -m-6 flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <div className="w-80 xl:w-96 border-r bg-card flex flex-col flex-shrink-0">

        {/* Header da sidebar */}
        <div className="p-3 border-b space-y-2">
          {/* Status WhatsApp + botões */}
          <div className="flex items-center gap-2">
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full flex-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                WhatsApp conectado
              </span>
            ) : isScanning ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full flex-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block animate-pulse" />
                Aguardando QR...
              </span>
            ) : (
              <button onClick={openQR}
                className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full flex-1 border border-dashed border-muted-foreground/40 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <QrCode className="h-3.5 w-3.5" />
                Conectar WhatsApp
              </button>
            )}
            <button onClick={() => syncConversations()} disabled={syncing} title="Sincronizar conversas"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors disabled:opacity-40">
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShowNew(true)} disabled={!isConnected} title="Nova conversa"
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors disabled:opacity-40">
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" placeholder="Buscar conversa..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto">
          {loadingConvs ? (
            <div className="flex items-center justify-center h-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <Smartphone className="h-10 w-10 mx-auto text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground">
                {!isConnected
                  ? "Conecte seu WhatsApp para ver as conversas"
                  : "Nenhuma conversa. Clique em sincronizar ou inicie uma nova."}
              </p>
              {!isConnected && (
                <button onClick={openQR}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  <QrCode className="h-4 w-4" /> Conectar WhatsApp
                </button>
              )}
              {isConnected && (
                <button onClick={() => syncConversations()} disabled={syncing}
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} /> Sincronizar
                </button>
              )}
            </div>
          ) : (
            filtered.map((conv) => (
              <button key={conv.id} onClick={() => selectConv(conv.id)}
                className={`w-full flex items-center gap-3 p-3 text-left hover:bg-muted/30 transition-colors border-b border-border/50 ${selectedId === conv.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                    {initials(conv.name, conv.phone)}
                  </div>
                  {conv.unread > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 text-[10px] font-bold text-white flex items-center justify-center">
                      {conv.unread}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${conv.unread > 0 ? "font-bold" : "font-medium"}`}>{conv.name || conv.phone}</p>
                    <span className="text-[11px] text-muted-foreground flex-shrink-0">{fmtTime(conv.lastAt)}</span>
                  </div>
                  <p className={`text-xs truncate ${conv.unread > 0 ? "text-foreground" : "text-muted-foreground"}`}>{conv.lastMessage || "Sem mensagens"}</p>
                  {conv.agent && <p className="text-[10px] mt-0.5" style={{ color: "var(--nexus-gold)" }}>{conv.agent.name}</p>}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      {!selectedId ? (
        <div className="flex-1 flex items-center justify-center bg-muted/10">
          <div className="text-center space-y-2">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">Selecione uma conversa</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-14 border-b bg-card px-4 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
              {selectedConv ? initials(selectedConv.name, selectedConv.phone) : "?"}
            </div>
            <div>
              <p className="text-sm font-semibold">{selectedConv?.name || selectedConv?.phone}</p>
              <p className="text-[11px] text-muted-foreground">
                {selectedConv?.phone}{selectedConv?.agent ? ` — ${selectedConv.agent.name}` : ""}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundColor: "#F0F2F5" }}>
            {loadingMsgs ? (
              <div className="flex items-center justify-center h-20"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground mt-8">Nenhuma mensagem ainda</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${msg.sent ? "bg-[#DCF8C6] rounded-br-md" : "bg-white rounded-bl-md"}`}>
                    <p>{msg.text}</p>
                    <span className="text-[10px] text-muted-foreground block text-right mt-0.5">
                      {new Date(msg.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t bg-card p-3 flex items-center gap-2 flex-shrink-0">
            <input type="text" placeholder={isConnected ? "Digite uma mensagem..." : "Conecte o WhatsApp para enviar"}
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              disabled={!isConnected}
              className="flex-1 h-10 px-4 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50" />
            <button onClick={sendMessage} disabled={sending || !input.trim() || !isConnected}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
              style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setShowQR(false); setQrCode(null); }}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-sm mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Conectar WhatsApp</h3>
              <button onClick={() => { setShowQR(false); setQrCode(null); }} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            {(() => {
              const helpMsg = getDisconnectHelp(wa.disconnectionCode, wa.disconnectionReason);
              return helpMsg ? (
                <div className="mb-4 rounded-lg px-3 py-2 text-xs text-center"
                  style={{ backgroundColor: wa.disconnectionCode === 403 ? "rgb(254 226 226)" : "rgb(254 249 195)", color: wa.disconnectionCode === 403 ? "rgb(185 28 28)" : "rgb(133 77 14)" }}>
                  {helpMsg}
                </div>
              ) : null;
            })()}
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Abra o WhatsApp → <strong>Dispositivos vinculados</strong> → Vincular dispositivo
            </p>
            <p className="text-xs text-muted-foreground mb-3 text-center bg-muted/40 rounded-lg px-3 py-2">
              ⚠️ Se aparecer &quot;Não é possível conectar novos dispositivos&quot;, remova um dispositivo antigo no seu celular antes de escanear.
            </p>
            <div className="flex items-center justify-center min-h-[220px]">
              {qrLoading || !qrCode ? (
                <div className="text-center space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">Gerando QR code...</p>
                </div>
              ) : (
                <img src={qrCode} alt="WhatsApp QR Code" className="w-52 h-52 rounded-xl" />
              )}
            </div>
            {isScanning && qrCode && (
              <p className="text-center text-xs text-muted-foreground mt-3">
                Atualizando a cada 3s... (tentativa {qrCount + 1})
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal Nova Conversa */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowNew(false)}>
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b">
              <h3 className="font-display font-bold text-lg">Nova Conversa</h3>
              <button onClick={() => setShowNew(false)} className="p-1 rounded-lg hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Número do WhatsApp *</label>
                <input className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="(41) 99999-0000" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Nome (opcional)</label>
                <input className="w-full h-10 px-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="Nome do contato" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Primeira mensagem *</label>
                <textarea className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  rows={3} placeholder="Olá! Tudo bem?" value={newText} onChange={(e) => setNewText(e.target.value)} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowNew(false)} className="flex-1 h-10 rounded-xl border text-sm font-medium hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={startNewConversation} disabled={sendingNew || !newPhone.trim() || !newText.trim()}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ backgroundColor: "var(--nexus-gold)", color: "var(--nexus-dark)" }}>
                  {sendingNew ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
