import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { ToasterProvider } from "@/components/ui/toaster-provider"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-instrument-serif" })

export const metadata: Metadata = {
  title: "NITI AI - AI Career Guidance Platform",
  description:
    "Your personal AI mentor for career planning, resume building, and job readiness. Get AI-powered career path recommendations and personalized learning guides.",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        suppressHydrationWarning={true}
        className={`font-sans antialiased ${_geist.className} ${_instrumentSerif.variable}`}
      >
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
