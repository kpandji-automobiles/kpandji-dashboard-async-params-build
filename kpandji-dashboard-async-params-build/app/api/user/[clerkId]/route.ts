import { NextRequest, NextResponse } from "next/server";
import { getApprouvedUser } from "@/lib/require-approved-user";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clerkId: string }> },
) {
  try {
    await getApprouvedUser();
  } catch (error) {
    console.error("Error user not approuved:", error);
    return NextResponse.json({ error: "User not approuved" }, { status: 403 });
  }

  try {
    const { clerkId } = await params;

    if (clerkId == null) {
      return NextResponse.json({ error: "ID Clerk inexistant" }, { status: 404 });
    }

    let targetClerkUser;

    try {
      targetClerkUser = await (await clerkClient()).users.getUser(clerkId);
    } catch (error) {
      if (isClerkAPIResponseError(error) && error.status === 404) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    if (targetClerkUser?.publicMetadata?.onboardingCompleted !== true) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userSearch = await prisma.user.findUnique({
      where: {
        clerkId: targetClerkUser.id,
      },
    });

    if (userSearch == null) {
      return NextResponse.json({ error: "User null" }, { status: 404 });
    }

    return NextResponse.json({
      id: userSearch.id,
      firstName: userSearch.firstName,
      lastName: userSearch.lastName,
      email: userSearch.email,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}

 function isClerkAPIResponseError(
  error: unknown,
): error is { status: number; errors: unknown[] } {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    "errors" in error
  );
}


