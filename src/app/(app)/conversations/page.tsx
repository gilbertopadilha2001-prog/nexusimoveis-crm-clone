"use client";

import { Search, MessageSquare, Send, Paperclip, Smile } from "lucide-react";
import { useState } from "react";

export default function ConversationsPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="animate-fade-in h-[calc(100vh-5rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-display font-bold tracking-tight">Conversas</h1>
        <p className="text-muted-foreground text-sm mt-0.5">WhatsApp em tempo real</p>
      </div>

      <div className="flex-1 flex gap-0 rounded-xl border bg-card overflow-hidden shadow-card min-h-0">
        {/* Left panel: conversation list */}
        <div className="flex flex-col border-r w-[340px] min-w-[280px]">
          {/* Search */}
          <div className="p-3 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="flex w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 pl-9 bg-background/80 h-9"
                placeholder="Buscar conversa..."
              />
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex border-b px-3 pt-2 gap-1">
            {["Todas", "Abertas", "Encerradas"].map((tab, i) => (
              <button
                key={tab}
                className={
                  i === 0
                    ? "px-3 py-1.5 text-xs font-medium rounded-t-md border-b-2 border-primary text-primary"
                    : "px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                }
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground flex-1">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma conversa encontrada</p>
          </div>
        </div>

        {/* Right panel: chat view */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Empty state — shown when no conversation is selected */}
          <div className="flex-1 flex items-center justify-center bg-muted/10">
            <div className="text-center text-muted-foreground">
              <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 opacity-40" />
              </div>
              <p className="text-lg font-medium">Nexus Chat</p>
              <p className="text-sm mt-1">Selecione uma conversa para começar</p>
            </div>
          </div>

          {/* Chat message input (always rendered at bottom) */}
          <div className="border-t bg-card p-3">
            <div className="flex items-end gap-2">
              <button
                className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Anexar arquivo"
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <button
                className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Emoji"
              >
                <Smile className="h-4 w-4" />
              </button>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // TODO: dispatch send-message API call
                    setMessage("");
                  }
                }}
                className="flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[36px] max-h-[120px] leading-5"
                placeholder="Digite uma mensagem... (Enter para enviar)"
                rows={1}
                style={{ height: "auto" }}
              />
              <button
                disabled={!message.trim()}
                className="flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                aria-label="Enviar mensagem"
                onClick={() => {
                  // TODO: dispatch send-message API call
                  setMessage("");
                }}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 ml-1">
              Shift+Enter para nova linha · Enter para enviar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
