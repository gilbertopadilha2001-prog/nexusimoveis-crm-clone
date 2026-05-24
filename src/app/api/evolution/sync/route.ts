import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution_evolution_api:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

interface EvoChat {
  remoteJid: string;
  pushName?: string;
  unreadCount?: number;
  lastMessage?: {
    key?: { remoteJidAlt?: string };
    message?: { conversation?: string; extendedTextMessage?: { text?: string } };
    messageTimestamp?: number;
  };
}

function extractPhone(chat: EvoChat): { phone: string; remoteJid: string } | null {
  const jid = chat.remoteJid;
  if (!jid) return null;

  // Groups: skip
  if (jid.includes("@g.us")) return null;

  // LID format (@lid) — use remoteJidAlt for phone
  if (jid.includes("@lid")) {
    const alt = chat.lastMessage?.key?.remoteJidAlt;
    if (!alt) return null;
    const phone = alt.replace("@s.whatsapp.net", "").replace(/\D/g, "");
    if (!phone || phone.length < 8) return null;
    return { phone, remoteJid: jid };
  }

  const phone = jid.replace("@s.whatsapp.net", "").replace(/\D/g, "");
  if (!phone || phone.length < 8 || jid.includes("-")) return null;
  return { phone, remoteJid: jid };
}

async function syncInstance(instanceName: string, agentId: string): Promise<number> {
  const res = await fetch(`${EVOLUTION_API_URL}/chat/findChats/${instanceName}`, {
    method: "POST",
    headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
    body: "{}",
  }).catch(() => null);

  if (!res?.ok) return 0;

  const chats: EvoChat[] = await res.json().catch(() => []);
  if (!Array.isArray(chats)) return 0;

  // Sort by most recent, take top 200
  const sorted = chats
    .filter((c) => c.lastMessage?.messageTimestamp)
    .sort((a, b) => (b.lastMessage!.messageTimestamp! - a.lastMessage!.messageTimestamp!))
    .slice(0, 200);

  let count = 0;
  for (const chat of sorted) {
    const extracted = extractPhone(chat);
    if (!extracted) continue;

    const { phone, remoteJid } = extracted;
    const lastText =
      chat.lastMessage?.message?.conversation ||
      chat.lastMessage?.message?.extendedTextMessage?.text ||
      null;
    const lastAt = chat.lastMessage?.messageTimestamp
      ? new Date(chat.lastMessage.messageTimestamp * 1000)
      : null;

    await prisma.conversation.upsert({
      where: { phone },
      update: {
        name: chat.pushName || phone,
        remoteJid,
        lastMessage: lastText,
        lastAt,
        unread: chat.unreadCount ?? 0,
        agentId,
      },
      create: {
        phone,
        remoteJid,
        name: chat.pushName || phone,
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

  if (isAdmin) {
    // Admin: sync ALL connected instances from Evolution (regardless of CRM user link)
    const allRes = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
      headers: { apikey: EVOLUTION_API_KEY },
    }).catch(() => null);

    if (!allRes?.ok) return NextResponse.json({ synced: 0, message: "Evolution API inacessível" });

    const allInstances: Array<{ name: string; connectionStatus: string; ownerJid?: string }> =
      await allRes.json().catch(() => []);

    const connected = allInstances.filter((i) => i.connectionStatus === "open");
    if (connected.length === 0) {
      return NextResponse.json({ synced: 0, message: "Nenhuma instância conectada" });
    }

    // Map instance to CRM user (if linked); otherwise use admin
    const users = await prisma.user.findMany({
      where: { whatsappInstanceId: { not: null } },
      select: { id: true, whatsappInstanceId: true },
    });
    const instanceUserMap = new Map(users.map((u) => [u.whatsappInstanceId!, u.id]));

    let total = 0;
    for (const inst of connected) {
      const agentId = instanceUserMap.get(inst.name) ?? session.user.id;
      const count = await syncInstance(inst.name, agentId);
      total += count;
    }

    return NextResponse.json({ synced: total, instances: connected.length });
  } else {
    // Agent: sync only their own instance
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, whatsappInstanceId: true, whatsappStatus: true },
    });

    if (!user?.whatsappInstanceId || user.whatsappStatus !== "connected") {
      return NextResponse.json({ synced: 0, message: "WhatsApp não conectado" });
    }

    const count = await syncInstance(user.whatsappInstanceId, user.id);
    return NextResponse.json({ synced: count, instances: 1 });
  }
}
