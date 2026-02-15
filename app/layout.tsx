import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TuniShield - Cyber Safety for Tunisia",
  description: "Protect yourself and your family from cyber threats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tn" dir="rtl" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30 animate-blob"></div>
              <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] opacity-30 animate-blob" style={{ animationDelay: "2s" }}></div>
            </div>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
