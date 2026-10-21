import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Zario",
  description: "How Zario collects, uses, stores, and protects personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="October 21, 2026">
      <section>
        <h2>1. Who we are</h2>
        <p>
          Zario is a business operations and WhatsApp automation service operated
          by Farrukh Ali in Karachi, Pakistan. This policy explains how Zario
          processes information when businesses and their authorized team members
          use the service.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <ul>
          <li>Account details such as name, email address, phone number, and login information.</li>
          <li>Business profile, locations, working hours, staff, services, and subscription records.</li>
          <li>Customer records entered by a business, including names, phone numbers, consent status, bookings, and notes.</li>
          <li>WhatsApp message content, templates, delivery events, identifiers, and connection credentials required to provide messaging features.</li>
          <li>Operational information such as IP address, browser details, security logs, errors, and feature usage.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <p>
          We use information to operate and secure Zario, deliver messages and
          automations requested by a business, manage bookings and customer
          records, provide support, prevent misuse, diagnose errors, and comply
          with legal obligations. We do not sell personal information.
        </p>
      </section>

      <section>
        <h2>4. WhatsApp and Meta data</h2>
        <p>
          When a business connects WhatsApp, Zario processes data on that
          business&apos;s instructions. WhatsApp services are also governed by Meta&apos;s
          own terms and privacy policies. Each business is responsible for having
          a valid legal basis and customer consent before sending messages.
        </p>
      </section>

      <section>
        <h2>5. Service providers and transfers</h2>
        <p>
          We use infrastructure, database, hosting, monitoring, email, and Meta
          WhatsApp service providers to operate Zario. These providers may process
          data in countries outside Pakistan under their applicable safeguards.
          We disclose information when legally required or necessary to protect
          users, Zario, or the public.
        </p>
      </section>

      <section>
        <h2>6. Retention and security</h2>
        <p>
          We retain information while an account is active and as reasonably
          needed for service delivery, security, dispute resolution, backups, and
          legal compliance. We use access controls, encrypted transport, and
          encrypted storage for sensitive WhatsApp credentials. No online system
          can guarantee absolute security.
        </p>
      </section>

      <section>
        <h2>7. Your choices and rights</h2>
        <p>
          Account owners may request access, correction, export, or deletion of
          their information. A business controls the customer records it uploads
          to Zario, so customers should normally direct requests to that business.
          See our <Link href="/data-deletion">Data Deletion Instructions</Link>.
        </p>
      </section>

      <section>
        <h2>8. Children</h2>
        <p>
          Zario is a business service and is not directed to children. Businesses
          must not knowingly use Zario to collect children&apos;s information without
          the authority and consent required by applicable law.
        </p>
      </section>

      <section>
        <h2>9. Changes and contact</h2>
        <p>
          We may update this policy and will revise the date above when we do. For
          privacy questions or requests, email{" "}
          <a href="mailto:support@zario.app">support@zario.app</a>.
        </p>
      </section>
    </LegalPage>
  );
}
