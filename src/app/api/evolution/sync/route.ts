import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution_evolution_api:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

async function syncInstance(instanceName: string, agentId: string): Promise<number> {
  const res = await fetch(`${EVOLUTION_API_URL}/chat/findChats/${instanceName}`, {
    headers: { apikey: EVOLUTION_API_KEY },
  }).catch(() => null);

  if (!res?.ok) return 0;

  const chats: Array<{
    id: { remote: string };
    name?: string;
    lastMessage?: { message?: { conversation?: string }; messageTimestamp?: number };
    unreadCount?: number;
  }> = await res.json().catch(() => []);

  let count = 0;
  for (const chat of chats.slice(0, 200)) {
    const phone = chat.id?.remote?.replace("@s.whatsapp.net", "");
    if (!phone || phone.includes("@g.us") || phone.includes("-")) continue;

    const lastText = chat.lastMessage?.message?.conversation ?? null;
    const lastAt = chat.lastMessage?.messageTimestamp
      ? new Date(chat.lastMessage.messageTimestamp * 1000)
      : null;

    await prisma.conversation.upsert({
      where: { phone },
      update: {
        name: chat.name || phone,
        lastMessage: lastText,
        lastAt,
        unread: chat.unreadCount ?? 0,
        agentId,
      },
      create: {
        phone,
        name: chat.name || phone,
        lastMessage: lastText,
        lastAt,
        unread: chat.unreadCount ?? 0,
        agentId,
      },
    });
    count++;
  }
  return count;
}

export async function POST() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";

  const users = await prisma.user.findMany({
    where: {
      whatsappStatus: "connected",
      whatsappInstanceId: { not: null },
      ...(isAdmin ? {} : { id: session.user.id }),
    },
    select: { id: true, whatsappInstanceId: true, name: true },
  });

  if (users.length === 0) {
    return NextResponse.json({ synced: 0, message: "Nenhuma instância conectada" });
  }

  let total = 0;
  for (const u of users) {
    const count = await syncInstance(u.whatsappInstanceId!, u.id);
    total += count;
  }

  return NextResponse.json({ synced: total, instances: users.length });
}
