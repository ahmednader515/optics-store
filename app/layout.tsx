import { Cairo } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/shared/client-providers";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import data from "@/lib/data";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata() {
  const {
    site: { slogan, name, description, url },
  } = data.settings[0];
  return {
    title: {
      template: `%s | ${name}`,
      default: `${name}. ${slogan}`,
    },
    description: description,
    metadataBase: new URL(url),
    icons: {
      icon: [
        { url: '/icons/logo.png', sizes: '32x32', type: 'image/png' },
        { url: '/icons/logo.png', sizes: '16x16', type: 'image/png' },
      ],
      shortcut: '/icons/logo.png',
      apple: '/icons/logo.png',
    },
  };
}

export const dynamic = 'force-dynamic'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setting = data.settings[0];
  const currencyCookie = (await cookies()).get("currency");
  const currency = currencyCookie ? currencyCookie.value : "EGP";
  
  // Do not pass a server session to avoid hydration drift; client will resolve it

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className={`min-h-screen ${cairo.variable} font-cairo antialiased`}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
