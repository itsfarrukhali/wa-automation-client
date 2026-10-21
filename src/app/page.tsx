import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  Check,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Inbox that stays organized",
    text: "Keep customer chats, booking requests, and follow-ups in one simple queue.",
    icon: MessageCircle,
  },
  {
    title: "Bookings without back-and-forth",
    text: "Confirm, reschedule, and remind customers from the same operational screen.",
    icon: CalendarCheck,
  },
  {
    title: "Customer history",
    text: "See visits, tags, and recent conversations before you reply.",
    icon: Users,
  },
  {
    title: "Campaigns with control",
    text: "Send practical WhatsApp campaigns without losing track of consent and replies.",
    icon: Workflow,
  },
  {
    title: "Useful reporting",
    text: "Watch confirmations, revenue, open conversations, and staff workload.",
    icon: BarChart3,
  },
  {
    title: "Built for teams",
    text: "Staff permissions and audit trails keep everyday work accountable.",
    icon: ShieldCheck,
  },
];

const plans = [
  {
    name: "Starter",
    price: "Rs 4,500",
    note: "For small service teams",
    items: ["WhatsApp inbox", "Bookings", "Basic reminders", "Customer list"],
  },
  {
    name: "Growth",
    price: "Rs 9,500",
    note: "For active businesses",
    items: ["Campaigns", "Automation rules", "Reports", "Staff roles"],
    featured: true,
  },
  {
    name: "Business",
    price: "Custom",
    note: "For multi-branch operations",
    items: ["Advanced controls", "Priority setup", "Template support", "Audit logs"],
  },
];

export default function MarketingHome() {
  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-primary text-sm font-bold text-white">
              Z
            </div>
            <span className="font-semibold">Zario</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Start</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 md:px-6 lg:grid-cols-[1fr_460px] lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">WhatsApp automation for service businesses</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-foreground md:text-6xl">
              Run bookings, replies, and reminders from one calm workspace.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Zario helps salons, clinics, consultants, and appointment-led teams manage WhatsApp work without messy spreadsheets or missed follow-ups.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button size="default" asChild>
                <Link href="/signup">
                  Create account
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">View dashboard</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-soft">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <div className="text-sm font-medium">Today</div>
                <div className="text-xs text-muted-foreground">Live operations</div>
              </div>
              <div className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Ready</div>
            </div>
            <div className="mt-4 grid gap-3">
              {["Ayesha asked to reschedule", "3 reminders sent", "2 bookings confirmed"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm">{item}</span>
                  <Check className="size-4 text-primary" />
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-md bg-muted p-4">
              <div className="text-sm font-medium">Open chats</div>
              <div className="mt-2 text-3xl font-semibold">7</div>
              <div className="mt-1 text-xs text-muted-foreground">4 can be handled by saved flows</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <SectionTitle eyebrow="Features" title="Everything needed for daily WhatsApp work." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <feature.icon className="size-5 text-primary" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">{feature.text}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="pricing" className="border-y bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <SectionTitle eyebrow="Pricing" title="Start small, upgrade when the queue gets busy." />
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.name} className={plan.featured ? "border-primary shadow-soft" : ""}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-semibold">{plan.price}</div>
                  <p className="text-sm text-muted-foreground">{plan.note}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    {plan.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="size-4 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:px-6 lg:grid-cols-2">
        <SectionTitle eyebrow="About" title="Made for businesses where every missed message costs money." />
        <p className="text-sm leading-7 text-muted-foreground">
          Zario is designed around practical service workflows: people asking for prices, moving appointments, confirming visits, and returning after a campaign. The product stays focused on helping teams respond faster and keep customer context close.
        </p>
      </section>

      <section id="contact" className="border-t bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 md:flex-row md:items-center md:justify-between md:px-6">
          <div>
            <h2 className="text-2xl font-semibold">Talk to us</h2>
            <p className="mt-2 text-sm text-muted-foreground">Set up WhatsApp operations for your team.</p>
          </div>
          <Button asChild>
            <a href="tel:+923001122334">
              <PhoneCall className="size-4" />
              Contact sales
            </a>
          </Button>
        </div>
      </section>

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between md:px-6">
          <span>Zario</span>
          <nav className="flex gap-5" aria-label="Legal">
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/data-deletion">Data Deletion</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-medium text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-normal">{title}</h2>
    </div>
  );
}
