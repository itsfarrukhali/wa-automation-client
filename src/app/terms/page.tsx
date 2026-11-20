import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing business use of the Zario service.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 20, 2026">
      <section><h2>1. Service and acceptance</h2><p>These terms govern use of Zario, a business operations and WhatsApp automation service operated by Farrukh Ali in Karachi, Pakistan. By creating an account or using the service, you agree to these terms on behalf of yourself and, where applicable, your business.</p></section>
      <section><h2>2. Account responsibilities</h2><p>You must provide accurate information, protect account credentials, use individual staff accounts instead of sharing owner credentials, and promptly report suspected unauthorized access. You are responsible for activity performed through your authorized accounts.</p></section>
      <section><h2>3. Messaging and consent</h2><p>You are responsible for obtaining and recording the consent or other legal basis required for customer communications. You must follow applicable law and Meta and WhatsApp policies, respect opt-outs, and avoid spam, deception, harassment, prohibited goods, or unlawful content.</p></section>
      <section><h2>4. Third-party services</h2><p>Zario depends on services including Meta WhatsApp, hosting, databases, email, and monitoring providers. Their availability, policies, pricing, and independent data practices may affect the service. Zario does not control those third-party systems.</p></section>
      <section><h2>5. Fees and plans</h2><p>Plan scope and fees are disclosed before purchase. Meta messaging charges, taxes, and third-party fees may apply separately unless explicitly included. We may change future pricing with reasonable notice; changes do not retroactively alter a paid period.</p></section>
      <section><h2>6. Availability and acceptable use</h2><p>We work to keep the service available but do not guarantee uninterrupted operation. You must not probe or bypass security, access another business&apos;s data, overload the service, upload malicious code, reverse engineer protected components, or use Zario for unlawful activity.</p></section>
      <section><h2>7. Data and privacy</h2><p>Our handling of personal information is described in the <Link href="/privacy">Privacy Policy</Link>. Account owners control the business and customer records they submit and are responsible for responding to their customers&apos; lawful data requests.</p></section>
      <section><h2>8. Suspension and termination</h2><p>We may restrict or suspend access when necessary to address security risk, non-payment, unlawful use, policy violations, or harm to users or infrastructure. You may request account deletion using our <Link href="/data-deletion">Data Deletion Instructions</Link>.</p></section>
      <section><h2>9. Liability and changes</h2><p>To the extent permitted by applicable law, Zario is provided without warranties of uninterrupted or error-free operation and is not liable for indirect or consequential loss. We may update these terms and will revise the date above. Material changes will be communicated through reasonable service channels.</p></section>
      <section><h2>10. Contact</h2><p>Questions about these terms can be sent to <a href="mailto:support@zario.app">support@zario.app</a>.</p></section>
    </LegalPage>
  );
}
