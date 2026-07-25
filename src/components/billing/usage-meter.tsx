// src/components/billing/usage-meter.tsx
import { Progress } from "@/components/ui/progress";

export function UsageMeter({
  label,
  used,
  limit,
  percentage,
}: {
  label: string;
  used: number;
  limit: number;
  percentage: number;
}) {
  const isUnlimited = limit === -1;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {used.toLocaleString()}{" "}
          {isUnlimited ? "" : `/ ${limit.toLocaleString()}`}
          {isUnlimited && " · Unlimited"}
        </span>
      </div>
      <Progress className="mt-1.5" value={isUnlimited ? 0 : percentage} />
    </div>
  );
}
