import type { Metadata } from "next";
// Font imports removed to fix Turbopack issue
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "BIOCYBERX - Pharmacogenomics",
  description: "AI-Powered Pharmacogenomic Risk Prediction",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
