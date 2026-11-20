import Link from "next/link";
import {
  BarChart3,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock3,
  KeyRound,
  LockKeyhole,
  MessageCircle,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  Workflow,
} from "lucide-react";
import { HomeHeroActions } from "@/components/home-auth-actions";
import { PublicFooter, PublicHeader, TrustNotice } from "@/components/public-shell";
import { Button } from "@/components/ui/button";

const features = [
  { title: "One operational inbox", text: "Keep customer messages, delivery status, consent state, and reply context together.", icon: MessagesSquare },
  { title: "Bookings tied to conversations", text: "Create, confirm, reschedule, and review appointments without losing customer history.", icon: CalendarCheck },
  { title: "Customer records that stay useful", text: "Maintain contact details, tags, consent, interaction history, and booking context.", icon: Users },
  { title: "Controlled campaigns", text: "Target practical customer segments and use approved WhatsApp templates with opt-out safeguards.", icon: Workflow },
  { title: "Operational reporting", text: "Review booking activity, revenue signals, message performance, and workload trends.", icon: BarChart3 },
  { title: "Accountable team access", text: "Separate owner and staff access so daily work does not require sharing passwords.", icon: UserCheck },
];

const plans = [
  { name: "Starter", price: "Rs 4,500", note: "For small service teams", items: ["WhatsApp inbox", "Bookings", "Basic reminders", "Customer list"] },
  { name: "Growth", price: "Rs 9,500", note: "For active businesses", items: ["Campaigns", "Automation rules", "Reports", "Staff roles"], featured: true },
  { name: "Business", price: "Custom", note: "For larger operations", items: ["Advanced controls", "Priority setup", "Template support", "Audit logs"] },
];

const faqs = [
  { question: "Does Zario replace WhatsApp?", answer: "No. Zario connects to the official WhatsApp Business platform and provides an operational workspace around conversations, templates, bookings, and customer records." },
  { question: "Will support ask for private account details?", answer: "No. Passwords and private WhatsApp connection details should only be entered inside your signed-in Zario dashboard. We will not ask you to send them by email or chat." },
  { question: "Can staff share the owner login?", answer: "They should not. Zario provides staff access so each authorized person can use their own account and permissions." },
  { question: "How are opt-outs handled?", answer: "Customer consent state is recorded, outbound messaging is blocked after an opt-out, and the customer can opt back in through the supported WhatsApp flow." },
];

