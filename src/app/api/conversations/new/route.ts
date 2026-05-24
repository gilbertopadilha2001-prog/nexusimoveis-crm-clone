import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution_evolution_api:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { phone, name, text } = await req.json();
  if (!phone || !text) {
    return NextResponse.json({ error: "phone e text são obrigatórios" }, { status: 400 });
  }

  const normalizedPhone = phone.replace(/\D/g, "");
  if (!normalizedPhone) {
    return NextResponse.json({ error: "Telefone inválido" }, { status: 400 });
  }

  const agent = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, whatsappInstanceId: true, whatsappStatus: true },
  });

  if (!agent?.whatsappInstanceId || agent.whatsappStatus !== "connected") {
    return NextResponse.json({ error: "WhatsApp não conectado" }, { status: 400 });
  }

  const conversation = await prisma.conversation.upsert({
    where: { phone: normalizedPhone },
    update: {
      name: name || normalizedPhone,
      lastMessage: text,
      lastAt: new Date(),
      ...(session.user.role !== "ADMIN" ? {} : {}),
    },
    create: {
      phone: normalizedPhone,
      name: name || normalizedPhone,
      lastMessage: text,
      lastAt: new Date(),
      unread: 0,
      agentId: session.user.id,
    },
  });

  const sendRes = await fetch(
    `${EVOLUTION_API_URL}/message/sendText/${agent.whatsappInstanceId}`,
    {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        number: normalizedPhone,
        text,
      }),
    }
  ).catch(() => null);

  const remoteId = sendRes?.ok ? (await sendRes.json().catch(() => ({}))).key?.id ?? null : null;

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      text,
      sent: true,
      read: true,
      remoteId,
    },
  });

  return NextResponse.json({ conversationId: conversation.id });
}
