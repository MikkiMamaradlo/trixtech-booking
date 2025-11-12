import Service from "../models/Service.js"

export const getAllServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true })
    res.json(services)
  } catch (error) {
    next(error)
  }
}

export const getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }
    res.json(service)
  } catch (error) {
    next(error)
  }
}

export const createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body)
    res.status(201).json(service)
  } catch (error) {
    next(error)
  }
}

export const updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }
    res.json(service)
  } catch (error) {
    next(error)
  }
}

export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id)
    if (!service) {
      return res.status(404).json({ message: "Service not found" })
    }
    res.json({ message: "Service deleted" })
  } catch (error) {
    next(error)
  }
}
