import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Security",
  description: "How Zario helps protect accounts, business information, and WhatsApp connections.",
};

export default function SecurityPage() {
  return (
    <LegalPage title="Security at Zario" updated="November 20, 2026">
      <section>
        <h2>Protecting your account</h2>
        <p>
          Zario checks that a person is signed in and has the right permission
          before showing protected business information. Repeated failed login
          attempts are temporarily blocked, and changing a password signs out
          existing sessions.
        </p>
      </section>

      <section>
        <h2>Protecting your information</h2>
        <ul>
          <li>Private information is sent over secure connections.</li>
          <li>Sensitive WhatsApp connection details are encrypted when stored.</li>
          <li>Owner and staff permissions help limit who can access business features.</li>
          <li>Each business&apos;s records are kept separate from other businesses.</li>
          <li>Important systems are monitored for errors and service problems.</li>
        </ul>
      </section>

      <section>
        <h2>What you should do</h2>
        <ul>
          <li>Use a strong, unique password and do not share it.</li>
          <li>Give each staff member their own account.</li>
          <li>Only enter WhatsApp connection details inside your Zario dashboard.</li>
          <li>Contact us immediately if you notice unexpected account activity.</li>
        </ul>
        <p>
          Zario support will never ask you to send your password or private
          WhatsApp connection details by email or chat.
        </p>
      </section>

      <section>
        <h2>Report a security concern</h2>
        <p>
          If you believe you found a security problem, email{" "}
          <a href="mailto:support@zario.app?subject=Security%20report">support@zario.app</a>{" "}
          with a clear description and the steps that caused it. Please do not
          include real customer information or attempt to damage or disrupt the
          service while testing.
        </p>
      </section>
    </LegalPage>
  );
}
