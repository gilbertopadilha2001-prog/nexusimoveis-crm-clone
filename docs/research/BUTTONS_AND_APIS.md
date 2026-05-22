# Buttons & API Connections — Nexus Imóveis CRM

> **Purpose:** Full mapping of every interactive element across all 13 pages.
> Each entry shows: label, route/page, intended action, API endpoint, HTTP method,
> request payload shape, and expected response. Use this to wire up a real backend.
>
> **Backend stack (from live site):**
> - Supabase project: `kmbecvzxxpppmmyhokah` → `https://kmbecvzxxpppmmyhokah.supabase.co`
> - WhatsApp gateway: Uazapi
> - Webhook entry point: `https://kmbecvzxxpppmmyhokah.supabase.co/functions/v1/uazapi-webhook`

---

## 1 — Global Header (`AppHeader`)

| Button | Action | Endpoint / Route |
|--------|--------|-----------------|
| `PanelLeft` (toggle) | Collapses/expands sidebar | Client-side state only |
| **Sair** (LogOut) | Logs out current session | `POST /auth/v1/logout` (Supabase Auth) |

---

## 2 — Global Sidebar (`AppSidebar`)

| Nav Item | Route | Description |
|----------|-------|-------------|
| Dashboard | `/` | Overview stats |
| Conversas | `/conversations` | WhatsApp chat list |
| Contatos | `/contacts` | Contact database |
| Disparos | `/broadcasts` | Mass messaging campaigns |
| Follow-ups | `/followups` | Scheduled follow-ups |
| CRM Kanban | `/crm` | Sales funnel kanban |
| Catálogo | `/products` | Property listings |
| Corretores | `/agents` | Agent management |
| Desempenho | `/agents-dashboard` | Agent performance metrics |
| Agendamento | `/visits` | Visit scheduling |
| Leilões Caixa | `/auctions` | Caixa property auctions |
| Resumos IA | `/ai-summaries` | AI-generated summaries |
| Configurações | `/settings` | System settings |

All items are Next.js `<Link>` elements — client-side navigation, no API calls.

---

## 3 — Dashboard (`/`)

No action buttons. All data is read-only stat cards fetched on mount.

### Data endpoints needed
```
GET /rest/v1/conversations?select=count   → Conversas Hoje
GET /rest/v1/contacts?select=count        → Contatos Ativos
GET /rest/v1/broadcasts?select=count      → Disparos Enviados
GET /rest/v1/conversations?status=active  → Conversas Ativas
GET /rest/v1/broadcasts?select=delivery_rate,read_rate → Insights
```

---

## 4 — Conversas (`/conversations`)

### Search input
- **Action:** Filter conversation list client-side (or server-side query)
- **Endpoint:** `GET /rest/v1/conversations?contact_name=ilike.*{query}*`

### Conversation list item (click)
- **Action:** Opens that conversation in the right panel
- **Endpoint:** `GET /rest/v1/messages?conversation_id=eq.{id}&order=created_at.asc`

### Chat message input (bottom of right panel)
- **Send button / Enter key**
- **Endpoint:** `POST /functions/v1/send-message`
- **Method:** POST
- **Body:**
  ```json
  {
    "conversation_id": "uuid",
    "contact_phone": "+5541999999999",
    "message": "texto aqui",
    "instance_id": "uazapi_instance_id"
  }
  ```
- **Uazapi passthrough:** `POST https://api.uazapi.com/v1/message/sendText`
  ```json
  {
    "phone": "+5541999999999",
    "message": "texto aqui"
  }
  ```
- **Expected response:** `{ "message_id": "uuid", "status": "sent" }`

---

## 5 — Contatos (`/contacts`)

### Qualificar Todos
- **Action:** Runs AI qualification on all unqualified contacts
- **Endpoint:** `POST /functions/v1/qualify-contacts`
- **Body:** `{ "contact_ids": ["all"] }`
- **Expected response:** `{ "qualified": 42, "failed": 0 }`

