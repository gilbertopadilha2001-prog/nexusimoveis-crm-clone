import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution_evolution_api:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

// Normaliza número para comparação: mantém só dígitos
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

// Busca instância já conectada na Evolution com o mesmo número de telefone
async function findConnectedInstanceByPhone(phone: string): Promise<{ instanceName: string; ownerPhone: string } | null> {
  try {
    const res = await fetch(`${EVOLUTION_API_URL}/instance/fetchInstances`, {
      headers: { apikey: EVOLUTION_API_KEY },
    });
    if (!res.ok) return null;

    const instances: Array<{
      name: string;
      connectionStatus: string;
      ownerJid?: string;
      number?: string;
    }> = await res.json();

    const normalizedTarget = normalizePhone(phone);

    for (const inst of instances) {
      if (inst.connectionStatus !== "open") continue;

      const ownerRaw = inst.ownerJid?.replace("@s.whatsapp.net", "") || inst.number || "";
      if (!ownerRaw) continue;

      const ownerNorm = normalizePhone(ownerRaw);

      // Compara sufixos para cobrir variações de DDI (ex: 55 + 41...)
      if (
        ownerNorm === normalizedTarget ||
        ownerNorm.endsWith(normalizedTarget) ||
        normalizedTarget.endsWith(ownerNorm)
      ) {
        return { instanceName: inst.name, ownerPhone: ownerRaw };
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    // Já conectado — retorna direto
    if (user.whatsappStatus === "connected" && user.whatsappInstanceId) {
      return NextResponse.json({ status: "already_connected", phone: user.whatsappPhone });
    }

    // Se o usuário tem telefone cadastrado, verifica se já existe instância conectada com esse número
    if (user.phone) {
      const existing = await findConnectedInstanceByPhone(user.phone);
      if (existing) {
        // Vincula o usuário à instância existente sem criar nova
        await prisma.user.update({
          where: { id: user.id },
          data: {
            whatsappInstanceId: existing.instanceName,
            whatsappPhone: existing.ownerPhone,
            whatsappStatus: "connected",
          },
        });
        return NextResponse.json({
          status: "already_connected",
          phone: existing.ownerPhone,
          instanceName: existing.instanceName,
          reused: true,
        });
      }
    }

    // Nome da instância: usa existente ou gera pelo username
    const instanceName = user.whatsappInstanceId || user.username.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Se já está em scanning, busca QR atual
    if (user.whatsappStatus === "scanning" && user.whatsappInstanceId) {
      const res = await fetch(`${EVOLUTION_API_URL}/instance/connect/${instanceName}`, {
        headers: { apikey: EVOLUTION_API_KEY },
      });
      if (res.ok) {
        const data = await res.json();
        const base64 = data.base64 || data.qrcode?.base64 || null;
        return NextResponse.json({ qrcode: base64, instanceName, status: "scanning" });
      }
    }

    // Deleta instância antiga se existir
    await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
      method: "DELETE",
      headers: { apikey: EVOLUTION_API_KEY },
    }).catch(() => {});

    const webhookUrl = `${process.env.AUTH_URL || "https://crm.nexusinovacoesimobiliarias.com.br"}/api/evolution/webhook`;

    // Cria nova instância com webhook configurado
    const createRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers: { apikey: EVOLUTION_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: "WHATSAPP-BAILEYS",
        webhook: {
          url: webhookUrl,
          enabled: true,
          byEvents: true,
          base64: false,
          events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"],
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error("Evolution API create error:", err);
      return NextResponse.json({ error: "Erro ao criar instância Evolution" }, { status: 500 });
    }

    const createData = await createRes.json();
    const base64 = createData.qrcode?.base64 || createData.hash?.qrcode?.base64 || null;

    await prisma.user.update({
      where: { id: user.id },
      data: { whatsappInstanceId: instanceName, whatsappStatus: "scanning" },
    });

    return NextResponse.json({ qrcode: base64, instanceName, status: "scanning" });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
