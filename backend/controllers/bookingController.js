import Booking from "../models/Booking.js"
import Service from "../models/Service.js"

export const createBooking = async (req, res, next) => {
  try {
    const { serviceId, bookingDate, timeSlot, notes } = req.body
    const service = await Service.findById(serviceId)
    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }

    const booking = await Booking.create({
      customerId: req.user.id,
      serviceId,
      bookingDate,
      timeSlot,
      notes,
      totalPrice: service.price,
    })

    res.status(201).json(booking)
  } catch (error) {
    next(error)
  }
}

export const getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id }).populate("serviceId")
    res.json(bookings)
  } catch (error) {
    next(error)
  }
}

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("serviceId")
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }
    res.json(booking)
  } catch (error) {
    next(error)
  }
}

export const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }
    res.json(booking)
  } catch (error) {
    next(error)
  }
}

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true })
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }
    res.json(booking)
  } catch (error) {
    next(error)
  }
}
