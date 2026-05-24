import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution_evolution_api:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    if (!user.whatsappInstanceId) {
      return NextResponse.json({ status: "disconnected", phone: null, instanceName: null, userName: user.name });
    }

    const res = await fetch(
      `${EVOLUTION_API_URL}/instance/connectionState/${user.whatsappInstanceId}`,
      { headers: { "apikey": EVOLUTION_API_KEY } }
    ).catch(() => null);

    if (!res?.ok) {
      return NextResponse.json({ status: user.whatsappStatus, phone: user.whatsappPhone, instanceName: user.whatsappInstanceId, userName: user.name });
    }

    const data = await res.json();
    const state = data.instance?.state || data.state;

    let status = user.whatsappStatus;
    let phone = user.whatsappPhone;

    if (state === "open") {
      status = "connected";
      const infoRes = await fetch(
        `${EVOLUTION_API_URL}/instance/fetchInstances?instanceName=${user.whatsappInstanceId}`,
        { headers: { "apikey": EVOLUTION_API_KEY } }
      ).catch(() => null);

      if (infoRes?.ok) {
        const info = await infoRes.json();
        const instance = Array.isArray(info) ? info[0] : info;
        phone = instance?.instance?.ownerJid?.replace("@s.whatsapp.net", "") || phone;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { whatsappStatus: "connected", whatsappPhone: phone },
      });
    } else if (state === "close") {
      status = "disconnected";
      await prisma.user.update({
        where: { id: user.id },
        data: { whatsappStatus: "disconnected" },
      });
    }

    return NextResponse.json({ status, phone, instanceName: user.whatsappInstanceId, userName: user.name });
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
