import Link from "next/link";

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
    <main className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-white"
            >
              Z
            </span>
            Zario
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
        <header className="border-b pb-8">
          <h1 className="text-3xl font-semibold md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>
        </header>
        <div className="mt-9 space-y-8 text-sm leading-7 text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:space-y-2">
          {children}
        </div>
      </article>
    </main>
  );
}
