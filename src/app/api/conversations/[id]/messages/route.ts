import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

async function canAccessConversation(userId: string, role: string, conversationId: string) {
  if (role === "ADMIN") return true;
  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  return conv?.agentId === userId;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { id } = await params;

  if (!(await canAccessConversation(session.user.id, session.user.role, id))) {
    return NextResponse.json({ error: "Sem acesso" }, { status: 403 });
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

  // Usa a instância do agente responsável pela conversa (ou do usuário atual se admin)
  const senderId = conversation.agentId || session.user.id;
  const sender = await prisma.user.findUnique({ where: { id: senderId } });

  if (sender?.whatsappInstanceId && sender.whatsappStatus === "connected" && EVOLUTION_API_URL) {
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
