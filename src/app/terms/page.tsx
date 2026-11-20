import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using Zario as a business customer.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="November 20, 2026">
      <section>
        <h2>1. Agreement</h2>
        <p>
          These terms apply when you create an account or use Zario. If you use
          Zario for a business, you confirm that you are allowed to accept these
          terms for that business. Zario is operated by Farrukh Ali in Karachi,
          Pakistan.
        </p>
      </section>

      <section>
        <h2>2. Your account</h2>
        <p>
          You must provide accurate information, keep your password private, and
          tell us promptly if you believe someone has accessed your account
          without permission. Each team member should use their own staff account.
          You are responsible for activity carried out by people you authorize.
        </p>
      </section>

      <section>
        <h2>3. Responsible messaging</h2>
        <p>
          You may only contact people when you have a lawful reason and any
          required permission to do so. You must respect unsubscribe requests and
          follow applicable laws and Meta and WhatsApp rules. You may not use
          Zario for spam, scams, harassment, misleading messages, illegal goods,
          or other unlawful activity.
        </p>
      </section>

      <section>
        <h2>4. Your content and customer data</h2>
        <p>
          You keep ownership of the business and customer information you add to
          Zario. You give us permission to process that information only as needed
          to provide, protect, and improve the service. You are responsible for
          the accuracy of your records and for responding to your customers&apos;
          valid privacy requests.
        </p>
      </section>

      <section>
        <h2>5. Plans, charges, and cancellation</h2>
        <p>
          The price and features of a plan are shown before purchase. Taxes, Meta
          messaging charges, and other third-party fees may be separate unless we
          clearly say they are included. You may cancel future renewal according
          to the billing options available in your account. Amounts already paid
          are not refundable unless required by law or stated otherwise at the
          time of purchase.
        </p>
      </section>

      <section>
        <h2>6. Service availability</h2>
        <p>
          We work to keep Zario available and secure, but maintenance, internet
          failures, third-party outages, or unexpected problems may interrupt the
          service. We may change or discontinue a feature when necessary and will
          give reasonable notice when a change materially affects normal use.
        </p>
      </section>

      <section>
        <h2>7. Things you must not do</h2>
        <p>
          You must not try to bypass security, access another business&apos;s data,
          disrupt the service, upload harmful software, copy protected parts of
          Zario, or use the service in a way that breaks the law or another
          person&apos;s rights.
        </p>
      </section>

      <section>
        <h2>8. Other services</h2>
        <p>
          Zario relies on third-party services such as WhatsApp, Meta, hosting,
          databases, email, monitoring, and payment providers. Their own terms,
          policies, prices, and availability also apply. We are not responsible
          for changes or outages in services we do not control.
        </p>
      </section>

      <section>
        <h2>9. Suspension and account closure</h2>
        <p>
          We may limit or suspend an account to protect users, investigate misuse,
          address unpaid charges, or comply with legal requirements. You may stop
          using Zario at any time and may request deletion through our{" "}
          <Link href="/data-deletion">Data Deletion Instructions</Link>.
        </p>
      </section>

      <section>
        <h2>10. Our responsibility</h2>
        <p>
          To the extent allowed by law, Zario is provided without a promise that
          it will always be available or error-free. We are not responsible for
          indirect losses, lost profits, or losses caused by your misuse of the
          service or by third-party services. Nothing in these terms removes any
          rights that cannot legally be excluded.
        </p>
      </section>

      <section>
        <h2>11. Privacy, changes, and contact</h2>
        <p>
          Our <Link href="/privacy">Privacy Policy</Link> explains how we handle
          personal information. We may update these terms and will show the latest
          revision date above. For questions, email{" "}
          <a href="mailto:support@zario.app">support@zario.app</a>.
        </p>
      </section>
    </LegalPage>
  );
}
