import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Stablecoin Monitoring Platform',
  description: 'Real-time stablecoin risk and liquidity monitoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-background text-textPrimary min-h-screen`}
      >
        {children}
      </body>
    </html>
  )
}
