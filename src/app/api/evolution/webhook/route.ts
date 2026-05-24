import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

async function syncChatsForAgent(instanceName: string, agentId: string) {
  if (!EVOLUTION_API_URL) return;
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/chat/findChats/${instanceName}`, {
      headers: { apikey: EVOLUTION_API_KEY },
    });
    if (!res.ok) return;
    const chats: Array<{ id: { remote: string }; name?: string; lastMessage?: { message?: { conversation?: string } }; unreadCount?: number }> = await res.json();

    for (const chat of chats.slice(0, 100)) {
      const phone = chat.id?.remote?.replace("@s.whatsapp.net", "");
      if (!phone || phone.includes("@g.us")) continue;

      const existing = await prisma.conversation.findUnique({ where: { phone } });
      if (!existing) {
        await prisma.conversation.create({
          data: {
            phone,
            name: chat.name || phone,
            agentId,
            unread: chat.unreadCount || 0,
          },
        });
      } else if (!existing.agentId) {
        await prisma.conversation.update({
          where: { phone },
          data: { agentId },
        });
      }
    }
  } catch (e) {
    console.error("syncChats error:", e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, instance, data } = body;

    // Resolve o agente dono da instância
    const agentByInstance = instance
      ? await prisma.user.findFirst({ where: { whatsappInstanceId: instance } })
      : null;

    if (event === "messages.upsert" && data?.messages?.length) {
      for (const msg of data.messages) {
        if (msg.key?.fromMe) continue;

        const phone = msg.key?.remoteJid?.replace("@s.whatsapp.net", "");
        if (phone?.includes("@g.us")) continue; // ignora grupos

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          null;
        const pushName = msg.pushName;

        if (!phone || !text) continue;

        const existing = await prisma.conversation.findUnique({ where: { phone } });

        let conversation;
        if (!existing) {
          conversation = await prisma.conversation.create({
            data: {
              phone,
              name: pushName || phone,
              lastMessage: text,
              lastAt: new Date(),
              unread: 1,
              agentId: agentByInstance?.id ?? null,
            },
          });
        } else {
          conversation = await prisma.conversation.update({
            where: { phone },
            data: {
              name: pushName || existing.name,
              lastMessage: text,
              lastAt: new Date(),
              unread: { increment: 1 },
              // Associa ao agente se ainda não estava vinculado
              ...(agentByInstance && !existing.agentId ? { agentId: agentByInstance.id } : {}),
            },
          });
        }

        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            text,
            sent: false,
            read: false,
            remoteId: msg.key?.id,
          },
        });
      }
    }

    if (event === "connection.update") {
      const state = data?.state ?? data?.instance?.state;
      const instanceName = instance ?? data?.instance;

      if (instanceName && state) {
        const user = await prisma.user.findFirst({ where: { whatsappInstanceId: instanceName } });
        if (user) {
          const newStatus =
            state === "open" ? "connected" : state === "close" ? "disconnected" : "scanning";

          await prisma.user.update({
            where: { id: user.id },
            data: {
              whatsappStatus: newStatus,
              ...(state !== "open" ? { whatsappPhone: null } : {}),
            },
          });

          // Ao conectar, sincroniza conversas existentes da Evolution
          if (state === "open") {
            syncChatsForAgent(instanceName, user.id).catch(console.error);
          }
        }
      }
    }

    if (event === "qrcode.updated" && instance) {
      const user = await prisma.user.findFirst({ where: { whatsappInstanceId: instance } });
      if (user && user.whatsappStatus !== "connected") {
        await prisma.user.update({
          where: { id: user.id },
          data: { whatsappStatus: "scanning" },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
