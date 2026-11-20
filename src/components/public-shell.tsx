import Link from "next/link";
import { LockKeyhole, Mail, MapPin, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { HomeHeaderActions } from "@/components/home-auth-actions";

const productLinks = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <BrandMark />
        <nav
          className="hidden items-center gap-7 text-sm font-medium text-slate-600 lg:flex"
          aria-label="Primary navigation"
        >
          {productLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/security" className="transition-colors hover:text-primary">
            Security
          </Link>
          <Link href="/contact" className="transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>
        <HomeHeaderActions />
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-6">
        <div className="max-w-sm">
          <BrandMark className="[&_span]:text-white" />
          <p className="mt-5 text-sm leading-6 text-slate-400">
            A focused WhatsApp operations workspace for service businesses that
            need organized conversations, bookings, reminders, and customer
            context.
          </p>
          <div className="mt-5 space-y-2 text-sm text-slate-400">
            <p className="flex items-center gap-2">
              <MapPin className="size-4" /> Karachi, Pakistan
            </p>
            <a
              href="mailto:support@zario.app"
              className="flex items-center gap-2 hover:text-white"
            >
              <Mail className="size-4" /> support@zario.app
            </a>
          </div>
        </div>

        <FooterGroup title="Product" links={productLinks} />
        <FooterGroup
          title="Trust"
          links={[
            { href: "/security", label: "Security" },
            { href: "/privacy", label: "Privacy policy" },
            { href: "/data-deletion", label: "Data deletion" },
          ]}
        />
        <FooterGroup
          title="Company"
          links={[
            { href: "/contact", label: "Contact" },
            { href: "/terms", label: "Terms of service" },
            { href: "/login", label: "Customer login" },
          ]}
        />
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between md:px-6">
          <span>© {new Date().getFullYear()} Zario. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <LockKeyhole className="size-3.5" /> Secure access and encrypted
            transport
          </span>
        </div>
      </div>
    </footer>
  );
}

export function TrustNotice() {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
      <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-700" />
      <p>
        Zario never asks you to paste WhatsApp credentials into chat or email.
        Connection credentials are submitted only inside the authenticated
        dashboard and stored encrypted.
      </p>
    </div>
  );
}

function FooterGroup({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <nav className="mt-4 flex flex-col gap-3 text-sm" aria-label={title}>
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-white">
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
