import { Search, MessageSquare } from "lucide-react";

export default function ConversationsPage() {
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

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground flex-1">
            <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm">Nenhuma conversa encontrada</p>
          </div>
        </div>

        {/* Right panel: chat view */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 flex items-center justify-center bg-muted/10">
            <div className="text-center text-muted-foreground">
              <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                <MessageSquare className="h-10 w-10 opacity-40" />
              </div>
              <p className="text-lg font-medium">Nexus Chat</p>
              <p className="text-sm mt-1">Selecione uma conversa para começar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
