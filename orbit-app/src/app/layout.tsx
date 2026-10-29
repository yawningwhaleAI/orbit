import type { Metadata } from "next";
import Script from "next/script";
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
// Set in Vercel env vars; each integration is skipped when its var is empty.
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;
const GOOGLE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Orbit — the professional network inside your building",
    template: "%s · Orbit",
  },
  description:
    "The professional network for the people inside your building. Every week Orbit finds three people worth meeting and books a 30-minute coffee downstairs.",
  applicationName: "Orbit",
  openGraph: {
    title: "Orbit — the professional network inside your building",
    description:
      "Every week Orbit finds three people worth meeting in your building and books a 30-minute coffee. Not a feed.",
    url: SITE,
    siteName: "Orbit",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Orbit — the professional network inside your building",
    description:
      "Every week Orbit finds three people worth meeting in your building and books a 30-minute coffee.",
  },
  icons: { icon: "/icon.svg" },
  ...(GOOGLE_VERIFICATION ? { verification: { google: GOOGLE_VERIFICATION } } : {}),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        {children}
        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(CLARITY_ID)});`}
          </Script>
        )}
      </body>
    </html>
  );
}
