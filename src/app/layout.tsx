import type { Metadata } from "next";
import { AuthProvider } from "@/components/auth-provider";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://zario-web.vercel.app"),
  title: {
    default: "Zario | WhatsApp operations for service businesses",
    template: "%s | Zario",
  },
  description:
    "Manage WhatsApp conversations, bookings, reminders, campaigns, and customer context from one focused workspace.",
  applicationName: "Zario",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Zario",
    title: "Zario | WhatsApp operations for service businesses",
    description:
      "A focused workspace for WhatsApp conversations, bookings, reminders, and customer operations.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
