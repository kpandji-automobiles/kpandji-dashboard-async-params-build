import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApprouvedUser } from "@/lib/require-approved-user";

export const dynamic = "force-dynamic";

export async function GET() {
  let userId: string;

  try {
    userId = await getApprouvedUser();
  } catch {
    return NextResponse.json(
      { success: false, error: "L'User n'est pas approuvé" },
      { status: 403 },
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const data = clients

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors du chargement",
      },
      { status: 500 },
    );
  }
}
