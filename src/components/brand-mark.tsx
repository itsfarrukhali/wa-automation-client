import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-3", className)}
      aria-label="Zario home"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-primary text-base font-bold text-white shadow-[0_8px_24px_rgba(21,104,91,0.22)]">
        Z
      </span>
      <span>
        <span className="block text-base font-semibold leading-5 text-foreground">
          Zario
        </span>
        <span className="block text-xs text-muted-foreground">
          WhatsApp operations
        </span>
      </span>
    </Link>
  );
}
