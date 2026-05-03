// src/app/layout.tsx — with dark mode support
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mycetreviewer.com'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: 'MyCETReviewer — Free College Entrance Exam Practice for Filipino Students',
    template: '%s | MyCETReviewer',
  },
  description: 'Free diagnostic exam, AI-powered practice questions, and personalized study plans for UPCAT, ACET, DCAT, USTET, PUPCET, and State U CET.',
  keywords: ['UPCAT reviewer','ACET practice test','DCAT mock exam','USTET reviewer','PUPCET practice','State U CET reviewer','college entrance exam Philippines'],
  openGraph: {
    type: 'website', locale: 'en_PH', url: APP_URL, siteName: 'MyCETReviewer',
    title: 'MyCETReviewer — Free CET Practice for Filipino Students',
    description: 'Diagnose your weak spots. Train smart. Pass your college entrance exam.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyCETReviewer — Free CET Practice',
    description: 'Diagnose your weak spots. Train smart. Pass your college entrance exam.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <meta name="theme-color" content="#c1121f"/>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 transition-colors duration-200`}>
        <AuthProvider>
            {children}
          </AuthProvider>
      </body>
    </html>
  )
}
