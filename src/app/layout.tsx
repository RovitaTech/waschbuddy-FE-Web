import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "WASCHBUDDY",
  description: "WASCHBUDDY laundry management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={urbanist.className} suppressHydrationWarning>
        <div className="min-h-screen">
          {children}
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
