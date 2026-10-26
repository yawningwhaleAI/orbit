import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const SITE = "https://withinorbit.space";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Orbit — the professional network inside your building",
    template: "%s · Orbit",
  },
  description:
    "The professional network for the people inside your building. Every week Orbit finds three people worth meeting and books a 15-minute coffee downstairs.",
  applicationName: "Orbit",
  openGraph: {
    title: "Orbit — the professional network inside your building",
    description:
      "Every week Orbit finds three people worth meeting in your building and books a 15-minute coffee. Not a feed.",
    url: SITE,
    siteName: "Orbit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit — the professional network inside your building",
    description:
      "Every week Orbit finds three people worth meeting in your building and books a 15-minute coffee.",
  },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
