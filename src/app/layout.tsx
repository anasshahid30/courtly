import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthModal } from "@/components/auth/AuthModal";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { TransferSessionModal } from "@/components/auth/TransferSessionModal";
import { EvidenceViewerModal } from "@/components/legal/EvidenceViewerModal";
import { CaseFileModal } from "@/components/legal/CaseFileModal";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Courtly — Practice law before you practice law",
  description: "AI-Powered Virtual Legal Practice Environment for law students, aspiring advocates, and legal educators. Voice simulations, judicial rubrics, and statutory research.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        <Navbar />
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
        
        {/* Global Modals & Notifications */}
        <AuthModal />
        <OnboardingModal />
        <TransferSessionModal />
        <EvidenceViewerModal />
        <CaseFileModal />
        
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
