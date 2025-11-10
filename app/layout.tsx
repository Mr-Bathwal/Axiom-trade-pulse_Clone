import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { AxiomNav } from "@/components/navigation/axiom-nav";
import { BottomBar } from "@/components/navigation/bottom-bar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Axiom Trade - The Gateway to DeFi",
  description: "Advanced trading platform with real-time analytics and order execution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0a0f] text-white`}>
        <Providers>
          <AxiomNav />
          {children}
          <BottomBar />
        </Providers>
      </body>
    </html>
  );
}
