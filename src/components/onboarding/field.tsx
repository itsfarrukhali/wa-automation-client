// src/components/onboarding/field.tsx
export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && !error && (
        <span className="block text-xs text-muted-foreground">{hint}</span>
      )}
      {error && <span className="block text-xs text-destructive">{error}</span>}
    </label>
  );
}
