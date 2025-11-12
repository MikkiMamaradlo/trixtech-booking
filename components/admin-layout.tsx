"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, BarChart3, Package, BookOpen, Users } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  user?: any
  onLogout: () => void
}

export default function AdminLayout({ children, user, onLogout }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/services", label: "Services", icon: Package },
    { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
    { href: "/admin/users", label: "Users", icon: Users },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-bold text-xl">
            TRIXTECH Admin
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm flex items-center gap-2 transition ${
                      isActive(item.href) ? "text-primary font-medium" : "hover:text-primary"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
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
          <div className="md:hidden border-t border-border p-4 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block text-sm py-2 px-3 rounded-md flex items-center gap-2 transition ${
                    isActive(item.href) ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              )
            })}
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
