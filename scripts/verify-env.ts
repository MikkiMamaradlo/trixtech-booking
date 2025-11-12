// Verify all required environment variables are configured

const requiredVars = ["MONGODB_URI", "JWT_SECRET", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]

const missingVars = requiredVars.filter((v) => !process.env[v])

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:")
  missingVars.forEach((v) => console.error(`  - ${v}`))
  process.exit(1)
}

console.log("✅ All required environment variables are configured")
console.log("")
console.log("Configured variables:")
console.log(`  MONGODB_URI: ${process.env.MONGODB_URI?.substring(0, 50)}...`)
console.log(`  JWT_SECRET: ${process.env.JWT_SECRET?.substring(0, 10)}...`)
console.log(`  STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY?.substring(0, 10)}...`)
console.log(`  STRIPE_WEBHOOK_SECRET: ${process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 10)}...`)
console.log(`  NODE_ENV: ${process.env.NODE_ENV || "development"}`)
