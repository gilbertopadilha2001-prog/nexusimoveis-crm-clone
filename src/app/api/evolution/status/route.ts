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

    // Fetch full instance info (includes disconnectionReasonCode)
    const allRes = await fetch(
      `${EVOLUTION_API_URL}/instance/fetchInstances`,
      { headers: { apikey: EVOLUTION_API_KEY } }
    ).catch(() => null);

    if (!allRes?.ok) {
      return NextResponse.json({ status: user.whatsappStatus, phone: user.whatsappPhone, instanceName: user.whatsappInstanceId, userName: user.name });
    }

    const all: Array<{
      name: string;
      connectionStatus: string;
      ownerJid?: string;
      disconnectionReasonCode?: number;
      disconnectionObject?: string;
    }> = await allRes.json().catch(() => []);

    const inst = all.find((i) => i.name === user.whatsappInstanceId);

    if (!inst) {
      // Instance doesn't exist in Evolution — reset DB status
      await prisma.user.update({ where: { id: user.id }, data: { whatsappStatus: "disconnected" } });
      return NextResponse.json({ status: "disconnected", phone: user.whatsappPhone, instanceName: user.whatsappInstanceId, userName: user.name });
    }

    let status = user.whatsappStatus;
    let phone = user.whatsappPhone;
    let disconnectionCode: number | null = inst.disconnectionReasonCode ?? null;
    let disconnectionReason: string | null = null;

    if (inst.disconnectionObject) {
      try {
        const obj = JSON.parse(inst.disconnectionObject);
        disconnectionReason =
          obj?.error?.data?.tag ||
          obj?.error?.data?.reason ||
          obj?.error?.output?.payload?.message ||
          null;
      } catch { /* ignore */ }
    }

    if (inst.connectionStatus === "open") {
      status = "connected";
      phone = inst.ownerJid?.replace("@s.whatsapp.net", "") || phone;
      disconnectionCode = null;
      disconnectionReason = null;
      await prisma.user.update({
        where: { id: user.id },
        data: { whatsappStatus: "connected", whatsappPhone: phone },
      });
    } else if (inst.connectionStatus === "close") {
      status = "disconnected";
      await prisma.user.update({
        where: { id: user.id },
        data: { whatsappStatus: "disconnected" },
      });
    }

    return NextResponse.json({ status, phone, instanceName: user.whatsappInstanceId, userName: user.name, disconnectionCode, disconnectionReason });
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
