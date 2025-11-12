"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface Service {
  _id: string
  name: string
  description: string
  price: number
  duration: number
}

interface TimeSlot {
  _id: string
  date: string
  startTime: string
  endTime: string
}

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.serviceId as string

  const [service, setService] = useState<Service | null>(null)
  const [timeslots, setTimeslots] = useState<TimeSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
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

    fetchService()
  }, [router, serviceId])

  const fetchService = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/services/${serviceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setService(data)
      }
    } catch (error) {
      console.error("Failed to fetch service:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTimeslots = async (date: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/timeslots?serviceId=${serviceId}&date=${date}&available=true`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setTimeslots(data.timeslots)
      }
    } catch (error) {
      console.error("Failed to fetch timeslots:", error)
    }
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value
    setSelectedDate(date)
    setSelectedSlot("")
    if (date) {
      fetchTimeslots(date)
    }
  }

  const handleBooking = async () => {
    if (!selectedSlot) {
      alert("Please select a time slot")
      return
    }

    setBooking(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId,
          timeSlotId: selectedSlot,
          notes,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/payment/${data.booking._id}`)
      } else {
        alert(data.error || "Booking failed")
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("An error occurred")
    } finally {
      setBooking(false)
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

  if (!service) {
    return (
      <DashboardLayout user={user} onLogout={handleLogout}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Service not found</p>
          <Button onClick={() => router.push("/dashboard")} className="mt-4">
            Back to Services
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-1 text-sm hover:text-primary transition"
          >
            <ChevronLeft size={18} />
            Back to Services
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{service.name}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-xl font-semibold">{service.duration} min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="text-xl font-semibold">${service.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                {selectedDate && timeslots.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available Times</label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeslots.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => setSelectedSlot(slot._id)}
                          className={`px-3 py-2 rounded-md border transition ${
                            selectedSlot === slot._id
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-input hover:border-primary"
                          }`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDate && timeslots.length === 0 && (
                  <p className="text-sm text-muted-foreground">No available times for this date</p>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special requests or notes"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{service.duration} min</span>
                  </div>
                  {selectedDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{new Date(selectedDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {selectedSlot && timeslots.find((s) => s._id === selectedSlot) && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium">{timeslots.find((s) => s._id === selectedSlot)?.startTime}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${service.price}</span>
                  </div>
                </div>

                <Button onClick={handleBooking} disabled={!selectedSlot || booking} className="w-full" size="lg">
                  {booking ? "Booking..." : "Continue to Payment"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
