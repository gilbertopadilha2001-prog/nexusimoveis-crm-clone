export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tag?: string;
  status?: "active" | "inactive";
  createdAt?: string;
}

export interface Conversation {
  id: string;
  contactName: string;
  phone: string;
  lastMessage: string;
  lastMessageAt: string;
  unread?: number;
  status?: "open" | "closed";
}

export interface Broadcast {
  id: string;
  name: string;
  audience: string;
  message: string;
  sentAt?: string;
  status: "draft" | "sending" | "sent" | "failed";
  totalSent?: number;
  deliveryRate?: number;
  readRate?: number;
}

export interface FollowUp {
  id: string;
  contactName: string;
  phone: string;
  message: string;
  scheduledAt: string;
  status: "pending" | "sent" | "failed" | "cancelled";
}

export interface KanbanLead {
  id: string;
  contactName: string;
  phone: string;
  property?: string;
  value?: number;
  stage: "novo" | "qualificando" | "proposta" | "negociando" | "fechado" | "perdido";
  assignedTo?: string;
}

export interface Property {
  id: string;
  title: string;
  type: "casa" | "apartamento" | "terreno" | "comercial" | "rural";
  deal: "venda" | "locacao";
  price: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  city: string;
  neighborhood?: string;
  images?: string[];
  status: "disponivel" | "vendido" | "alugado";
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  creci?: string;
  avatar?: string;
  status: "active" | "inactive";
}

export interface Visit {
  id: string;
  contactName: string;
  phone: string;
  property: string;
  agentName?: string;
  scheduledAt: string;
  status: "agendada" | "confirmada" | "realizada" | "cancelada" | "reagendada";
}

export interface Auction {
  id: string;
  address: string;
  city: string;
  state: string;
  type: string;
  appraisalValue: number;
  minBid: number;
  discount: number;
  auctionDate?: string;
  modalidade: string;
  score?: number;
}

export interface AiSummary {
  id: string;
  contactName: string;
  phone: string;
  summary: string;
  sentiment?: "positive" | "neutral" | "negative";
  confidence?: number;
  topics?: string[];
  createdAt: string;
}
