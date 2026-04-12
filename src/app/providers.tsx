'use client'

import { AuthProvider } from '@/context/AuthContext'
import { ObjectivesProvider } from '@/context/ObjectivesContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ObjectivesProvider>
        {children}
      </ObjectivesProvider>
    </AuthProvider>
  )
}
