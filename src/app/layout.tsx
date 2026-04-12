import type { Metadata } from 'next'
import Providers from './providers'
import '@/styles/index.css'

export const metadata: Metadata = {
  title: 'Wikly',
  description: 'Track your objectives',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
