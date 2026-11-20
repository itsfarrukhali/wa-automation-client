import { PublicFooter, PublicHeader } from "@/components/public-shell";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />

      <article className="mx-auto max-w-4xl px-4 py-14 md:px-6 md:py-20">
        <header className="rounded-2xl border border-slate-200 bg-slate-50 p-7 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Zario policies
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-4 text-sm text-muted-foreground">Last updated: {updated}</p>
        </header>
        <div className="mt-10 space-y-10 text-base leading-8 text-slate-600 [&_a]:font-medium [&_a]:text-primary [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-slate-950 [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-2">
          {children}
        </div>
      </article>
      <PublicFooter />
    </main>
  );
}
