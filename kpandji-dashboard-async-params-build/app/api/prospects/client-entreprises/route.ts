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
      { success: false, error: "Utilisateur Non Approuvé." },
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

    const clientEntreprises = await prisma.client_entreprise.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const data = clientEntreprises;

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
