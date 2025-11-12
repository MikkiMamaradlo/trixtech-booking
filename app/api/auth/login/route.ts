import { type NextRequest, NextResponse } from "next/server"
import { getUserByEmail, comparePassword, sanitizeUser } from "@/lib/auth-utils"
import { generateToken } from "@/lib/jwt"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user by email
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Generate token
    const token = generateToken({
      userId: user._id!,
      email: user.email,
      role: user.role,
    })

    const sanitized = sanitizeUser(user)

    return NextResponse.json(
      {
        message: "Login successful",
        token,
        user: sanitized,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