export default function MarketingHome() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <PublicHeader />

      <section className="relative border-b border-slate-200 bg-[radial-gradient(circle_at_78%_16%,rgba(20,138,117,0.14),transparent_28%),linear-gradient(180deg,#f8fffd_0%,#ffffff_100%)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-800 shadow-sm">
              <Sparkles className="size-4" /> Built for appointment-led service teams
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-6xl">
              Turn WhatsApp activity into organized daily operations.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Zario brings conversations, bookings, customer context, reminders,
              campaigns, and team access into one focused workspace—without
              pretending automation can replace responsible human oversight.
            </p>
            <div className="mt-8 flex min-h-10 flex-col gap-3 sm:flex-row">
              <HomeHeroActions />
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
              <TrustPoint>Official WhatsApp workflows</TrustPoint>
              <TrustPoint>Consent-aware messaging</TrustPoint>
              <TrustPoint>Owner and staff access</TrustPoint>
            </div>
          </div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-7 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
          <TrustItem icon={LockKeyhole} title="Protected connection details" text="Sensitive WhatsApp setup information is encrypted when stored." />
          <TrustItem icon={ShieldCheck} title="Protected account access" text="Zario checks identity and permissions before showing private information." />
          <TrustItem icon={UserCheck} title="Consent controls" text="Opt-out state blocks unauthorized outbound messages." />
          <TrustItem icon={Clock3} title="Monitored production" text="Health checks, smoke tests, and error monitoring stay active." />
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <SectionTitle eyebrow="How it works" title="A clear path from connection to daily work." text="No hidden setup story. Your business connects the required services, configures its operational rules, and gives staff only the access they need." />
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <ProcessCard icon={KeyRound} label="Connect securely" text="Add your WhatsApp Business connection details inside your signed-in settings, then verify the connection before use." />
          <ProcessCard icon={Workflow} label="Configure operations" text="Set services, staff, business hours, templates, customer consent, and booking rules for your workflow." />
          <ProcessCard icon={MessageCircle} label="Work from one queue" text="Handle conversations, booking activity, reminders, and follow-ups with customer context visible." />
        </div>
      </section>

      <section id="features" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <SectionTitle eyebrow="Product" title="The operational layer around customer conversations." text="Each feature supports a real service workflow. Nothing below is a fabricated customer claim or a future capability presented as finished." />
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.04)] transition-transform hover:-translate-y-1">
                <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-primary"><feature.icon className="size-5" /></div>
                <h3 className="mt-5 text-lg font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-2 text-base leading-7 text-slate-600">{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <SectionTitle eyebrow="Trust by design" title="Practical protection for your business data." text="Zario checks who is signed in, what they are allowed to do, and which business they belong to before granting access to protected information." />
          <div className="mt-7"><TrustNotice /></div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline"><Link href="/security">Review security approach</Link></Button>
            <Button asChild variant="ghost"><Link href="/privacy">Read privacy policy</Link></Button>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SecurityCard title="Protected sign-in" text="Account checks continue in the background while you use the service." />
          <SecurityCard title="Owner and staff permissions" text="Team members only receive the access assigned to their role." />
          <SecurityCard title="Protected WhatsApp details" text="Sensitive WhatsApp connection information is encrypted when stored." />
          <SecurityCard title="Service monitoring" text="Zario is monitored for errors, outages, and important service problems." />
        </div>
      </section>

      <section id="pricing" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-20 md:px-6">
          <SectionTitle eyebrow="Pricing" title="Choose the operational depth your team needs." text="Plan details should be confirmed before purchase; Meta messaging charges and policies may apply separately." />
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className={`relative rounded-2xl border bg-white p-7 ${plan.featured ? "border-primary shadow-[0_18px_50px_rgba(21,104,91,0.12)]" : "border-slate-200"}`}>
                {plan.featured && <span className="absolute right-5 top-5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">Most complete</span>}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-4 text-4xl font-semibold tracking-tight">{plan.price}</p>
                <p className="mt-2 text-sm text-slate-500">{plan.note}</p>
                <ul className="mt-7 space-y-3 border-t border-slate-200 pt-6 text-sm text-slate-700">
                  {plan.items.map((item) => <li key={item} className="flex items-center gap-3"><Check className="size-4 text-primary" /> {item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:px-6 lg:grid-cols-[0.7fr_1.3fr]">
        <SectionTitle eyebrow="Questions" title="Straight answers before you connect anything." text="If your question involves private account or WhatsApp details, contact support without including those details in your message." />
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {faqs.map((faq) => <details key={faq.question} className="group py-5"><summary className="cursor-pointer list-none pr-6 text-base font-semibold text-slate-950 marker:hidden">{faq.question}</summary><p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{faq.answer}</p></details>)}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-emerald-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-4 py-14 md:flex-row md:items-center md:justify-between md:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Ready to evaluate Zario?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Create a workspace or ask a specific setup question.</h2>
            <p className="mt-3 text-base leading-7 text-emerald-100/75">Never include passwords or private WhatsApp connection details in an email.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="bg-white text-emerald-950 hover:bg-emerald-50"><Link href="/signup">Create account</Link></Button>
            <Button asChild variant="outline" className="border-emerald-700 bg-transparent text-white hover:bg-emerald-900 hover:text-white"><Link href="/contact">Contact support</Link></Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-emerald-200/30 blur-2xl" />
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.14)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><p className="text-sm font-semibold text-slate-900">Operations overview</p><p className="text-xs text-slate-500">Illustrative product preview</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Connected</span></div>
        <div className="grid min-h-[380px] sm:grid-cols-[170px_1fr]">
          <div className="hidden border-r border-slate-200 bg-slate-50 p-4 sm:block">{["Overview", "Inbox", "Bookings", "Customers", "Reports"].map((item, index) => <div key={item} className={`mb-2 rounded-lg px-3 py-2 text-sm ${index === 1 ? "bg-primary font-medium text-white" : "text-slate-500"}`}>{item}</div>)}</div>
          <div className="p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-3"><MiniMetric label="Open chats" value="7" /><MiniMetric label="Bookings today" value="12" /><MiniMetric label="Needs reply" value="3" /></div>
            <div className="mt-4 rounded-xl border border-slate-200"><div className="flex items-center justify-between border-b border-slate-200 px-4 py-3"><span className="text-sm font-semibold">Recent activity</span><span className="text-xs text-slate-400">Live workspace</span></div><div className="divide-y divide-slate-100"><Activity name="Ayesha Khan" detail="Asked to reschedule" time="2m" color="bg-violet-100 text-violet-700" /><Activity name="Reminder flow" detail="3 reminders delivered" time="8m" color="bg-emerald-100 text-emerald-700" /><Activity name="Hamza Ali" detail="Booking confirmed" time="14m" color="bg-sky-100 text-sky-700" /></div></div>
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-950 p-4 text-white"><div className="grid size-9 place-items-center rounded-lg bg-emerald-400/20 text-emerald-300"><MessageCircle className="size-4" /></div><div><p className="text-sm font-medium">Conversation context stays attached</p><p className="text-xs text-slate-400">Messages, consent, and bookings in one view</p></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustPoint({ children }: { children: React.ReactNode }) { return <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-primary" />{children}</span>; }
function MiniMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-950">{value}</p></div>; }
function Activity({ name, detail, time, color }: { name: string; detail: string; time: string; color: string }) { return <div className="flex items-center gap-3 px-4 py-3"><span className={`grid size-9 place-items-center rounded-full text-xs font-semibold ${color}`}>{name.charAt(0)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-900">{name}</p><p className="truncate text-xs text-slate-500">{detail}</p></div><span className="text-xs text-slate-400">{time}</span></div>; }
function TrustItem({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) { return <div className="flex gap-3"><Icon className="mt-0.5 size-5 shrink-0 text-emerald-300" /><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-400">{text}</p></div></div>; }
function ProcessCard({ icon: Icon, label, text }: { icon: typeof KeyRound; label: string; text: string }) { return <article className="rounded-2xl border border-slate-200 p-6"><Icon className="size-6 text-primary" /><h3 className="mt-6 text-xl font-semibold">{label}</h3><p className="mt-3 text-base leading-7 text-slate-600">{text}</p></article>; }
function SecurityCard({ title, text }: { title: string; text: string }) { return <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><CheckCircle2 className="size-5 text-primary" /><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>; }
function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) { return <div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.025em] text-slate-950 md:text-4xl">{title}</h2><p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{text}</p></div>; }
