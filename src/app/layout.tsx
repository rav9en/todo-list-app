import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import { DashboardProvider } from '../context/DashboardContext'

export const metadata: Metadata = {
  title: 'To-Do List App',
  description: 'A simple and efficient to-do list application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DashboardProvider>
            {children}
          </DashboardProvider>
        </AuthProvider>
      </body>
    </html>
  )
}