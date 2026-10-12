import { useState } from "react";
import { Loader } from "lucide-react";
import type { Column } from "@prisma/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import useLoadingStore from "@/stores/loading";
import type { ColumnStatus } from "@/schemas/column";
import columnStatusOptions from "../data/column-status-options";

type ColumnStatusSelectProps = {
  columnStatus: string;
  handleUpdateColumn: (updates: Pick<Column, "status">) => Promise<void>;
};

export default function ColumnStatusSelect({
  columnStatus,
  handleUpdateColumn,
}: ColumnStatusSelectProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const isLoading = useLoadingStore((state) =>
    state.isLoading("column", "updating"),
  );

  const filteredStatuses = Object.keys(columnStatusOptions).filter((status) => {
    return status !== columnStatus;
  });

  const handleStatusSelect = (value: string) => {
    if (!isLoading && Object.keys(columnStatusOptions).includes(value)) {
      setSelectedStatus(value);
      handleUpdateColumn({ status: value as ColumnStatus });
    }
  };

  return (
    <Command>
      <CommandInput placeholder="Search..." className="h-9" />
      <CommandList>
        <CommandEmpty>No matching statuses found.</CommandEmpty>
        <CommandGroup>
          {filteredStatuses.map((status) => {
            const { icon: Icon, color } =
              columnStatusOptions[status as keyof typeof columnStatusOptions];
            const isSelected = status === selectedStatus;

            return (
              <CommandItem
                key={status}
                value={status}
                onSelect={(value) => handleStatusSelect(value)}
                className="flex items-center justify-between gap-2"
                disabled={isLoading}
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} color={color} />
                  <span className="max-w-32 overflow-hidden text-ellipsis whitespace-nowrap">
                    {status}
                  </span>
                </span>
                {isSelected && isLoading && (
                  <Loader className="h-4 w-4 animate-spin" />
                )}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
