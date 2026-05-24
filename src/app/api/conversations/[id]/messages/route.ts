import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution_evolution_api:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

async function canAccessConversation(userId: string, role: string, conversationId: string) {
  if (role === "ADMIN") return true;
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  return conv?.agentId === userId;
}

async function fetchAndStoreMessages(conversation: {
  id: string;
  phone: string;
  remoteJid: string | null;
  agentId: string | null;
}): Promise<void> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) return;

  // Find the Evolution instance for this conversation's agent
  if (!conversation.agentId) return;
  const agent = await prisma.user.findUnique({
    where: { id: conversation.agentId },
    select: { whatsappInstanceId: true, whatsappStatus: true },
  });
  if (!agent?.whatsappInstanceId || agent.whatsappStatus !== "connected") return;

  const jid = conversation.remoteJid || `${conversation.phone}@s.whatsapp.net`;

  const res = await fetch(
    `${EVOLUTION_API_URL}/chat/findMessages/${agent.whatsappInstanceId}`,
    {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ where: { key: { remoteJid: jid } }, limit: 50 }),
    }
  ).catch(() => null);

  if (!res?.ok) return;

  const data: {
    messages?: {
      records?: Array<{
        key?: { id?: string; fromMe?: boolean };
        message?: { conversation?: string; extendedTextMessage?: { text?: string } };
        messageTimestamp?: number;
      }>;
    };
  } = await res.json().catch(() => ({}));

  const records = data?.messages?.records ?? [];
  if (!records.length) return;

  for (const m of records) {
    const text =
      m.message?.conversation ||
      m.message?.extendedTextMessage?.text ||
      null;
    if (!text || !m.key?.id) continue;

    const existing = await prisma.message.findFirst({
      where: { remoteId: m.key.id, conversationId: conversation.id },
    });
    if (existing) continue;

    const createdAt = m.messageTimestamp ? new Date(m.messageTimestamp * 1000) : new Date();
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        text,
        sent: m.key.fromMe ?? false,
        read: true,
        remoteId: m.key.id,
        createdAt,
      },
    });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  if (!(await canAccessConversation(session.user.id, session.user.role, id))) {
    return NextResponse.json({ error: "Sem acesso" }, { status: 403 });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

  // If no local messages, fetch from Evolution and store them
  const localCount = await prisma.message.count({ where: { conversationId: id } });
  if (localCount === 0) {
    await fetchAndStoreMessages(conversation).catch(() => {});
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.conversation.update({ where: { id }, data: { unread: 0 } });

  return NextResponse.json({ messages });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;
  const { text } = await req.json();

  if (!text?.trim()) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });

  if (!(await canAccessConversation(session.user.id, session.user.role, id))) {
    return NextResponse.json({ error: "Sem acesso" }, { status: 403 });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id } });
  if (!conversation) return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });

  const senderId = conversation.agentId || session.user.id;
  const sender = await prisma.user.findUnique({ where: { id: senderId } });

  if (sender?.whatsappInstanceId && sender.whatsappStatus === "connected") {
    await fetch(`${EVOLUTION_API_URL}/message/sendText/${sender.whatsappInstanceId}`, {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ number: conversation.phone, text }),
    }).catch(() => {});
  }

  const message = await prisma.message.create({
    data: { conversationId: id, text, sent: true, read: true },
  });

  await prisma.conversation.update({
    where: { id },
    data: { lastMessage: text, lastAt: new Date() },
  });

  return NextResponse.json({ message }, { status: 201 });
}
