"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

interface Booking {
  _id: string
  userId: string
  serviceId: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  bookingDate: string
  totalPrice: number
  paymentStatus: "pending" | "completed" | "failed"
}

export default function BookingsManagementPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token) {
      router.push("/login")
      return
    }

    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "admin") {
        router.push("/dashboard")
        return
      }
      setUser(parsedUser)
    }

    fetchBookings()
  }, [router])

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/bookings?limit=100", {
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

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/bookings/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId, status: newStatus }),
      })

      if (response.ok) {
        setBookings(bookings.map((b) => (b._id === bookingId ? { ...b, status: newStatus as any } : b)))
      }
    } catch (error) {
      console.error("Failed to update booking status:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const filteredBookings = filterStatus === "all" ? bookings : bookings.filter((b) => b.status === filterStatus)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "confirmed":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  if (loading) {
    return (
      <AdminLayout user={user} onLogout={handleLogout}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Bookings Management</h1>
          <p className="text-muted-foreground mt-2">View and manage customer bookings</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant={filterStatus === "all" ? "default" : "outline"} onClick={() => setFilterStatus("all")}>
            All
          </Button>
          <Button
            variant={filterStatus === "pending" ? "default" : "outline"}
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === "confirmed" ? "default" : "outline"}
            onClick={() => setFilterStatus("confirmed")}
          >
            Confirmed
          </Button>
          <Button
            variant={filterStatus === "completed" ? "default" : "outline"}
            onClick={() => setFilterStatus("completed")}
          >
            Completed
          </Button>
          <Button
            variant={filterStatus === "cancelled" ? "default" : "outline"}
            onClick={() => setFilterStatus("cancelled")}
          >
            Cancelled
          </Button>
        </div>

        <div className="space-y-4">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <Card key={booking._id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className="font-semibold">Booking ID: {booking._id.slice(-8)}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Date</p>
                          <p className="font-medium">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="font-medium">${booking.totalPrice.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="font-medium capitalize">{booking.status}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Payment</p>
                          <p className="font-medium capitalize">{booking.paymentStatus}</p>
                        </div>
                      </div>
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleUpdateStatus(booking._id, "confirmed")}>
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateStatus(booking._id, "cancelled")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {booking.status === "confirmed" && (
                      <Button size="sm" onClick={() => handleUpdateStatus(booking._id, "completed")}>
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No bookings found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
