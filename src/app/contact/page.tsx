import type { Metadata } from "next";
import Link from "next/link";
import { Clock3, Mail, MapPin, ShieldAlert } from "lucide-react";
import { PublicFooter, PublicHeader, TrustNotice } from "@/components/public-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Zario for product, account, privacy, or security support.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <PublicHeader />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Contact Zario</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Use the right channel for the issue.</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">Describe the business impact, affected page, and approximate time. Never send passwords or connection secrets.</p>
          <div className="mt-8"><TrustNotice /></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ContactCard icon={Mail} title="Product and account support" text="Questions about setup, access, billing, or product behavior." subject="Zario support request" />
          <ContactCard icon={ShieldAlert} title="Security report" text="Report a suspected vulnerability with safe reproduction details." subject="Security report" />
          <ContactCard icon={Mail} title="Privacy or deletion" text="Request access, correction, export, or deletion of account data." subject="Privacy request" />
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <MapPin className="size-6 text-primary" /><h2 className="mt-5 text-lg font-semibold">Operator</h2><p className="mt-2 text-sm leading-6 text-slate-600">Farrukh Ali<br />Karachi, Pakistan</p><p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><Clock3 className="size-4" /> Responses depend on request complexity.</p>
          </div>
        </div>
      </section>
      <section className="border-y border-slate-200 bg-slate-50"><div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6"><div><h2 className="text-xl font-semibold">Looking for policy details?</h2><p className="mt-1 text-sm text-slate-600">Review the relevant document before sending a request.</p></div><div className="flex flex-wrap gap-2"><Button asChild variant="outline"><Link href="/privacy">Privacy</Link></Button><Button asChild variant="outline"><Link href="/data-deletion">Data deletion</Link></Button><Button asChild variant="outline"><Link href="/security">Security</Link></Button></div></div></section>
      <PublicFooter />
    </main>
  );
}

function ContactCard({ icon: Icon, title, text, subject }: { icon: typeof Mail; title: string; text: string; subject: string }) {
  return <article className="rounded-2xl border border-slate-200 p-6"><Icon className="size-6 text-primary" /><h2 className="mt-5 text-lg font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p><Button asChild className="mt-5" variant="outline"><a href={`mailto:support@zario.app?subject=${encodeURIComponent(subject)}`}>Email support</a></Button></article>;
}
