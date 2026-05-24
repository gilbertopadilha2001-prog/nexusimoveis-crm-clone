import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";

  const conversations = await prisma.conversation.findMany({
    where: isAdmin ? {} : { agentId: session.user.id },
    include: {
      agent: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { lastAt: "desc" },
  });

  return NextResponse.json(conversations);
}
