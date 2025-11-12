import { NextResponse } from "next/server"
import { withAdminAuth, type AuthenticatedRequest } from "@/lib/auth-middleware"
import { getDatabase } from "@/lib/db"

export const GET = withAdminAuth(async (req: AuthenticatedRequest) => {
  try {
    const db = await getDatabase()
    const { searchParams } = new URL(req.url)

    const startDate = searchParams.get("startDate")
      ? new Date(searchParams.get("startDate")!)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : new Date()

    const bookingStats = await db
      .collection("bookings")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$totalPrice" },
          },
        },
      ])
      .toArray()

    const totalUsers = await db.collection("users").countDocuments()
    const totalServices = await db.collection("services").countDocuments()
    const totalBookings = await db.collection("bookings").countDocuments()
    const totalCustomers = await db.collection("users").countDocuments({ role: "customer" })

    const paymentStats = await db
      .collection("payments")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ])
      .toArray()

    const revenueByService = await db
      .collection("bookings")
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            paymentStatus: "completed",
          },
        },
        {
          $group: {
            _id: "$serviceId",
            revenue: { $sum: "$totalPrice" },
            bookings: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "services",
            localField: "_id",
            foreignField: "_id",
            as: "service",
          },
        },
      ])
      .toArray()

    return NextResponse.json(
      {
        period: { startDate, endDate },
        totals: {
          users: totalUsers,
          services: totalServices,
          bookings: totalBookings,
          customers: totalCustomers,
        },
        bookingStats,
        paymentStats,
        revenueByService,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
})
