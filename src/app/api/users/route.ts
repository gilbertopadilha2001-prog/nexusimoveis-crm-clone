import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      creci: true,
      active: true,
      avatar: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const { name, username, email, password, role, phone, creci } = body;

  if (!name || !username || !email || !password) {
    return NextResponse.json(
      { error: "Nome, usuário, email e senha são obrigatórios" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email já cadastrado" },
      { status: 409 }
    );
  }

  const existingUsername = await prisma.user.findUnique({ where: { username: username.toUpperCase() } });
  if (existingUsername) {
    return NextResponse.json(
      { error: "Nome de usuário já cadastrado" },
      { status: 409 }
    );
  }

  const hashedPassword = await hash(password, 12);

  const instanceName = username.toLowerCase().replace(/[^a-z0-9]/g, "");
  const webhookUrl = `${process.env.AUTH_URL || "https://crm.nexusinovacoesimobiliarias.com.br"}/api/evolution/webhook`;
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "";
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || "";

  // Cria instância na Evolution API antes de salvar o usuário
  let evolutionCreated = false;
  if (EVOLUTION_API_URL) {
    await fetch(`${EVOLUTION_API_URL}/instance/delete/${instanceName}`, {
      method: "DELETE",
      headers: { apikey: EVOLUTION_API_KEY },
    }).catch(() => {});

    const evRes = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
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
    }).catch(() => null);
    evolutionCreated = evRes?.ok ?? false;
  }

  const user = await prisma.user.create({
    data: {
      name,
      username: username.toUpperCase(),
      email,
      hashedPassword,
      role: role || "AGENT",
      phone,
      creci,
      avatar: name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
      whatsappInstanceId: evolutionCreated ? instanceName : undefined,
      whatsappStatus: "disconnected",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      creci: true,
      active: true,
      avatar: true,
      whatsappInstanceId: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
