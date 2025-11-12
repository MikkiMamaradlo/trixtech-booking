"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: "customer" | "admin"
  createdAt: string
}

export default function UsersManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (!token) {
      router.push("/login")
      return
    }

    if (userData) {
      const parsedUser = JSON.parse(userData)
      if (parsedUser.role !== "admin") {
        router.push("/dashboard")
        return
      }
      setUser(parsedUser)
    }

    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users/list", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setUsers(users.filter((u) => u._id !== userId))
      }
    } catch (error) {
      console.error("Failed to delete user:", error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  if (loading) {
    return (
      <AdminLayout user={user} onLogout={handleLogout}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Users Management</h1>
          <p className="text-muted-foreground mt-2">Manage system users and roles</p>
        </div>

        <div className="space-y-4">
          {users.length > 0 ? (
            users.map((u) => (
              <Card key={u._id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {u.firstName} {u.lastName}
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
                        <div>
                          <p className="text-muted-foreground">Email</p>
                          <p className="font-medium">{u.email}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Phone</p>
                          <p className="font-medium">{u.phone || "-"}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Role</p>
                          <p className="font-medium capitalize">{u.role}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Joined</p>
                          <p className="font-medium">{new Date(u.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {u._id !== user?._id && (
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(u._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No users found</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
