import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal"],
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EIG Frontend",
  description: "Frontend Next.js connecte a l'API Laravel",
  icons: {
    icon: [{ url: "/eig-logo.svg", type: "image/svg+xml" }],
    shortcut: "/eig-logo.svg",
    apple: "/eig-logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${poppins.className} h-full antialiased`}
    >
      <body className="min-h-full bg-white text-slate-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
