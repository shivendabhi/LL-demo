import type { Material, Order } from '@/types'

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}


interface OrderCardProps {
  order: Order
  onUpdateStatus: (orderId: string, status: string) => void
}

export default function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const totalItems = order.orderItems.length
  const shortageItems = order.orderItems.filter(item => item.material.quantity < item.quantityNeeded).length
  const hasShortages = shortageItems > 0
  const totalShortage = order.orderItems.reduce((sum, item) =>
    sum + Math.max(0, item.quantityNeeded - item.material.quantity), 0
  )

  const getDueDateColor = (dueDate: string | null) => {
    if (!dueDate) return "text-gray-500"
    const due = new Date(dueDate)
    const today = new Date()
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return "text-red-600" // Overdue
    if (diffDays <= 3) return "text-orange-600" // Due soon
    if (diffDays <= 7) return "text-yellow-600" // Due this week
    return "text-gray-500" // Future
  }

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return "No due date"

    const due = new Date(dueDate)
    const today = new Date()
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} overdue`
    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "Due tomorrow"
    if (diffDays <= 7) return `Due in ${diffDays} days`

    return due.toLocaleDateString()
  }

  const getPriorityColor = (priority: number | null) => {
    switch (priority) {
      case 2: return "text-red-600 bg-red-100"
      case 1: return "text-orange-600 bg-orange-100"
      default: return "text-[#444EAA] bg-[#444EAA]/10"
    }
  }

  const getPriorityLabel = (priority: number | null) => {
    switch (priority) {
      case 2: return "Urgent"
      case 1: return "High"
      case null: return "No Priority"
      default: return "Normal"
    }
  }

  return (
    <div className="p-4">
      {/* Order Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-1">
            <h4 className="font-sans text-base font-medium text-gray-900 tracking-[-0.01em] truncate">
              {order.name}
            </h4>
            <span className={classNames(
              "px-2 py-1 rounded-full text-xs font-medium",
              getPriorityColor(order.priority)
            )}>
              {getPriorityLabel(order.priority)}
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{totalItems} item{totalItems > 1 ? 's' : ''}</span>
            <span className={getDueDateColor(order.dueDate)}>{formatDueDate(order.dueDate)}</span>
            {hasShortages && (
              <span className="text-red-600 font-medium">
                {totalShortage} piece{totalShortage > 1 ? 's' : ''} short
              </span>
            )}
          </div>
        </div>

        {order.status !== 'COMPLETED' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
            className="ml-4 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all duration-200"
          >
            Mark Complete
          </button>
        )}
      </div>

      {/* Materials Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {order.orderItems.map((item) => {
          const material = item.material
          const hasEnough = material.quantity >= item.quantityNeeded
          const shortage = Math.max(0, item.quantityNeeded - material.quantity)

          return (
            <div key={item.id} className={classNames(
              "p-3 rounded border",
              hasEnough
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            )}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {material.name}{material.color ? ` (${material.color})` : ''}
                  </p>
                  <p className="text-xs text-gray-500">{material.size ? `Size ${material.size}` : 'No size'}</p>
                </div>
                <div className={classNames(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  hasEnough ? "bg-green-500" : "bg-red-500"
                )}></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  Need: {item.quantityNeeded} • Have: {material.quantity}
                </span>
                {!hasEnough && (
                  <span className="text-red-600 font-medium">
                    Short: {shortage}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}