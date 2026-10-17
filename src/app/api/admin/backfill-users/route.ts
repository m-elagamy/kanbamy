import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const backfillSecret = process.env.BACKFILL_SECRET;
  const providedSecret = request.nextUrl.searchParams.get("secret");

  // يجب ضبط المتغير في Vercel أولاً، ويجب أن تتطابق كلمة السر الممررة مع القيمة المخزنة
  if (!backfillSecret || !providedSecret || providedSecret !== backfillSecret) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Unauthorized: Access is denied. Please ensure ADMIN_BACKFILL_SECRET is set in environment variables and matches the ?secret parameter.",
      },
      { status: 401 },
    );
  }

  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) {
    return NextResponse.json(
      {
        success: false,
        message:
          "CLERK_SECRET_KEY environment variable is missing on the server.",
      },
      { status: 500 },
    );
  }

  try {
    // 1. جلب المستخدمين الذين يحتاجون للتحديث فقط (واستثناء مستخدمي الـ Demo)
    const targetUsers = await db.user.findMany({
      where: {
        createdAt: null,
        isDemo: false,
        id: { startsWith: "user_" },
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (targetUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message:
          "All eligible users already have a createdAt timestamp. Nothing to update!",
        updatedCount: 0,
        results: [],
      });
    }

    const results = [];

    // 2. تحديث كل مستخدم بجلب تاريخه من Clerk
    for (const user of targetUsers) {
      try {
        const response = await fetch(
          `https://api.clerk.com/v1/users/${user.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${clerkSecretKey}`,
              "Content-Type": "application/json",
            },
          },
        );

        let targetDate: Date | null = null;
        let source = "";

        if (response.ok) {
          const clerkData = await response.json();
          if (clerkData.created_at) {
            targetDate = new Date(clerkData.created_at);
            source = "Clerk API";
          }
        } else if (response.status === 404) {
          // Fallback: في حال تم حذف المستخدم من Clerk سابقاً، نأخذ تاريخ أول لوحة أنشأها
          const oldestBoard = await db.board.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "asc" },
            select: { createdAt: true },
          });

          if (oldestBoard?.createdAt) {
            targetDate = oldestBoard.createdAt;
            source = "Oldest Board Fallback";
          }
        }

        if (targetDate) {
          await db.user.update({
            where: { id: user.id },
            data: { createdAt: targetDate },
          });

          results.push({
            id: user.id,
            email: user.email,
            createdAt: targetDate.toISOString(),
            source,
            status: "updated",
          });
        } else {
          results.push({
            id: user.id,
            email: user.email,
            status: "skipped (user not found in Clerk and has no boards)",
          });
        }
      } catch (err: unknown) {
        results.push({
          id: user.id,
          email: user.email,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const updatedCount = results.filter((r) => r.status === "updated").length;

    return NextResponse.json({
      success: true,
      message: `Backfill completed successfully. Updated ${updatedCount} user(s).`,
      updatedCount,
      results,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to perform backfill",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
