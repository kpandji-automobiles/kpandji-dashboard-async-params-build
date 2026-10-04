import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApprouvedUser } from "@/lib/require-approved-user";
import { clerkClient } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function GET() {
  let callerClerkId;
  try {
    callerClerkId = await getApprouvedUser();
  } catch (error) {
    console.error("Error user not approuved", error);
    return NextResponse.json({ error: "User not approuved" }, { status: 403 });
  }

  try {
    const userSearch = await prisma.user.findUnique({
      where: {
        clerkId: callerClerkId,
      },
    });
    if (userSearch == null) {
      return NextResponse.json({ error: "User null" }, { status: 404 });
    }

    const currentUserId = userSearch.id;

    const users = await prisma.user.findMany({
      where: { id: { not: currentUserId } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        clerkId: true,
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    });

    const clerk = await clerkClient();

    const comptesVerifies = await Promise.all(
      users.map(async (dbUser) => {
        const clerkUser = await clerk.users.getUser(dbUser.clerkId);

        return {
          dbUser,
          estApprouve: clerkUser.publicMetadata.onboardingCompleted === true,
        };
      }),
    );

    const finalUser = comptesVerifies.filter((user) => {
      return user.estApprouve === true;
    });

    const lastTab = finalUser.map((item) => ({
      id: item.dbUser.id,
      firstName: item.dbUser.firstName,
      lastName: item.dbUser.lastName,
      email: item.dbUser.email,
    }));

    return NextResponse.json(lastTab);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
