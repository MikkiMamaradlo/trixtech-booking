"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import ServicesGrid from "@/components/services-grid"
import { Card, CardContent } from "@/components/ui/card"

interface Service {
  _id: string
  name: string
  description: string
  category: string
  price: number
  duration: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token) {
      router.push("/login")
      return
    }

    if (userData) {
      setUser(JSON.parse(userData))
    }

    fetchServices()
  }, [router])

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/services?limit=20", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setServices(data.services)
      }
    } catch (error) {
      console.error("Failed to fetch services:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-balance">Book Your Service</h1>
          <p className="text-muted-foreground mt-2">Select a service and choose your preferred time slot</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading services...</p>
          </div>
        ) : services.length > 0 ? (
          <ServicesGrid services={services} />
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No services available at the moment</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
