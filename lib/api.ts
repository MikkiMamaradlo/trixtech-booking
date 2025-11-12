const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "API Error")
    }

    return data
  },

  get(endpoint: string) {
    return this.request(endpoint, { method: "GET" })
  },

  post(endpoint: string, body: any) {
    return this.request(endpoint, { method: "POST", body: JSON.stringify(body) })
  },

  put(endpoint: string, body: any) {
    return this.request(endpoint, { method: "PUT", body: JSON.stringify(body) })
  },

  delete(endpoint: string) {
    return this.request(endpoint, { method: "DELETE" })
  },
}

// Auth endpoints
export const authAPI = {
  register: (data: any) => apiClient.post("/auth/register", data),
  login: (data: any) => apiClient.post("/auth/login", data),
  profile: () => apiClient.get("/auth/profile"),
}

// Services endpoints
export const servicesAPI = {
  getAll: () => apiClient.get("/services"),
  getById: (id: string) => apiClient.get(`/services/${id}`),
  create: (data: any) => apiClient.post("/services", data),
  update: (id: string, data: any) => apiClient.put(`/services/${id}`, data),
  delete: (id: string) => apiClient.delete(`/services/${id}`),
}

// Bookings endpoints
export const bookingsAPI = {
  create: (data: any) => apiClient.post("/bookings", data),
  getAll: () => apiClient.get("/bookings"),
  getById: (id: string) => apiClient.get(`/bookings/${id}`),
  update: (id: string, data: any) => apiClient.put(`/bookings/${id}`, data),
  cancel: (id: string) => apiClient.delete(`/bookings/${id}`),
}

// Payments endpoints
export const paymentsAPI = {
  createIntent: (data: any) => apiClient.post("/payments/create-intent", data),
  confirm: (data: any) => apiClient.post("/payments/confirm", data),
  getAll: () => apiClient.get("/payments"),
}
