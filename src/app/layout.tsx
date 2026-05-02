// src/app/layout.tsx — root layout with AuthProvider
// Replace your existing layout.tsx with this

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MyCETReviewer — Free College Entrance Exam Practice',
  description: 'Practice for UPCAT, ACET, DCAT, USTET, PUPCET and State U CET. Free diagnostic, AI-generated questions, personalized study plan.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://mycetreviewer.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
