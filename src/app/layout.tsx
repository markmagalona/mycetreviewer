// src/app/layout.tsx — with Meta Pixel
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
        {/* Meta Pixel */}
        <script dangerouslySetInnerHTML={{ __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1704552907173750');
          fbq('track', 'PageView');
        `}}/>
        <noscript dangerouslySetInnerHTML={{ __html: `
          <img height="1" width="1" style="display:none"
          src="https://www.facebook.com/tr?id=1704552907173750&ev=PageView&noscript=1"/>
        `}}/>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