### Importar
- **Action:** Opens file picker, accepts CSV/XLSX, uploads contacts
- **Endpoint:** `POST /functions/v1/import-contacts`
- **Content-Type:** `multipart/form-data`
- **Body:** `file` field with CSV/XLSX
- **CSV columns expected:**
  ```
  nome, telefone, email, cidade, bairro, interesse (venda|locação), observacoes
  ```
- **Expected response:** `{ "imported": 150, "skipped": 3, "errors": [] }`

### Exportar
- **Action:** Downloads contacts as CSV
- **Endpoint:** `GET /functions/v1/export-contacts?format=csv`
- **Expected response:** CSV file download (`Content-Disposition: attachment`)

### Novo Contato
- **Action:** Opens modal/drawer with contact creation form
- **Form fields:**
  ```
  nome*         string
  telefone*     string (WhatsApp, with country code)
  email         string
  cidade        string
  bairro        string
  interesse     enum: venda | locação | ambos
  observacoes   text
  corretor_id   uuid (assign to agent)
  ```
- **Endpoint:** `POST /rest/v1/contacts`
- **Body:** form fields as JSON
- **Expected response:** `{ "id": "uuid", "nome": "...", ... }`

### Contact row action buttons (when contacts exist)
- **Enviar mensagem** → opens conversation in `/conversations`
- **Qualificar** → `POST /functions/v1/qualify-contacts` with `{ "contact_ids": [id] }`
- **Editar** → opens edit modal with same form as Novo Contato
- **Excluir** → `DELETE /rest/v1/contacts?id=eq.{id}` (requires confirmation dialog)

### Search input
- **Action:** Filter by name/phone/email
- **Endpoint:** `GET /rest/v1/contacts?or=(nome.ilike.*{q}*,telefone.ilike.*{q}*,email.ilike.*{q}*)`

---

## 6 — Disparos em Massa (`/broadcasts`)

### Nova Campanha
- **Action:** Opens campaign creation modal/drawer
- **Form fields:**
  ```
  nome*         string (campaign name)
  audiencia*    string (tag or segment)
  mensagem*     text
  agendado_em   datetime (optional, for scheduling)
  intervalo_ms  number (delay between sends in ms)
  ```
- **Endpoint:** `POST /rest/v1/broadcasts`
- **Expected response:** `{ "id": "uuid", "status": "pending" }`

### Iniciar Disparo (Quick Send panel)
- **Action:** Sends a quick one-off mass message
- **Form fields (visible in UI):**
  ```
  audiencia     string   (label: "Audiência", placeholder: "Ex: Residencial, Uberlândia")
  mensagem*     text     (label: "Mensagem")
  intervalo     string   (label: "Intervalo entre envios", placeholder: "Ex: 5 segundos")
  ```
- **Endpoint:** `POST /functions/v1/quick-broadcast`
- **Body:**
  ```json
  {
    "audience_tag": "Residencial, Uberlândia",
    "message": "texto da mensagem",
    "interval_seconds": 5
  }
  ```
- **Uazapi passthrough:** iterates contacts matching tag → `POST /message/sendText` for each
- **Expected response:** `{ "queued": 87, "broadcast_id": "uuid" }`

### Campaign row action buttons (when campaigns exist)
- **Pausar/Retomar** → `PATCH /rest/v1/broadcasts?id=eq.{id}` `{ "status": "paused" | "running" }`
- **Ver Relatório** → navigates to `/broadcasts/{id}`
- **Excluir** → `DELETE /rest/v1/broadcasts?id=eq.{id}`

---

## 7 — Follow-ups (`/followups`)

### Novo Follow-up
- **Action:** Opens modal with follow-up creation form
- **Form fields:**
  ```
  contact_id*   uuid     (contact selector/search)
  mensagem*     text
  agendado_em*  datetime (when to send)
  recorrente    boolean  (repeating follow-up)
  intervalo_dias number  (if recorrente = true)
  ```
