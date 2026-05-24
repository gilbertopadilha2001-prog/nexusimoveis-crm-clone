import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution_evolution_api:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If no instance, nothing to disconnect
    if (!user.whatsappInstanceId) {
      return NextResponse.json({
        success: true,
        message: "No WhatsApp instance to disconnect",
      });
    }

    try {
      // Delete instance from Evolution API
      const response = await fetch(
        `${EVOLUTION_API_URL}/instance/${user.whatsappInstanceId}`,
        {
          method: "DELETE",
          headers: {
            "X-API-Key": EVOLUTION_API_KEY || "",
          },
        }
      );

      if (!response.ok) {
        console.error("Evolution API delete error:", response.status);
        // Continue anyway - clear local database
      }
    } catch (error) {
      console.error("Error calling Evolution delete API:", error);
      // Continue anyway - clear local database
    }

    // Clear user WhatsApp data
    await prisma.user.update({
      where: { id: user.id },
      data: {
        whatsappInstanceId: null,
        whatsappPhone: null,
        whatsappStatus: "disconnected",
      },
    });

    return NextResponse.json({
      success: true,
      message: "WhatsApp disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting WhatsApp:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
