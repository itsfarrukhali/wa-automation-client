import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Zario collects, uses, shares, and protects personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 20, 2026">
      <section>
        <h2>1. About this policy</h2>
        <p>
          Zario is a business management and WhatsApp automation service operated
          by Farrukh Ali in Karachi, Pakistan. This policy explains what
          information we collect, why we need it, and the choices available to
          businesses and their customers.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <ul>
          <li>Your name, email address, phone number, and account details.</li>
          <li>Your business details, services, staff, working hours, and billing records.</li>
          <li>Customer details added by your business, such as names, phone numbers, bookings, consent choices, and notes.</li>
          <li>WhatsApp conversations, message templates, delivery updates, and the information needed to connect your WhatsApp Business account.</li>
          <li>Basic device, browser, usage, and error information that helps us keep Zario reliable and secure.</li>
        </ul>
      </section>

      <section>
        <h2>3. How we use information</h2>
        <p>We use this information to:</p>
        <ul>
          <li>provide the features you choose to use;</li>
          <li>send messages and reminders requested by your business;</li>
          <li>manage bookings, customers, staff, and reports;</li>
          <li>provide support and important service updates;</li>
          <li>protect accounts, prevent misuse, and fix problems; and</li>
          <li>meet legal and financial record-keeping requirements.</li>
        </ul>
        <p>We do not sell your personal information.</p>
      </section>

      <section>
        <h2>4. WhatsApp and customer information</h2>
        <p>
          A business decides what customer information it adds to Zario and what
          messages it sends. That business is responsible for having permission
          to contact its customers and for respecting unsubscribe requests.
          WhatsApp and Meta also process information under their own terms and
          privacy policies.
        </p>
      </section>

      <section>
        <h2>5. When information is shared</h2>
        <p>
          We share information only when needed to operate Zario—for example with
          hosting, database, email, monitoring, payment, and WhatsApp service
          providers. These providers may operate in other countries and may only
          use the information to provide their services to us. We may also share
          information when required by law or when necessary to prevent fraud,
          abuse, or harm.
        </p>
      </section>

      <section>
        <h2>6. How long we keep information</h2>
        <p>
          We keep information while an account is active and for a reasonable
          period afterward when needed for backups, security, billing, disputes,
          or legal requirements. When information is no longer needed, we delete
          it or remove identifying details from it.
        </p>
      </section>

      <section>
        <h2>7. How we protect information</h2>
        <p>
          We use account controls, secure connections, restricted staff access,
          monitoring, and encryption for sensitive WhatsApp connection details.
          No online service can promise complete security, so you should use a
          strong password and keep your account details private.
        </p>
      </section>

      <section>
        <h2>8. Your choices</h2>
        <p>
          Account owners may ask to access, correct, export, or delete their
          information. If you are a customer of a business that uses Zario,
          contact that business first because it controls your customer record.
          You can also read our <Link href="/data-deletion">Data Deletion Instructions</Link>.
        </p>
      </section>

      <section>
        <h2>9. Children</h2>
        <p>
          Zario is intended for business users, not children. Businesses must not
          add children&apos;s information unless they have the permission required by
          applicable law.
        </p>
      </section>

      <section>
        <h2>10. Updates and contact</h2>
        <p>
          We may update this policy as Zario changes. The latest revision date is
          shown above. For privacy questions or requests, email{" "}
          <a href="mailto:support@zario.app">support@zario.app</a>.
        </p>
      </section>
    </LegalPage>
  );
}
