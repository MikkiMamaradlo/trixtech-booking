"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface Booking {
  _id: string
  serviceId: string
  status: string
  bookingDate: string
  totalPrice: number
  paymentStatus: string
}

export default function MyBookingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [successMessage, setSuccessMessage] = useState("")

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

    // Show success message if payment completed
    if (searchParams.get("success") === "true") {
      setSuccessMessage("Payment completed successfully!")
      setTimeout(() => setSuccessMessage(""), 5000)
    }

    fetchBookings()
  }, [router, searchParams])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setBookings(bookings.filter((b) => b._id !== bookingId))
      }
    } catch (error) {
      console.error("Failed to cancel booking:", error)
      alert("Failed to cancel booking")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">My Bookings</h1>
          <p className="text-muted-foreground mt-2">View and manage your service bookings</p>
        </div>

        {successMessage && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading bookings...</p>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking._id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.paymentStatus === "completed"
                              ? "bg-green-50 text-green-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </p>
                      <p className="font-semibold text-lg">${booking.totalPrice.toFixed(2)}</p>
                    </div>
                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleCancelBooking(booking._id)}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">You haven't made any bookings yet</p>
              <Button onClick={() => router.push("/dashboard")} className="mt-4">
                Browse Services
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
