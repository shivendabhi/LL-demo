import Breadcrumb from './Breadcrumb'
import TabNavigation from './TabNavigation'
import InventoryView from './InventoryView'
import OrdersView from './OrdersView'
import type { Material, Order } from '@/types'


interface MaterialsPageProps {
  currentView: 'inventory' | 'orders'
  onViewChange: (view: 'inventory' | 'orders') => void
  materials: Material[]
  orders: Order[]
  grouped: Record<string, Material[]>
  onAdjust: (materialId: string, adjustment: number) => void
  onAddMaterial: () => void
  onAddOrder: () => void
  onUpdateOrderStatus: (orderId: string, status: string) => void
}

export default function MaterialsPage({
  currentView,
  onViewChange,
  materials,
  orders,
  grouped,
  onAdjust,
  onAddMaterial,
  onAddOrder,
  onUpdateOrderStatus
}: MaterialsPageProps) {
  const tabs = [
    {
      key: 'inventory',
      label: 'Inventory',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      key: 'orders',
      label: 'Orders',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      count: orders.filter(o => o.status === 'PENDING' || o.status === 'IN_PROGRESS').length
    }
  ]

  return (
    <div className="flex justify-center">
      <div className="max-w-6xl w-full">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb items={[
            { label: 'Materials' },
            { label: 'Blanks', active: true }
          ]} />

          <TabNavigation
            tabs={tabs}
            activeTab={currentView}
            onTabChange={(tab) => onViewChange(tab as 'inventory' | 'orders')}
          />
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#444EAA]/20 rounded shadow-sm overflow-hidden">
        {/* Card Header with Add Button */}
        <div className="p-6 border-b border-[#444EAA]/10 flex items-center justify-between">
          <h2 className="font-sans text-lg font-medium text-gray-900">
            {currentView === 'inventory' ? 'Inventory' : 'Order Queue'}
          </h2>
          <button
            onClick={() => currentView === 'inventory' ? onAddMaterial() : onAddOrder()}
            className="group bg-[#444EAA] text-white px-4 py-2 rounded font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>{currentView === 'inventory' ? 'Add Material' : 'Add Order'}</span>
          </button>
        </div>

        {/* Content */}
        {currentView === 'inventory' ? (
          <InventoryView
            grouped={grouped}
            onAdjust={onAdjust}
            onAddMaterial={onAddMaterial}
          />
        ) : (
          <OrdersView
            orders={orders}
            onAddOrder={onAddOrder}
            onUpdateOrderStatus={onUpdateOrderStatus}
          />
        )}
        </div>
      </div>
    </div>
  )
}