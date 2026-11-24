"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { AlertTriangle, Bell, BriefcaseBusiness, CheckCircle2, Clock3, Loader2, PlugZap, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Field } from "@/components/onboarding/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api";
import {
  getMyBusinessProfile,
  getWhatsAppConnectionStatus,
  reconnectWhatsApp,
  updateBusinessEngagement,
  updateBusinessProfile,
  updateBusinessSettings,
  updateWorkingHoursDay,
  type BusinessProfile,
  type WhatsAppConnectionStatus,
  type WorkingHoursDay,
} from "@/lib/business-profile";

const dayLabels: Record<WorkingHoursDay["day"], string> = {
  mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday",
  fri: "Friday", sat: "Saturday", sun: "Sunday",
};
const defaultHours = (Object.keys(dayLabels) as WorkingHoursDay["day"][]).map((day) => ({
  day, isOpen: day !== "sun", openTime: "09:00", closeTime: "18:00",
}));

function messageFrom(error: unknown, fallback: string) {
  return error instanceof ApiError || error instanceof Error ? error.message : fallback;
}

export default function SettingsPage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState({ name: "", phone: "", landline: "", email: "" });
  const [preferences, setPreferences] = useState({
    emailNotifications: true, whatsappNotifications: true,
    language: "ur" as "en" | "ur", currency: "PKR",
  });
  const [hours, setHours] = useState<WorkingHoursDay[]>(defaultHours);
  const [engagement, setEngagement] = useState({
    reminderTime: 24, followUpDays: 7, winbackDays: 30,
    reviewRequestEnabled: true,
    reviewPlatform: "google" as "google" | "facebook" | "custom",
  });
  const [timezone, setTimezone] = useState("Asia/Karachi");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingSection, setSavingSection] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [connectedNumber, setConnectedNumber] = useState("");
  const [connection, setConnection] = useState<WhatsAppConnectionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [showReconnect, setShowReconnect] = useState(false);

  const applyBusiness = useCallback((business: BusinessProfile) => {
    setProfile({
      name: business.name || "", phone: business.phone || "",
      landline: business.landline || "", email: business.email || "",
    });
    setPreferences({
      emailNotifications: business.settings?.notifications?.email ?? true,
      whatsappNotifications: business.settings?.notifications?.whatsapp ?? true,
      language: business.settings?.language ?? "ur",
      currency: business.settings?.currency ?? "PKR",
    });
    setHours(business.workingHours?.length ? business.workingHours : defaultHours);
    setEngagement({
      reminderTime: business.engagement?.reminderTime ?? 24,
      followUpDays: business.engagement?.followUpDays ?? 7,
      winbackDays: business.engagement?.winbackDays ?? 30,
      reviewRequestEnabled: business.engagement?.reviewRequestEnabled ?? true,
      reviewPlatform: business.engagement?.reviewPlatform ?? "google",
    });
    setTimezone(business.timezone || "Asia/Karachi");
  }, []);

  const loadConnection = useCallback(async () => {
    if (!token) return;
    setIsChecking(true);
    try {
      const result = await getWhatsAppConnectionStatus(token);
      setConnection(result);
      setShowReconnect(result.health === "invalid" || result.health === "not_configured");
    } catch (err) {
      setError(messageFrom(err, "Connection check failed"));
    } finally {
      setIsChecking(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    getMyBusinessProfile(token)
      .then((business) => {
        if (!active) return;
        applyBusiness(business);
      })
      .catch((err) => active && setError(messageFrom(err, "Settings could not be loaded")))
      .finally(() => {
        if (active) setLoadingProfile(false);
      });
    getWhatsAppConnectionStatus(token)
      .then((status) => {
        if (!active) return;
        setConnection(status);
        setShowReconnect(
          status.health === "invalid" || status.health === "not_configured",
        );
      })
      .catch((err) => {
        if (active) setError(messageFrom(err, "Connection check failed"));
      })
      .finally(() => {
        if (active) setIsChecking(false);
      });
    return () => { active = false; };
  }, [applyBusiness, token]);

  async function save(section: string, task: () => Promise<BusinessProfile>, success: string) {
    setError(""); setNotice(""); setSavingSection(section);
    try {
      const business = await task();
      applyBusiness(business);
      setNotice(success);
    } catch (err) {
      setError(messageFrom(err, "Settings could not be saved"));
    } finally {
      setSavingSection("");
    }
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body: { name: string; phone?: string; landline?: string; email?: string } = { name: profile.name.trim() };
    if (profile.phone.trim()) body.phone = profile.phone.trim();
    if (profile.landline.trim()) body.landline = profile.landline.trim();
    if (profile.email.trim()) body.email = profile.email.trim();
    await save("profile", () => updateBusinessProfile(body, token as string), "Business profile saved.");
  }

  async function savePreferences(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await save("preferences", () => updateBusinessSettings({
      notifications: { email: preferences.emailNotifications, whatsapp: preferences.whatsappNotifications },
      language: preferences.language,
      currency: preferences.currency.trim().toUpperCase(),
    }, token as string), "Preferences saved.");
  }

  async function saveHours() {
    await save("hours", async () => {
      let updatedBusiness: BusinessProfile | null = null;
      for (const { day, isOpen, openTime, closeTime } of hours) {
        updatedBusiness = await updateWorkingHoursDay(
          day,
          { isOpen, openTime, closeTime },
          token as string,
        );
      }
      return updatedBusiness as BusinessProfile;
    }, "Working hours saved.");
  }

  async function saveEngagement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await save("engagement", () => updateBusinessEngagement(engagement, token as string), "Engagement automation saved.");
  }

  async function handleReconnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setError(""); setNotice(""); setConnectedNumber(""); setSavingSection("whatsapp");
    try {
      const business = await reconnectWhatsApp({
        phoneNumberId: String(form.get("phoneNumberId") ?? "").trim(),
        wabaId: String(form.get("wabaId") ?? "").trim(),
        accessToken: String(form.get("accessToken") ?? "").trim(),
      }, token as string);
      setConnectedNumber(business.whatsapp?.displayPhoneNumber || "Connected");
      formElement.reset(); setShowReconnect(false); await loadConnection();
    } catch (err) {
      setError(messageFrom(err, "Connection failed"));
    } finally {
      setSavingSection("");
    }
  }

  if (loadingProfile) {
    return <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-5 animate-spin" />Loading business settings...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage business details, notifications, automation, and WhatsApp.</p>
      </div>

      {error && <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
      {notice && <div role="status" className="flex items-center gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"><CheckCircle2 className="size-4" />{notice}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BriefcaseBusiness className="size-4" />Business profile</CardTitle><p className="text-sm text-muted-foreground">Details your team sees while managing customers.</p></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={saveProfile}>
              <Field label="Business name"><Input required maxLength={150} value={profile.name} onChange={(e) => setProfile((v) => ({ ...v, name: e.target.value }))} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Mobile number" hint="Use a Pakistani mobile number."><Input type="tel" value={profile.phone} onChange={(e) => setProfile((v) => ({ ...v, phone: e.target.value }))} /></Field>
                <Field label="Landline"><Input type="tel" value={profile.landline} onChange={(e) => setProfile((v) => ({ ...v, landline: e.target.value }))} /></Field>
              </div>
              <Field label="Business email"><Input type="email" value={profile.email} onChange={(e) => setProfile((v) => ({ ...v, email: e.target.value }))} /></Field>
              <Button disabled={savingSection === "profile"} type="submit">{savingSection === "profile" && <Loader2 className="size-4 animate-spin" />}Save profile</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Bell className="size-4" />Preferences</CardTitle><p className="text-sm text-muted-foreground">Choose how your business receives operational updates.</p></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={savePreferences}>
              <ToggleRow title="Email notifications" description="Receive account and workflow updates by email." checked={preferences.emailNotifications} onChange={(checked) => setPreferences((v) => ({ ...v, emailNotifications: checked }))} />
              <ToggleRow title="WhatsApp notifications" description="Allow business notifications through WhatsApp." checked={preferences.whatsappNotifications} onChange={(checked) => setPreferences((v) => ({ ...v, whatsappNotifications: checked }))} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Dashboard language"><select aria-label="Dashboard language" value={preferences.language} onChange={(e) => setPreferences((v) => ({ ...v, language: e.target.value as "en" | "ur" }))} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="en">English</option><option value="ur">Urdu</option></select></Field>
                <Field label="Currency"><Input required minLength={3} maxLength={3} value={preferences.currency} onChange={(e) => setPreferences((v) => ({ ...v, currency: e.target.value.toUpperCase() }))} /></Field>
              </div>
              <Button disabled={savingSection === "preferences"} type="submit">{savingSection === "preferences" && <Loader2 className="size-4 animate-spin" />}Save preferences</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Clock3 className="size-4" />Working hours</CardTitle><p className="text-sm text-muted-foreground">Times are saved in {timezone}. Closed days are excluded from normal availability.</p></CardHeader>
        <CardContent className="space-y-4">
          <div className="divide-y rounded-md border">
            {hours.map((item, index) => (
              <div key={item.day} className="grid gap-3 p-3 sm:grid-cols-[minmax(120px,1fr)_auto_140px_140px] sm:items-center">
                <span className="font-medium">{dayLabels[item.day]}</span>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="size-4" checked={item.isOpen} onChange={(e) => setHours((values) => values.map((value, i) => i === index ? { ...value, isOpen: e.target.checked } : value))} />Open</label>
                <Input aria-label={`${dayLabels[item.day]} opening time`} type="time" disabled={!item.isOpen} value={item.openTime} onChange={(e) => setHours((values) => values.map((value, i) => i === index ? { ...value, openTime: e.target.value } : value))} />
                <Input aria-label={`${dayLabels[item.day]} closing time`} type="time" disabled={!item.isOpen} value={item.closeTime} onChange={(e) => setHours((values) => values.map((value, i) => i === index ? { ...value, closeTime: e.target.value } : value))} />
              </div>
            ))}
          </div>
          <Button disabled={savingSection === "hours"} type="button" onClick={saveHours}>{savingSection === "hours" && <Loader2 className="size-4 animate-spin" />}Save working hours</Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="size-4" />Engagement automation</CardTitle><p className="text-sm text-muted-foreground">Control booking and customer follow-up timing.</p></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={saveEngagement}>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Reminder hours"><Input required type="number" min={1} max={72} value={engagement.reminderTime} onChange={(e) => setEngagement((v) => ({ ...v, reminderTime: Number(e.target.value) }))} /></Field>
                <Field label="Follow-up days"><Input required type="number" min={1} max={30} value={engagement.followUpDays} onChange={(e) => setEngagement((v) => ({ ...v, followUpDays: Number(e.target.value) }))} /></Field>
                <Field label="Win-back days"><Input required type="number" min={7} max={180} value={engagement.winbackDays} onChange={(e) => setEngagement((v) => ({ ...v, winbackDays: Number(e.target.value) }))} /></Field>
              </div>
              <ToggleRow title="Request reviews" description="Ask after a completed appointment." checked={engagement.reviewRequestEnabled} onChange={(checked) => setEngagement((v) => ({ ...v, reviewRequestEnabled: checked }))} />
              <Field label="Review platform"><select aria-label="Review platform" value={engagement.reviewPlatform} onChange={(e) => setEngagement((v) => ({ ...v, reviewPlatform: e.target.value as typeof v.reviewPlatform }))} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="google">Google</option><option value="facebook">Facebook</option><option value="custom">Custom link</option></select></Field>
              <Button disabled={savingSection === "engagement"} type="submit">{savingSection === "engagement" && <Loader2 className="size-4 animate-spin" />}Save automation</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PlugZap className="size-4" />WhatsApp connection</CardTitle><p className="text-sm text-muted-foreground">Credentials are protected and never displayed after saving.</p></CardHeader>
          <CardContent className="space-y-4">
            {isChecking ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Checking stored connection...</div> : connection?.health === "healthy" ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-3 text-sm text-emerald-900"><CheckCircle2 className="mt-0.5 size-4 shrink-0" /><div><p className="font-medium">Connected and verified</p><p>{connection.verifiedName || "WhatsApp Business"}{connection.displayPhoneNumber ? ` · ${connection.displayPhoneNumber}` : ""}{connection.wabaIdSuffix ? ` · WABA …${connection.wabaIdSuffix}` : ""}</p></div></div>
                <div className="flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={loadConnection}><RefreshCw className="size-4" />Check connection</Button><Button type="button" variant="ghost" onClick={() => setShowReconnect((value) => !value)}>Replace credentials</Button></div>
              </div>
            ) : connection ? <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-900"><AlertTriangle className="mt-0.5 size-4 shrink-0" /><div><p className="font-medium">{connection.health === "unreachable" ? "Meta check temporarily unavailable" : "WhatsApp connection needs attention"}</p><p>{connection.error || "Connect WhatsApp credentials."}</p></div></div> : null}
            {showReconnect && <form className="space-y-4 border-t pt-4" onSubmit={handleReconnect}>
              <Field label="Phone Number ID"><Input name="phoneNumberId" required autoComplete="off" /></Field>
              <Field label="WhatsApp Business Account ID (WABA ID)"><Input name="wabaId" required autoComplete="off" /></Field>
              <Field label="Permanent access token"><Input name="accessToken" type="password" required minLength={50} autoComplete="new-password" /></Field>
              {connectedNumber && <p className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800"><CheckCircle2 className="size-4" />Connected to {connectedNumber}</p>}
              <Button type="submit" disabled={savingSection === "whatsapp"}>{savingSection === "whatsapp" ? <Loader2 className="size-4 animate-spin" /> : <PlugZap className="size-4" />}Verify and connect</Button>
            </form>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between gap-4 rounded-md border p-3 text-sm"><span><span className="block font-medium">{title}</span><span className="text-xs text-muted-foreground">{description}</span></span><input type="checkbox" className="size-4" checked={checked} onChange={(event) => onChange(event.target.checked)} /></label>;
}