- **Endpoint:** `POST /rest/v1/follow_ups`
- **Body:** form fields as JSON
- **Expected response:** `{ "id": "uuid", "status": "scheduled" }`

### Follow-up row actions (when records exist)
- **Executar agora** → `POST /functions/v1/execute-followup` `{ "follow_up_id": "uuid" }`
- **Editar** → opens edit modal
- **Excluir** → `DELETE /rest/v1/follow_ups?id=eq.{id}`

---

## 8 — CRM Kanban (`/crm`)

### Distribuir Leads
- **Action:** Auto-assigns unassigned leads round-robin across active agents
- **Endpoint:** `POST /functions/v1/distribute-leads`
- **Body:** `{}` (uses all active agents)
- **Expected response:** `{ "distributed": 12, "agents": ["uuid1", "uuid2"] }`

### Kanban card drag-and-drop (when leads exist)
- **Action:** Move lead to different stage
- **Endpoint:** `PATCH /rest/v1/crm_leads?id=eq.{id}`
- **Body:** `{ "stage": "qualificando" | "proposta_enviada" | "negociando" | "fechado" | "perdido" }`

### "Adicionar lead" button per column (not yet implemented in clone)
- **Endpoint:** `POST /rest/v1/crm_leads`
- **Body:**
  ```json
  {
    "contact_id": "uuid",
    "stage": "novo_lead",
    "agent_id": "uuid",
    "property_interest": "string",
    "valor_estimado": 450000
  }
  ```

---

## 9 — Catálogo de Imóveis (`/products`)

### Sincronizar Catálogo
- **Action:** Imports properties from the imobiliária website API
- **Endpoint:** `POST /functions/v1/sync-catalog`
- **Body:** `{}` (pulls from configured source)
- **Expected response:** `{ "synced": 47, "new": 12, "updated": 35 }`

### Ver Site
- **Action:** Opens external website in new tab
- **URL:** `https://nexusinovacoesimobiliarias.com.br/`
- **Type:** `<a target="_blank">` — no API call

### Filter controls (Negócio / Tipo / Buscar)
- **Action:** Filter product list client-side or via query params
- **Endpoint:** `GET /rest/v1/properties?negocio=eq.{negocio}&tipo=eq.{tipo}&or=(cidade.ilike.*{q}*,bairro.ilike.*{q}*)`

### Property card actions (when properties exist)
- **Enviar por WhatsApp** → opens conversation and pre-fills message with property link
- **Ver Detalhes** → navigates to `/products/{id}`
- **Editar** → `PATCH /rest/v1/properties?id=eq.{id}`

---

## 10 — Corretores (`/agents`)

### Novo Corretor
- **Action:** Opens agent creation modal
- **Form fields:**
  ```
  nome*         string
  telefone*     string (WhatsApp)
  email*        string
  creci         string (broker registration number)
  foto          file   (avatar)
  ativo         boolean (default: true)
  ```
- **Endpoint:** `POST /rest/v1/agents`
- **Body:** form fields as JSON (foto uploaded separately to Supabase Storage)
- **Expected response:** `{ "id": "uuid", "nome": "...", ... }`

### Agent card actions (when agents exist)
- **Editar** → `PATCH /rest/v1/agents?id=eq.{id}`
- **Desativar/Ativar** → `PATCH /rest/v1/agents?id=eq.{id}` `{ "ativo": false | true }`
- **Ver Desempenho** → navigates to `/agents-dashboard?agent_id={id}`

---

## 11 — Desempenho dos Corretores (`/agents-dashboard`)

No action buttons — read-only metrics dashboard.

### Data endpoints needed
```
GET /rest/v1/agents?ativo=eq.true&select=count           → Corretores Ativos
GET /rest/v1/visits?status=eq.scheduled&select=count     → Visitas Agendadas
GET /rest/v1/visits?status=eq.completed&select=count     → Visitas Realizadas
GET /rest/v1/crm_leads?stage=eq.fechado&select=count     → Taxa de Conversão (calc)
```

