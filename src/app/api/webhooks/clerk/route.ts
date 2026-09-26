import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { deleteUserRecord } from "@/lib/dal/user";

export async function POST(request: NextRequest) {
  let event;

  try {
    event = await verifyWebhook(request);
  } catch (error) {
    console.error("Clerk webhook verification failed:", error);

    return Response.json(
      { received: false, message: "Webhook verification failed." },
      { status: 400 },
    );
  }

  if (event.type !== "user.deleted") {
    return Response.json({ received: true });
  }

  if (!event.data.id) {
    return Response.json(
      { received: false, message: "Deleted user ID is missing." },
      { status: 400 },
    );
  }

  try {
    await deleteUserRecord(event.data.id);
    return Response.json({ received: true });
  } catch (error) {
    console.error("Clerk webhook database deletion failed:", error);

    return Response.json(
      { received: false, message: "Database deletion failed." },
      { status: 500 },
    );
  }
}