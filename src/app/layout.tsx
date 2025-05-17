'use client'

import './globals.css'
import { ReactNode } from 'react'
import BackgroundAnimation from '@/components/BackgroundAnimation'

interface Props {
  children: ReactNode
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <BackgroundAnimation>{children}</BackgroundAnimation>
      </body>
    </html>
  )
}