---

## 12 — Agendamento de Visitas (`/visits`)

### Nova Visita
- **Action:** Opens visit creation modal
- **Form fields:**
  ```
  contact_id*   uuid     (contact selector)
  property_id*  uuid     (property selector)
  agent_id*     uuid     (agent selector)
  data_hora*    datetime
  observacoes   text
  ```
- **Endpoint:** `POST /rest/v1/visits`
- **Expected response:** `{ "id": "uuid", "status": "scheduled" }`
- **Side effect:** sends WhatsApp confirmation to contact via Uazapi

### Status filter pills
- **Todas / Agendada / Confirmada / Realizada / Cancelada / Reagendada**
- **Action:** Filter visit list by status (client-side or query param)
- **Endpoint:** `GET /rest/v1/visits?status=eq.{status}`

### Visit card actions (when visits exist)
- **Confirmar** → `PATCH /rest/v1/visits?id=eq.{id}` `{ "status": "confirmed" }`
- **Reagendar** → opens modal with datetime picker, `PATCH` same endpoint
- **Cancelar** → `PATCH /rest/v1/visits?id=eq.{id}` `{ "status": "cancelled" }`
- **Marcar Realizada** → `PATCH /rest/v1/visits?id=eq.{id}` `{ "status": "completed" }` + triggers AI summary

---

## 13 — Leilões Caixa (`/auctions`)

### Sincronizar Caixa
- **Action:** Fetches auction properties from Caixa Econômica Federal for the selected UF/city
- **Form fields (visible in UI):**
  ```
  estado*   select: PR | SP | RJ | MG | RS | SC | BA | GO | DF | PE
  cidade    string (optional filter)
  ```
- **Endpoint:** `POST /functions/v1/sync-auctions`
- **Body:**
  ```json
  {
    "estado": "PR",
    "cidade": "Curitiba"
  }
  ```
- **What it does:** scrapes/calls `https://venda-imoveis.caixa.gov.br/` for the given UF
- **Expected response:** `{ "synced": 234, "new": 56 }`

### Score filter + Search filter
- **Action:** Filter auction list
- **Endpoint:** `GET /rest/v1/auctions?score=gte.{min_score}&cidade=ilike.*{q}*`

### Auction card actions (when auctions exist)
- **Ver no Site Caixa** → opens `https://venda-imoveis.caixa.gov.br/...` in new tab
- **Adicionar ao CRM** → `POST /rest/v1/crm_leads` with property pre-filled
- **Favoritar** → `POST /rest/v1/auction_favorites` `{ "auction_id": "uuid" }`

---

## 14 — Resumos IA (`/ai-summaries`)

No action buttons — read-only list of AI-generated summaries.

### Data endpoints needed
```
GET /rest/v1/ai_summaries?order=created_at.desc         → list
GET /rest/v1/ai_summaries?select=count&period=month     → Resumos Gerados (mês)
GET /rest/v1/ai_summaries?select=avg(confidence)        → Confiança Média
```

### Summary row actions (when summaries exist)
- **Ver Detalhes** → expands/modal with full summary text
- **Copiar** → copies summary to clipboard

---

## 15 — Configurações (`/settings`)

### Testar Conexão (Uazapi)
- **Action:** Validates the Uazapi API URL + token
- **Endpoint:** `POST /functions/v1/test-uazapi-connection`
- **Body:**
  ```json
  {
    "api_url": "https://api.uazapi.com/v1",
    "token": "TOKEN_VALUE"
  }
  ```
- **Expected response:** `{ "ok": true, "instance_name": "nexusimoveis", "status": "connected" }`
- **On success:** shows green "Conectado" toast
- **On failure:** shows red "Falha na conexão" toast

### Salvar (API URL + Token fields)
- **Action:** Persists Uazapi configuration (not yet a visible button — implied save)
- **Endpoint:** `PATCH /rest/v1/settings?id=eq.1` *(or Supabase Edge Function)*
- **Body:**
  ```json
  {
    "uazapi_url": "https://api.uazapi.com/v1",
    "uazapi_token": "TOKEN_VALUE"
  }
  ```

