import OrderCard from './OrderCard'
import type { Order } from '@/types'


interface OrdersViewProps {
  orders: Order[]
  onAddOrder: () => void
  onUpdateOrderStatus: (orderId: string, status: string) => void
}

export default function OrdersView({ orders, onAddOrder, onUpdateOrderStatus }: OrdersViewProps) {
  if (orders.length === 0) {
    return (
      <div className="p-6">
        <div className="py-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-600 font-inter mb-4 text-sm">Start by creating your first order to track requirements</p>
          <button
            onClick={onAddOrder}
            className="bg-[#444EAA] text-white px-5 py-2.5 rounded font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200"
          >
            Create Your First Order
          </button>
        </div>
      </div>
    )
  }

  const urgentOrders = orders.filter(o => o.priority === 2 && (o.status === 'PENDING' || o.status === 'IN_PROGRESS'))
  const highPriorityOrders = orders.filter(o => o.priority === 1 && (o.status === 'PENDING' || o.status === 'IN_PROGRESS'))
  const normalOrders = orders.filter(o => o.priority === 0 && (o.status === 'PENDING' || o.status === 'IN_PROGRESS'))
  const completedOrders = orders.filter(o => o.status === 'COMPLETED')

  return (
    <div className="p-6">
      <div className="space-y-4">
        {/* Urgent Orders */}
        {urgentOrders.length > 0 && (
          <div className="bg-red-50/80 backdrop-blur-xl border border-red-200 rounded shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-red-200 bg-red-100/50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <h3 className="font-sans text-sm font-medium text-red-800">Urgent Orders</h3>
                <div className="bg-red-200 text-red-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {urgentOrders.length}
                </div>
              </div>
            </div>
            <div className="divide-y divide-red-200/50">
              {urgentOrders.map((order) => (
                <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateOrderStatus} />
              ))}
            </div>
          </div>
        )}

        {/* High Priority Orders */}
        {highPriorityOrders.length > 0 && (
          <div className="bg-orange-50/80 backdrop-blur-xl border border-orange-200 rounded shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-orange-200 bg-orange-100/50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <h3 className="font-sans text-sm font-medium text-orange-800">High Priority</h3>
                <div className="bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {highPriorityOrders.length}
                </div>
              </div>
            </div>
            <div className="divide-y divide-orange-200/50">
              {highPriorityOrders.map((order) => (
                <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateOrderStatus} />
              ))}
            </div>
          </div>
        )}

        {/* Normal Priority Orders */}
        {normalOrders.length > 0 && (
          <div className="bg-white/90 backdrop-blur-xl border border-[#444EAA]/20 rounded shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-[#444EAA]/10 bg-[#444EAA]/5">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#444EAA] rounded-full"></div>
                <h3 className="font-sans text-sm font-medium text-[#444EAA]">Normal Priority</h3>
                <div className="bg-[#444EAA]/10 text-[#444EAA] px-2 py-0.5 rounded-full text-xs font-medium">
                  {normalOrders.length}
                </div>
              </div>
            </div>
            <div className="divide-y divide-[#444EAA]/10">
              {normalOrders.map((order) => (
                <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateOrderStatus} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <div className="bg-green-50/80 backdrop-blur-xl border border-green-200 rounded shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-green-200 bg-green-100/50">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <h3 className="font-sans text-sm font-medium text-green-800">Completed</h3>
                <div className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-medium">
                  {completedOrders.length}
                </div>
              </div>
            </div>
            <div className="divide-y divide-green-200/50">
              {completedOrders.map((order) => (
                <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateOrderStatus} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}