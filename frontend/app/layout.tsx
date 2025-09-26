import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/hooks/use-auth"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Chat App",
  description: "Kết nối với mọi người trên thế giới trong kênh chat toàn cầu",
  generator: "KitDev",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <AuthProvider>
          <Suspense>{children}</Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
