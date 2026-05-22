# Dashboard Nexus CRM — Requisitos do Projeto

## Sobre o Negocio
- **Empresa:** Nexus Inovacoes Imobiliarias
- **Site principal:** https://nexusinovacoesimobiliarias.com.br/
- **Foco:** Venda de imoveis (somente venda, sem locacao)
- **Usuarios:** 10 pessoas (1 admin master + 9 corretores)

## Paginas do site principal
- https://nexusinovacoesimobiliarias.com.br/
- https://nexusinovacoesimobiliarias.com.br/imoveis
- https://nexusinovacoesimobiliarias.com.br/minha-casa-minha-vida
- https://nexusinovacoesimobiliarias.com.br/sobre
- https://nexusinovacoesimobiliarias.com.br/contato

## Infraestrutura existente (VPS Hostinger)
- Docker (ja rodando)
- Evolution API (ja rodando - conexao WhatsApp)
- n8n (ja rodando - automacoes/workflows)
- WhatsApp Business conectado via Evolution API

## Acesso e Permissoes
- **Admin (master):** Ve todos os dados de todos os corretores
- **Corretor:** Ve apenas os proprios dados (leads, conversas, metricas)
- Cada corretor tem seu proprio numero de WhatsApp Business
- 10 instancias no Evolution API (1 por corretor)

## Modulos — Fase 1 (Prioridade)

### 1. Dashboard (Tela inicial)
- Total de leads
- Leads novos hoje
- Taxa de conversao
- Negocios em andamento
- Disparos enviados
- Follow-ups pendentes
- Ranking de corretores (visao admin)
- Receita prevista

### 2. Cadastro de Corretores
- Nome, telefone, email, CRECI
- Status ativo/inativo
- Leads atribuidos
- Foto/avatar

### 3. Conversas (WhatsApp)
- Ler conversas em tempo real via Evolution API
- Enviar mensagens pelo Dashboard
- Identificar interesse do cliente:
  - Tipo de imovel que procura
  - Regiao de interesse
  - Faixa de preco
- Historico de mensagens por contato

### 4. CRM Kanban (Funil de vendas)
- Etapas: Novo > Qualificando > Proposta > Negociando > Fechado / Perdido
- Arrastar e soltar leads entre etapas
- Valor do negocio por lead
- Corretor responsavel

### 5. Distribuicao de Leads
- Modo automatico: rodizio entre corretores ativos
- Modo manual: admin escolhe quem recebe
- Opcao de distribuir por regiao/tipo de imovel

### 6. Disparos (Broadcast)
- Envio em massa via WhatsApp (Evolution API)
- Segmentacao de publico (por interesse, regiao, etc.)
- Relatorio de entrega/leitura
- Templates de mensagem

### 7. Follow-ups
- Agendamento de mensagens futuras
- Lembretes automaticos
- Status: pendente / enviado / falhou
- Integrado com n8n para automacao

### 8. Ultimos Contatos
- Lista de leads recentes
- Ultimo contato feito (data/hora)
- Quem NAO foi contatado ainda (alerta)
- Historico de interacoes

### 9. Analise de Interesse
- O que cada cliente procura (tipo, regiao, preco)
- Baseado na leitura das conversas do WhatsApp
- Ajuda o corretor a oferecer o imovel certo

## Modulos — Fase 2 (Futuro)
- Integracao com Agendor (API: https://api.agendor.com.br/docs/)
  - Dados organizados por responsavel
  - Cada usuario ve apenas seus dados do Agendor
- Leiloes de imoveis
- Agendamento de visitas

## Arquitetura Tecnica
```
Frontend: Next.js 16 + React 19 + TypeScript + shadcn/ui + Tailwind CSS v4
Backend:  Next.js API Routes
Database: PostgreSQL
Auth:     Sistema de login com perfis (admin/corretor)
WhatsApp: Evolution API (ja rodando na VPS)
Automacao: n8n (ja rodando na VPS)
Deploy:   Docker na VPS Hostinger
Dominio:  crm.nexusinovacoesimobiliarias.com.br (subdominio)
```

## Visual
- Cores e logo do site principal da Nexus
- Design moderno com shadcn/ui
- Responsivo (desktop + mobile)
