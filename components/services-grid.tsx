"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, DollarSign } from "lucide-react"

interface Service {
  _id: string
  name: string
  description: string
  category: string
  price: number
  duration: number
}

interface ServicesGridProps {
  services: Service[]
}

export default function ServicesGrid({ services }: ServicesGridProps) {
  const router = useRouter()

  const handleBookService = (serviceId: string) => {
    router.push(`/booking/${serviceId}`)
  }

  const groupedByCategory = services.reduce(
    (acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = []
      }
      acc[service.category].push(service)
      return acc
    },
    {} as Record<string, Service[]>,
  )

  return (
    <div className="space-y-8">
      {Object.entries(groupedByCategory).map(([category, categoryServices]) => (
        <div key={category}>
          <h2 className="text-2xl font-bold mb-4 text-balance">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryServices.map((service) => (
              <Card key={service._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-muted-foreground" />
                      <span>{service.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-primary" />
                      <span className="font-semibold">${service.price}</span>
                    </div>
                  </div>
                  <Button onClick={() => handleBookService(service._id)} className="w-full">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
