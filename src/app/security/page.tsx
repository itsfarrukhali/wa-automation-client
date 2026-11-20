import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = {
  title: "Security",
  description: "How Zario protects accounts, sessions, credentials, and production operations.",
};

export default function SecurityPage() {
  return (
    <LegalPage title="Security at Zario" updated="November 20, 2026">
      <section>
        <h2>Security model</h2>
        <p>Zario uses layered controls. A browser navigation hint may improve routing, but it is never accepted as proof of identity. Protected backend requests independently verify the access token, account state, email verification, role, and business scope.</p>
      </section>
      <section>
        <h2>Sessions and authentication</h2>
        <ul>
          <li>Short-lived access tokens are held in application memory rather than persistent JavaScript-readable browser storage.</li>
          <li>Session restoration uses a secure, httpOnly refresh cookie that browser scripts cannot read.</li>
          <li>Refresh tokens rotate and are stored as hashes in the database.</li>
          <li>Password reset and password change invalidate existing sessions.</li>
          <li>Repeated failed login attempts trigger temporary account locking.</li>
        </ul>
      </section>
      <section>
        <h2>WhatsApp credentials</h2>
        <p>Permanent access tokens and connection secrets are submitted only through authenticated settings and encrypted before database storage. Zario support will not ask you to send a password, access token, private key, or refresh token through email or chat.</p>
      </section>
      <section>
        <h2>Application and infrastructure controls</h2>
        <ul>
          <li>Tenant-scoped database queries and role checks restrict business data access.</li>
          <li>CORS permits the configured production frontend rather than arbitrary browser origins.</li>
          <li>Security headers restrict framing, browser capabilities, MIME sniffing, and referrer leakage.</li>
          <li>Production health, database and Redis readiness, unauthenticated guards, CORS, and core workflows are checked by automated smoke tests.</li>
          <li>Frontend and backend application errors are captured in separate monitored projects.</li>
        </ul>
      </section>
      <section>
        <h2>Responsible reporting</h2>
        <p>If you believe you found a security issue, email <a href="mailto:support@zario.app?subject=Security%20report">support@zario.app</a> with a clear description and reproduction steps. Do not include live customer data, credentials, or destructive proof.</p>
      </section>
    </LegalPage>
  );
}
