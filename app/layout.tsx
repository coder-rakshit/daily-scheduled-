import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Rakshit Daily OS", description: "Plan your day. Build your career. Grow your personal brand.", manifest: "/manifest.webmanifest" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
