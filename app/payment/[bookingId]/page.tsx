"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader, AlertCircle } from "lucide-react"

interface Booking {
  _id: string
  serviceId: string
  totalPrice: number
  status: string
}

declare global {
  interface Window {
    Stripe: any
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const params = useParams()
  const bookingId = params.bookingId as string

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState("")

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

    fetchBooking()
  }, [router, bookingId])

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setBooking(data)
      } else {
        setError("Booking not found")
      }
    } catch (err) {
      setError("Failed to fetch booking")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    setProcessing(true)
    setError("")

    try {
      const token = localStorage.getItem("token")

      // Create payment intent on backend
      const intentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId }),
      })

      if (!intentResponse.ok) {
        const errorData = await intentResponse.json()
        setError(errorData.error || "Failed to create payment")
        return
      }

      const { clientSecret, paymentIntentId } = await intentResponse.json()

      if (!clientSecret || !paymentIntentId) {
        setError("Invalid payment response from server")
        return
      }

      // In a real implementation, you would use Stripe.js to confirm payment
      // For now, we'll confirm the payment on the backend
      const confirmResponse = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          bookingId,
        }),
      })

      if (confirmResponse.ok) {
        router.push(`/my-bookings?success=true`)
      } else {
        const errorData = await confirmResponse.json()
        setError(errorData.error || "Payment confirmation failed")
      }
    } catch (err) {
      setError("Payment processing failed. Please try again.")
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return (
      <DashboardLayout user={user} onLogout={handleLogout}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!booking) {
    return (
      <DashboardLayout user={user} onLogout={handleLogout}>
        <div className="text-center py-12">
          <p className="text-destructive">{error || "Booking not found"}</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Payment</CardTitle>
            <CardDescription>Secure payment via Stripe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm flex gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Booking Amount</span>
                <span className="font-semibold">${booking.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3 text-sm p-3 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-blue-900 font-medium">Test Mode - Demo Payment</p>
              <div className="space-y-1 text-blue-800">
                <p>Use this test card:</p>
                <p className="font-mono font-semibold">4242 4242 4242 4242</p>
                <p>Exp: 12/25 | CVC: 123</p>
              </div>
            </div>

            <Button onClick={handlePayment} disabled={processing} className="w-full" size="lg">
              {processing ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${booking.totalPrice.toFixed(2)}`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
