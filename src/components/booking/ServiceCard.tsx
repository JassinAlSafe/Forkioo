'use client'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDuration } from '@/lib/utils'

interface ServiceCardProps {
  service: {
    id: string
    name: string
    description: string | null
    duration_minutes: number
    price: number
    currency: string
    provider: {
      full_name: string | null
      avatar_url: string | null
    }
  }
  onBook?: (serviceId: string) => void
}

export default function ServiceCard({ service, onBook }: ServiceCardProps) {
  return (
    <Card hover className="flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-display font-semibold text-neutral-900 mb-1">
            {service.name}
          </h3>
          <p className="text-sm text-neutral-600">
            by {service.provider.full_name || 'Provider'}
          </p>
        </div>
        <Badge variant="primary">
          {formatDuration(service.duration_minutes)}
        </Badge>
      </div>

      {service.description && (
        <p className="text-neutral-600 mb-4 flex-1">{service.description}</p>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <div>
          <span className="text-2xl font-display font-bold text-brand-600">
            {formatCurrency(service.price, service.currency)}
          </span>
        </div>
        <Button
          variant="primary"
          onClick={() => onBook?.(service.id)}
          className="animate-scale-in"
        >
          Book Now
        </Button>
      </div>
    </Card>
  )
}