### Sincronizar Grupos
- **Action:** Fetches WhatsApp groups from Uazapi instance
- **Endpoint:** `POST /functions/v1/sync-whatsapp-groups`
- **Body:** `{}` (uses stored Uazapi credentials)
- **Expected response:**
  ```json
  {
    "groups": [
      { "id": "55419999@g.us", "name": "Equipe Nexus", "participants": 8 }
    ]
  }
  ```

---

## Supabase Edge Functions Summary

All custom logic lives in Edge Functions (deployed at `kmbecvzxxpppmmyhokah.supabase.co/functions/v1/`):

| Function | Trigger | Description |
|----------|---------|-------------|
| `uazapi-webhook` | Uazapi POST | Receives incoming WhatsApp messages |
| `send-message` | Client | Sends a WhatsApp message via Uazapi |
| `qualify-contacts` | Client | AI-qualifies contact intent |
| `import-contacts` | Client | Processes CSV/XLSX upload |
| `export-contacts` | Client | Generates CSV download |
| `quick-broadcast` | Client | Queues a quick mass send |
| `distribute-leads` | Client | Round-robin lead assignment |
| `sync-catalog` | Client | Imports properties from website |
| `sync-auctions` | Client | Scrapes Caixa auctions |
| `sync-whatsapp-groups` | Client | Fetches WA groups from Uazapi |
| `test-uazapi-connection` | Client | Validates Uazapi credentials |
| `execute-followup` | Client + Cron | Sends a scheduled follow-up |

---

## Supabase Table Schema (inferred)

```sql
-- Core tables
contacts      (id, nome, telefone, email, cidade, bairro, interesse, observacoes, corretor_id, qualificado, created_at)
conversations (id, contact_id, instance_id, status, last_message, last_message_at, unread_count, created_at)
messages      (id, conversation_id, content, direction, status, sent_at)
broadcasts    (id, nome, audiencia, mensagem, intervalo_ms, status, total_sent, delivered, read, created_at)
follow_ups    (id, contact_id, mensagem, agendado_em, recorrente, intervalo_dias, status, created_at)
crm_leads     (id, contact_id, agent_id, stage, property_interest, valor_estimado, created_at)
properties    (id, titulo, tipo, negocio, cidade, bairro, preco, area, quartos, foto_url, site_url, created_at)
agents        (id, nome, telefone, email, creci, foto_url, ativo, created_at)
visits        (id, contact_id, property_id, agent_id, data_hora, status, observacoes, created_at)
auctions      (id, endereco, cidade, estado, preco, preco_avaliacao, tipo, modalidade, score, caixa_url, created_at)
ai_summaries  (id, conversation_id, content, confidence, created_at)
settings      (id, uazapi_url, uazapi_token, webhook_url)
```

---

## Auth Flow

The site uses Supabase Auth with email/password:
- **Login:** `POST /auth/v1/token?grant_type=password`
  ```json
  { "email": "demo@nexusimoveis.com.br", "password": "NexusDemo2026!" }
  ```
- **Logout:** `POST /auth/v1/logout`
- **Session:** stored in `localStorage` as `supabase.auth.token`
- The demo account auto-logs in (the site detects no session and logs in automatically)

---

## Notes for Implementation

1. **All Supabase REST calls** need `Authorization: Bearer {supabase_anon_key}` and `apikey: {supabase_anon_key}` headers
2. **Edge Functions** need `Authorization: Bearer {user_jwt}` (from the authenticated session)
3. **Uazapi calls** are always server-side (Edge Functions) — never expose the Uazapi token to the browser
4. **Row-Level Security (RLS)** in Supabase scopes all data to the authenticated tenant/account
5. **Real-time subscriptions** for conversations and messages should use `supabase.channel()` with Postgres Changes
