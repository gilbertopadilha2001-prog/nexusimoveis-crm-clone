import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution:8080";
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

    // If already connected, return existing instance
    if (
      user.whatsappStatus === "connected" &&
      user.whatsappInstanceId &&
      user.whatsappPhone
    ) {
      return NextResponse.json({
        status: "already_connected",
        phone: user.whatsappPhone,
        message: "WhatsApp is already connected for this user",
      });
    }

    // If already scanning, return existing instance
    if (user.whatsappStatus === "scanning" && user.whatsappInstanceId) {
      // Try to get current QR code
      const instanceName = `corretor_${user.id}`;
      try {
        const response = await fetch(
          `${EVOLUTION_API_URL}/instance/${instanceName}`,
          {
            method: "GET",
            headers: {
              "X-API-Key": EVOLUTION_API_KEY || "",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json({
            qrcode: data.qrcode || null,
            instanceName,
            status: "scanning",
          });
        }
      } catch (error) {
        console.error("Error fetching existing instance:", error);
      }
    }

    // Create new instance
    const instanceName = `corretor_${user.id}`;

    const response = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
      method: "POST",
      headers: {
        "X-API-Key": EVOLUTION_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instanceName,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Evolution API error:", error);
      return NextResponse.json(
        { error: "Failed to create Evolution instance" },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Update user status to scanning
    await prisma.user.update({
      where: { id: user.id },
      data: {
        whatsappInstanceId: instanceName,
        whatsappStatus: "scanning",
      },
    });

    return NextResponse.json({
      qrcode: data.qrcode || null,
      instanceName,
      status: "scanning",
    });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
