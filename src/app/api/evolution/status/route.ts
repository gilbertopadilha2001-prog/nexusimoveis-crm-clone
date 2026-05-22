import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || "http://evolution:8080";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;

export async function GET(request: NextRequest) {
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

    // If no instance, return disconnected
    if (!user.whatsappInstanceId) {
      return NextResponse.json({
        status: "disconnected",
        phone: null,
      });
    }

    try {
      // Check status with Evolution API
      const response = await fetch(
        `${EVOLUTION_API_URL}/instance/${user.whatsappInstanceId}`,
        {
          method: "GET",
          headers: {
            "X-API-Key": EVOLUTION_API_KEY || "",
          },
        }
      );

      if (!response.ok) {
        return NextResponse.json({
          status: user.whatsappStatus || "disconnected",
          phone: user.whatsappPhone || null,
        });
      }

      const data = await response.json();

      // Update user status based on Evolution response
      let updatedStatus = user.whatsappStatus;
      let updatedPhone = user.whatsappPhone;

      if (data.status === "open") {
        updatedStatus = "connected";
        updatedPhone = data.phoneNumber || user.whatsappPhone;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            whatsappStatus: "connected",
            whatsappPhone: updatedPhone,
          },
        });
      } else if (data.status === "closed" || data.status === "disconnected") {
        updatedStatus = "disconnected";
        updatedPhone = null;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            whatsappStatus: "disconnected",
            whatsappPhone: null,
          },
        });
      }

      return NextResponse.json({
        status: updatedStatus,
        phone: updatedPhone,
      });
    } catch (error) {
      console.error("Error checking instance status:", error);
      // Return current status from database
      return NextResponse.json({
        status: user.whatsappStatus || "disconnected",
        phone: user.whatsappPhone || null,
      });
    }
  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
