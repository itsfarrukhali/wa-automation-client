import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Zario Business Desk",
    short_name: "Zario",
    description:
      "Manage WhatsApp conversations, customers, and bookings from your phone.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#faf8f1",
    theme_color: "#0f766e",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
