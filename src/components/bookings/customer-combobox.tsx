"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCustomerList } from "@/hooks/use-customers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export function CustomerCombobox({
  value,
  onChange,
}: {
  value: { id: string; label: string } | null;
  onChange: (customer: { id: string; label: string } | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isFetching } = useCustomerList({
    search: debouncedSearch,
    limit: 10,
    sortBy: "name",
    sortOrder: "asc",
  });
  const customers = data?.customers ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value ? value.label : "Select a customer..."}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or phone..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {isFetching && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isFetching && <CommandEmpty>No customers found.</CommandEmpty>}
            <CommandGroup>
              {customers.map((customer) => (
                <CommandItem
                  key={customer._id}
                  value={customer._id}
                  onSelect={() => {
                    onChange({
                      id: customer._id,
                      label: `${customer.name} · ${customer.phone}`,
                    });
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value?.id === customer._id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div>
                    <div>{customer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {customer.whatsappNumber || customer.phone}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
