// TypeScript interfaces for all TRIXTECH models

export interface User {
  _id?: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  role: "customer" | "admin"
  profilePicture?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  _id?: string
  name: string
  description: string
  category: string
  price: number
  duration: number // in minutes
  image?: string
  available: boolean
  createdBy: string // admin ID
  createdAt: Date
  updatedAt: Date
}

export interface TimeSlot {
  _id?: string
  serviceId: string
  date: Date
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  available: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  _id?: string
  userId: string
  serviceId: string
  timeSlotId: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  bookingDate: Date
  notes?: string
  totalPrice: number
  paymentStatus: "pending" | "completed" | "failed"
  stripePaymentId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  _id?: string
  bookingId: string
  userId: string
  amount: number
  currency: string
  stripePaymentIntentId: string
  status: "pending" | "succeeded" | "failed"
  paymentMethod: "stripe" | "paypal"
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  _id?: string
  bookingId: string
  userId: string
  serviceId: string
  rating: number // 1-5
  comment: string
  createdAt: Date
  updatedAt: Date
}

export interface AdminLog {
  _id?: string
  adminId: string
  action: string
  description: string
  targetId?: string
  createdAt: Date
}
