'use client'

import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface BookingCardProps {
  booking: {
    id: string
    start_time: string
    end_time: string
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
    total_price: number
    currency: string
    service: {
      name: string
    }
    provider: {
      full_name: string | null
    }
  }
  onCancel?: (bookingId: string) => void
}

const statusConfig = {
  pending: { variant: 'warning' as const, label: 'Pending' },
  confirmed: { variant: 'success' as const, label: 'Confirmed' },
  cancelled: { variant: 'danger' as const, label: 'Cancelled' },
  completed: { variant: 'primary' as const, label: 'Completed' },
}

export default function BookingCard({ booking, onCancel }: BookingCardProps) {
  const status = statusConfig[booking.status]
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'

  return (
    <Card className="animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-display font-semibold text-neutral-900 mb-1">
            {booking.service.name}
          </h3>
          <p className="text-sm text-neutral-600">
            with {booking.provider.full_name || 'Provider'}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-neutral-600">
          <span className="mr-2">📅</span>
          <span>{formatDateTime(booking.start_time)}</span>
        </div>
        <div className="flex items-center text-sm text-neutral-600">
          <span className="mr-2">💰</span>
          <span className="font-medium">
            {formatCurrency(booking.total_price, booking.currency)}
          </span>
        </div>
      </div>

      {canCancel && (
        <div className="pt-4 border-t border-neutral-200">
          <Button
            variant="danger"
            size="sm"
            fullWidth
            onClick={() => onCancel?.(booking.id)}
          >
            Cancel Booking
          </Button>
        </div>
      )}
    </Card>
  )
}
