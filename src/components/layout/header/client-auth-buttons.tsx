"use client";

import { useUser } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";
import AuthButtons from "./auth-buttons";

export default function ClientAuthButtons() {
  const { isLoaded, user } = useUser();

  if (!isLoaded) {
    return <Skeleton className="size-10 rounded-full" aria-hidden="true" />;
  }

  return (
    <AuthButtons
      user={
        user
          ? {
              fullName: user.fullName,
              firstName: user.firstName,
              imageUrl: user.imageUrl,
            }
          : null
      }
    />
  );
}
