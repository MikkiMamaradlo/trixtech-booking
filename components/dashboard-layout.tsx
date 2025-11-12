"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: any
  onLogout: () => void
}

export default function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="font-bold text-xl">
            TRIXTECH
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm hover:text-primary transition">
                Services
              </Link>
              <Link href="/my-bookings" className="text-sm hover:text-primary transition">
                My Bookings
              </Link>
              <Link href="/profile" className="text-sm hover:text-primary transition">
                Profile
              </Link>
            </nav>
            <Button variant="outline" size="sm" onClick={onLogout}>
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border p-4 space-y-2">
            <Link href="/dashboard" className="block text-sm hover:text-primary py-2">
              Services
            </Link>
            <Link href="/my-bookings" className="block text-sm hover:text-primary py-2">
              My Bookings
            </Link>
            <Link href="/profile" className="block text-sm hover:text-primary py-2">
              Profile
            </Link>
            <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={onLogout}>
              Logout
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>
    </div>
  )
}
