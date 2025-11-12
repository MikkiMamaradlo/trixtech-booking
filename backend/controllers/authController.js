import User from "../models/User.js"
import jwt from "jsonwebtoken"

export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" })
    }

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" })
    }

    const user = await User.create({ name, email, password })
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    })

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" })
    }

    const user = await User.findOne({ email })
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    })

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    next(error)
  }
}

export const profile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    res.json(user)
  } catch (error) {
    next(error)
  }
}
