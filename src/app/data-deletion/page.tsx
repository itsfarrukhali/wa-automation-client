import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Data Deletion Instructions | Zario",
  description: "How to request deletion of data associated with a Zario account.",
};

export default function DataDeletionPage() {
  return (
    <LegalPage title="Data Deletion Instructions" updated="October 21, 2026">
      <section>
        <h2>Request deletion</h2>
        <p>
          To request deletion of a Zario account or data associated with a Meta or
          WhatsApp connection, email{" "}
          <a href="mailto:support@zario.app?subject=Zario%20data%20deletion%20request">
            support@zario.app
          </a>{" "}
          from the email address registered with Zario. Use the subject
          &quot;Zario data deletion request&quot;.
        </p>
        <p>Include the following information:</p>
        <ul>
          <li>Your full name and registered Zario email address.</li>
          <li>Your business name and connected WhatsApp business number.</li>
          <li>Whether you want specific data removed or the entire account deleted.</li>
        </ul>
      </section>

      <section>
        <h2>Verification and processing</h2>
        <p>
          We may ask for additional information to verify that the requester owns
          or administers the account. After verification, we will process the
          request within 30 days and confirm completion by email. We may retain
          limited records where required for security, fraud prevention, dispute
          resolution, or legal compliance. Backup copies are removed through the
          normal backup-retention cycle.
        </p>
      </section>

      <section>
        <h2>What deletion covers</h2>
        <p>
          Depending on the request, deletion can cover the Zario account,
          business profile, staff records, customer records, bookings, messages,
          automation settings, and stored WhatsApp connection credentials. Data
          held independently by Meta, WhatsApp, a merchant, or another provider
          is governed by that party&apos;s retention process and may require a separate
          request.
        </p>
      </section>

      <section>
        <h2>Disconnect Meta or WhatsApp</h2>
        <p>
          You may also remove Zario&apos;s access from your Meta Business settings.
          Removing access stops future API access but does not automatically
          replace a deletion request for information already stored in Zario.
        </p>
      </section>

      <section>
        <h2>Privacy questions</h2>
        <p>
          For more information about our data practices, read the{" "}
          <Link href="/privacy">Zario Privacy Policy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
