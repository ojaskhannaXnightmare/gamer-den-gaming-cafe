import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Gamer's Den | Premium Gaming Cafe in Lucknow - PS5, PS4, VR Gaming",
  description: "Experience exceptional gaming at Gamer's Den - Lucknow's premier gaming cafe. PS5, PS4, VR, Projector Gaming. Book your slot now for an immersive gaming experience.",
  keywords: ["Gaming Cafe Lucknow", "PS5 Cafe", "PS4 Gaming", "VR Gaming", "Projector Gaming", "Gamer's Den", "Nightmare Studios", "Gaming Center", "Console Gaming"],
  authors: [{ name: "Nightmare Studios" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Gamer's Den | Premium Gaming Cafe",
    description: "Exceptional Gaming Experience on PS5, PS4, VR & More",
    url: "https://gamersden.com",
    siteName: "Gamer's Den",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamer's Den | Premium Gaming Cafe",
    description: "Exceptional Gaming Experience on PS5, PS4, VR & More",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${orbitron.variable} ${rajdhani.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
