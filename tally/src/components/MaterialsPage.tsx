import { useState, useMemo, useEffect, useRef } from 'react'
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
  orders,
  grouped,
  onAdjust,
  onAddMaterial,
  onAddOrder,
  onUpdateOrderStatus
}: MaterialsPageProps) {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'status' | 'color'>('name')
  const [filterBy, setFilterBy] = useState<'all' | 'insufficient' | 'sufficient'>('all')
  const [showFilters, setShowFilters] = useState(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filter and search materials
  const filteredAndSortedMaterials = useMemo(() => {
    // First, flatten all materials from grouped data
    const allMaterials = Object.values(grouped).flat()

    // Apply search filter
    let filtered = allMaterials.filter(material => {
      const searchLower = searchQuery.toLowerCase()
      return (
        material.name.toLowerCase().includes(searchLower) ||
        (material.color?.toLowerCase().includes(searchLower) ?? false) ||
        (material.size?.toLowerCase().includes(searchLower) ?? false)
      )
    })

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(material => {
        const isInsufficient = material.status === 'insufficient'
        return filterBy === 'insufficient' ? isInsufficient : !isInsufficient
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'quantity':
          return b.quantity - a.quantity
        case 'status':
          const aStatus = a.status === 'insufficient' ? 0 : 1
          const bStatus = b.status === 'insufficient' ? 0 : 1
          return aStatus - bStatus
        default:
          return 0
      }
    })

    // Group the filtered materials back
    const newGrouped: Record<string, Material[]> = {}
    for (const material of filtered) {
      const key = `${material.name}-${material.color ?? ""}`
      if (!newGrouped[key]) newGrouped[key] = []
      newGrouped[key].push(material)
    }

    return newGrouped
  }, [grouped, searchQuery, sortBy, filterBy])

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
        {/* Card Header with Search and Controls */}
        <div className="p-6 border-b border-[#444EAA]/10">
          <div className="flex items-center justify-between">
            {currentView === 'inventory' ? (
              <div className="flex items-center space-x-4 w-1/2">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search materials, colors, sizes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Filter Toggle Button */}
                <div className="relative" ref={filterDropdownRef}>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 border ${
                    showFilters || filterBy !== 'all' || sortBy !== 'name'
                      ? 'bg-[#444EAA] text-white border-[#444EAA]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                  </svg>
                  <span>Filter</span>
                  {(filterBy !== 'all' || sortBy !== 'name') && (
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                  )}
                </button>

                {/* Filter Dropdown */}
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                    {/* Sort Options */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Sort By</label>
                      <div className="space-y-1">
                        {[
                          { value: 'name', label: 'Name (A-Z)' },
                          { value: 'quantity', label: 'Quantity (High-Low)' },
                          { value: 'status', label: 'Status (Shortage First)' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setSortBy(option.value as 'name' | 'color' | 'quantity' | 'status')}
                            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                              sortBy === option.value
                                ? 'bg-[#444EAA]/10 text-[#444EAA] font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter Options */}
                    <div className="px-4 py-2">
                      <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Filter By Status</label>
                      <div className="space-y-1">
                        {[
                          { value: 'all', label: 'All Materials' },
                          { value: 'insufficient', label: 'Low Stock Only' },
                          { value: 'sufficient', label: 'Well Stocked Only' }
                        ].map(option => (
                          <button
                            key={option.value}
                            onClick={() => setFilterBy(option.value as 'all' | 'insufficient' | 'sufficient')}
                            className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                              filterBy === option.value
                                ? 'bg-[#444EAA]/10 text-[#444EAA] font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(filterBy !== 'all' || sortBy !== 'name' || searchQuery) && (
                      <div className="px-4 py-2 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setFilterBy('all')
                            setSortBy('name')
                            setSearchQuery('')
                            setShowFilters(false)
                          }}
                          className="w-full text-center px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    )}
                  </div>
                )}
                </div>
              </div>
            ) : (
              <h2 className="font-sans text-lg font-medium text-gray-900">Order Queue</h2>
            )}

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
        </div>

        {/* Content */}
        {currentView === 'inventory' ? (
          <InventoryView
            grouped={filteredAndSortedMaterials}
            onAdjust={onAdjust}
            onAddMaterial={onAddMaterial}
            searchQuery={searchQuery}
            totalMaterials={Object.values(grouped).flat().length}
            filteredCount={Object.values(filteredAndSortedMaterials).flat().length}
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