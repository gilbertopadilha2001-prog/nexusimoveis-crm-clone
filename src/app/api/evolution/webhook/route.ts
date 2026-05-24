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

        const rawJid = msg.key?.remoteJid ?? "";
        if (rawJid.includes("@g.us")) continue; // ignora grupos

        // Handle @lid format — use remoteJidAlt for the actual phone
        const phoneRaw = rawJid.includes("@lid")
          ? (msg.key?.remoteJidAlt ?? "").replace("@s.whatsapp.net", "")
          : rawJid.replace("@s.whatsapp.net", "");

        const phone = phoneRaw.replace(/\D/g, "");
        if (!phone || phone.length < 8) continue;

        const text =
          msg.message?.conversation ||
          msg.message?.extendedTextMessage?.text ||
          msg.message?.imageMessage?.caption ||
          null;
        const pushName = msg.pushName;

        if (!text) continue;

        const existing = await prisma.conversation.findUnique({ where: { phone } });

        let conversation;
        if (!existing) {
          conversation = await prisma.conversation.create({
            data: {
              phone,
              remoteJid: rawJid,
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
        let user = await prisma.user.findFirst({ where: { whatsappInstanceId: instanceName } });

        if (user) {
          const newStatus =
            state === "open" ? "connected" : state === "close" ? "disconnected" : "scanning";

          if (state === "open") {
            // Extrai o número conectado
            const ownerPhone = data?.ownerJid?.replace("@s.whatsapp.net", "") ||
              data?.instance?.ownerJid?.replace("@s.whatsapp.net", "") || null;

            // Verifica se outro usuário no CRM já estava vinculado a esse número
            if (ownerPhone) {
              const normalizeP = (p: string) => p.replace(/\D/g, "");
              const normOwner = normalizeP(ownerPhone);
              const allUsers = await prisma.user.findMany({
                where: { whatsappPhone: { not: null }, id: { not: user.id } },
                select: { id: true, whatsappPhone: true, whatsappInstanceId: true },
              });
              const duplicate = allUsers.find((u) => {
                const n = normalizeP(u.whatsappPhone!);
                return n === normOwner || n.endsWith(normOwner) || normOwner.endsWith(n);
              });

              if (duplicate) {
                // Redireciona o usuário atual para a instância já existente do mesmo número
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    whatsappInstanceId: duplicate.whatsappInstanceId,
                    whatsappPhone: ownerPhone,
                    whatsappStatus: "connected",
                  },
                });
                return NextResponse.json({ ok: true });
              }
            }

            await prisma.user.update({
              where: { id: user.id },
              data: {
                whatsappStatus: "connected",
                ...(ownerPhone ? { whatsappPhone: ownerPhone } : {}),
              },
            });
            syncChatsForAgent(instanceName, user.id).catch(console.error);
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: { whatsappStatus: state === "close" ? "disconnected" : "scanning", whatsappPhone: null },
            });
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
