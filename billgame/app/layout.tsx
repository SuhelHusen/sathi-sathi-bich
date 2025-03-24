import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MobileHeader } from "@/components/MobileHeader"
import { OfflineIndicator } from "@/components/OfflineIndicator"
import { InstallPrompt } from "@/components/InstallPrompt"
import { StorageInitializer } from "@/components/StorageInitializer"
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Bill Game Harmony",
  description: "Split bills and play games with friends",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bill Harmony",
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <div className="min-h-screen flex flex-col">
            <MobileHeader />
            <div className="flex-1">{children}</div>
            <OfflineIndicator />
            <InstallPrompt />
            <StorageInitializer />
            <ServiceWorkerRegistration />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

