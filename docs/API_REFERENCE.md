# TRIXTECH API Reference

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://api.yourdomain.com/api`

## Authentication
All protected routes require JWT token in Authorization header:
\`\`\`
Authorization: Bearer <token>
\`\`\`

## Auth Endpoints

### Register
**POST** `/auth/register`

Request:
\`\`\`json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "confirmPassword": "securepassword"
}
\`\`\`

Response:
\`\`\`json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
\`\`\`

### Login
**POST** `/auth/login`

Request:
\`\`\`json
{
  "email": "john@example.com",
  "password": "securepassword"
}
\`\`\`

### Get Profile
**GET** `/auth/profile` (Protected)

## Services Endpoints

### Get All Services
**GET** `/services`

### Get Service by ID
**GET** `/services/:id`

### Create Service (Admin)
**POST** `/services` (Protected, Admin only)

### Update Service (Admin)
**PUT** `/services/:id` (Protected, Admin only)

### Delete Service (Admin)
**DELETE** `/services/:id` (Protected, Admin only)

## Bookings Endpoints

### Create Booking (Protected)
**POST** `/bookings`

Request:
\`\`\`json
{
  "serviceId": "service_id",
  "bookingDate": "2024-12-25T10:00:00Z",
  "timeSlot": "10:00-11:00",
  "notes": "Optional notes"
}
\`\`\`

### Get My Bookings (Protected)
**GET** `/bookings`

### Get Booking by ID (Protected)
**GET** `/bookings/:id`

### Update Booking (Protected)
**PUT** `/bookings/:id`

### Cancel Booking (Protected)
**DELETE** `/bookings/:id`

## Payments Endpoints

### Create Payment Intent (Protected)
**POST** `/payments/create-intent`

Request:
\`\`\`json
{
  "bookingId": "booking_id"
}
\`\`\`

Response:
\`\`\`json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
\`\`\`

### Confirm Payment (Protected)
**POST** `/payments/confirm`

### Get My Payments (Protected)
**GET** `/payments`

## Error Responses

Standard error format:
\`\`\`json
{
  "message": "Error description"
}
\`\`\`

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error
