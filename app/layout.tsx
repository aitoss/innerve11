import type { Metadata, Viewport } from "next";
import "./globals.css";
import Script from "next/script";
export const metadata: Metadata = {
  title: "Innerve 11",
  description:
    "Selected sections from the Innerve 11 hackathon site (Demon Slayer fan build): Infinity Castle, prize pool, testimonials, past sponsors and footer.",
  icons: { icon: [{ url: "/assets/logos/favicon.svg?v=2", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0a0c",
};

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;800&family=Shippori+Mincho+B1:wght@800&family=Yuji+Syuku&display=swap";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Browser extensions can add attributes to the root before React loads.
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* React hoists these link tags into <head>; kept identical to the static build */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_URL} rel="stylesheet" />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C9RLSHB45B"
          strategy="afterInteractive"
        />

        {/* Initialize GA */}
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C9RLSHB45B');
          `}
        </Script>
        <script defer src="https://apply.devfolio.co/v2/sdk.js"></script>
      </body>
    </html>
  );
}
