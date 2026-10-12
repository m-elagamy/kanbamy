import { Skeleton } from "@/components/ui/skeleton";

export default function StatusOptionsSkeleton() {
  return (
    <div className="relative mb-2 overflow-hidden rounded-lg">
      <Skeleton className="h-6 w-full" />
    </div>
  );
}
