import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { deleteUserRecord } from "@/lib/dal/user";

export async function POST(request: NextRequest) {
  console.warn("[clerk-webhook] request received", {
    method: request.method,
    path: request.nextUrl.pathname,
  });

  let event;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("[clerk-webhook] verification failed:", error);

    return Response.json(
      { received: false, message: "Webhook verification failed." },
      { status: 400 },
    );
  }

  console.warn("[clerk-webhook] event verified", { type: event.type });

  if (event.type !== "user.deleted") {
    return Response.json({ received: true });
  }

  if (!event.data.id) {
    console.error("[clerk-webhook] deleted user ID is missing");
    return Response.json(
      { received: false, message: "Deleted user ID is missing." },
      { status: 400 },
    );
  }

  try {
    const result = await deleteUserRecord(event.data.id);
    console.warn("[clerk-webhook] local user deleted", {
      userId: event.data.id,
      deletedUsers: result.count,
    });
    return Response.json({ received: true });
  } catch (error) {
    console.error("[clerk-webhook] database deletion failed:", error);

    return Response.json(
      { received: false, message: "Database deletion failed." },
      { status: 500 },
    );
  }
}
