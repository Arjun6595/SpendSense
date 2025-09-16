"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "../contexts/AuthContext"
import Providers from "./Providers"
import LayoutWrapper from "./LayoutWrapper"
import { Toaster } from "@/components/ui/toaster"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster />
        </Providers>
      </AuthProvider>
    </ThemeProvider>
  )
}
