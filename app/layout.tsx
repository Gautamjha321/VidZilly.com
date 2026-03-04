import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VidZilly — AI Video Generator & Scheduler | YouTube, Instagram, Facebook & Email",
  description:
    "Create stunning AI-generated short videos and auto-schedule them across YouTube, Instagram, Facebook, and Email. VidZilly is the all-in-one SaaS platform for effortless video content creation and multi-platform publishing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#a855f7",
          colorBackground: "#0c0a13",
          colorInputBackground: "#1a1625",
          colorInputText: "#fafafa",
          borderRadius: "0.75rem",
        },
        elements: {
          formButtonPrimary:
            "bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 text-white shadow-lg",
          card: "bg-[#0c0a13] border border-zinc-800 shadow-2xl",
          headerTitle: "text-white",
          headerSubtitle: "text-zinc-400",
          socialButtonsBlockButton:
            "bg-zinc-900 border border-zinc-700 text-white hover:bg-zinc-800",
          formFieldInput:
            "bg-[#1a1625] border-zinc-700 text-white focus:border-purple-500",
          footerActionLink: "text-purple-400 hover:text-purple-300",
          identityPreviewEditButton: "text-purple-400",
        },
      }}
    >
      <html lang="en" className="dark" suppressHydrationWarning>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className={`${inter.variable} antialiased font-[var(--font-inter)]`} suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
