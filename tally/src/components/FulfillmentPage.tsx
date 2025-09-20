import { useState, useMemo } from 'react'
import { ClipboardList, DollarSign, Package } from 'lucide-react'
import Breadcrumb from './Breadcrumb'
import type { Order } from '@/types'

interface FulfillmentPageProps {
  orders: Order[]
  onUpdateOrderStatus: (orderId: string, status: string) => void
}

interface FulfillmentOrder extends Order {
  fulfillmentStage: 'design_approval' | 'production' | 'quality_control' | 'shipped' | 'delivered'
  customerEmail?: string
  customerAddress?: string
  invoiceAmount?: number
  productionCost?: number
  shippingCost?: number
  trackingNumber?: string
  shippingCarrier?: string
  invoiceStatus: 'pending' | 'sent' | 'paid' | 'overdue'
  profitMargin?: number
  estimatedDelivery?: string
  shippedDate?: string
  deliveredDate?: string
}

const FULFILLMENT_STAGES = [
  {
    key: 'design_approval',
    label: 'Design Approval',
    color: 'blue',
    description: 'Awaiting customer design approval'
  },
  {
    key: 'production',
    label: 'In Production',
    color: 'yellow',
    description: 'Being printed and assembled'
  },
  {
    key: 'quality_control',
    label: 'Quality Check',
    color: 'purple',
    description: 'Quality control and packaging'
  },
  {
    key: 'shipped',
    label: 'Shipped',
    color: 'orange',
    description: 'In transit to customer'
  },
  {
    key: 'delivered',
    label: 'Delivered',
    color: 'green',
    description: 'Successfully delivered'
  }
]

export default function FulfillmentPage({ orders, onUpdateOrderStatus }: FulfillmentPageProps) {
  const [selectedView, setSelectedView] = useState<'pipeline' | 'financial' | 'shipping'>('pipeline')

  // Static fulfillment data that matches integration metrics
  const fulfillmentOrders: FulfillmentOrder[] = useMemo(() => {
    return orders.map((order, index) => {
      // Create deterministic values based on order ID
      const orderHash = order.id.split('').reduce((a, b) => (a + b.charCodeAt(0)) % 1000, 0)
      const baseAmount = 85 + (orderHash % 120) // Invoice amounts between $85-205
      const baseCost = 25 + (orderHash % 35) // Production costs between $25-60
      const shippingCost = 8 + (orderHash % 8) // Shipping costs between $8-16

      // Deterministic fulfillment stages based on order status and hash
      let fulfillmentStage: FulfillmentOrder['fulfillmentStage']
      if (order.status === 'PENDING') {
        fulfillmentStage = 'design_approval'
      } else if (order.status === 'IN_PROGRESS') {
        fulfillmentStage = 'production'
      } else { // COMPLETED
        const stageOptions: FulfillmentOrder['fulfillmentStage'][] = ['quality_control', 'shipped', 'delivered']
        fulfillmentStage = stageOptions[orderHash % 3]
      }

      // Deterministic carrier and tracking
      const carriers = ['UPS', 'FedEx', 'USPS']
      const carrier = carriers[orderHash % 3]
      const trackingNumber = order.status === 'COMPLETED' ? `1Z${orderHash.toString().padStart(8, '0')}` : undefined

      // Deterministic invoice status
      const invoiceStatuses: FulfillmentOrder['invoiceStatus'][] = ['pending', 'sent', 'paid', 'overdue']
      const invoiceStatus = invoiceStatuses[orderHash % 4]

      // Fixed dates relative to order creation
      const orderDate = new Date(order.createdAt)
      const shippedDate = order.status === 'COMPLETED' ?
        new Date(orderDate.getTime() + (2 + (orderHash % 3)) * 24 * 60 * 60 * 1000).toISOString() : undefined
      const deliveredDate = (orderHash % 10 < 7 && order.status === 'COMPLETED') ?
        new Date(orderDate.getTime() + (5 + (orderHash % 3)) * 24 * 60 * 60 * 1000).toISOString() : undefined

      const profitMargin = Math.round(((baseAmount - baseCost - shippingCost) / baseAmount) * 100)

      return {
        ...order,
        fulfillmentStage,
        customerEmail: `customer${orderHash.toString().padStart(4, '0')}@example.com`,
        customerAddress: `${2000 + (orderHash % 8000)} Main St, City, State ${10000 + (orderHash % 89999)}`,
        invoiceAmount: baseAmount,
        productionCost: baseCost,
        shippingCost,
        trackingNumber,
        shippingCarrier: order.status === 'COMPLETED' ? carrier : undefined,
        invoiceStatus,
        profitMargin,
        estimatedDelivery: order.dueDate || undefined,
        shippedDate,
        deliveredDate
      }
    })
  }, [orders])

  // Group orders by fulfillment stage
  const ordersByStage = useMemo(() => {
    const grouped: Record<string, FulfillmentOrder[]> = {}
    FULFILLMENT_STAGES.forEach(stage => {
      grouped[stage.key] = fulfillmentOrders.filter(order => order.fulfillmentStage === stage.key)
    })
    return grouped
  }, [fulfillmentOrders])

  // Financial summary
  const financialSummary = useMemo(() => {
    const totalRevenue = fulfillmentOrders.reduce((sum, order) => sum + (order.invoiceAmount || 0), 0)
    const totalCosts = fulfillmentOrders.reduce((sum, order) => sum + (order.productionCost || 0) + (order.shippingCost || 0), 0)
    const pendingInvoices = fulfillmentOrders.filter(order => order.invoiceStatus === 'pending' || order.invoiceStatus === 'sent').length
    const overdueInvoices = fulfillmentOrders.filter(order => order.invoiceStatus === 'overdue').length

    return {
      totalRevenue,
      totalCosts,
      profit: totalRevenue - totalCosts,
      pendingInvoices,
      overdueInvoices,
      averageMargin: fulfillmentOrders.length > 0
        ? Math.round(fulfillmentOrders.reduce((sum, order) => sum + (order.profitMargin || 0), 0) / fulfillmentOrders.length)
        : 0
    }
  }, [fulfillmentOrders])

  const getStageColor = (stage: string) => {
    const stageConfig = FULFILLMENT_STAGES.find(s => s.key === stage)
    return stageConfig?.color || 'gray'
  }

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex justify-center">
      <div className="max-w-7xl w-full">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb items={[
            { label: 'Fulfillment' }
          ]} />

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              {
                key: 'pipeline',
                label: 'Pipeline',
                icon: <ClipboardList className="w-4 h-4" />
              },
              {
                key: 'financial',
                label: 'Financial',
                icon: <DollarSign className="w-4 h-4" />
              },
              {
                key: 'shipping',
                label: 'Shipping',
                icon: <Package className="w-4 h-4" />
              }
            ].map(view => (
              <button
                key={view.key}
                onClick={() => setSelectedView(view.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 ${
                  selectedView === view.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view.icon}
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl border border-[#444EAA]/20 rounded shadow-sm overflow-hidden">
          {selectedView === 'pipeline' && (
            <>
              {/* Pipeline Header */}
              <div className="p-6 border-b border-[#444EAA]/10">
                <div className="flex items-center justify-between">
                  <h2 className="font-sans text-lg font-medium text-gray-900">Order Fulfillment Pipeline</h2>
                  <div className="flex items-center space-x-4 text-sm">
                    {FULFILLMENT_STAGES.map(stage => {
                      const count = ordersByStage[stage.key]?.length || 0
                      return (
                        <div key={stage.key} className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            stage.color === 'blue' ? 'bg-blue-500' :
                            stage.color === 'yellow' ? 'bg-yellow-500' :
                            stage.color === 'purple' ? 'bg-purple-500' :
                            stage.color === 'orange' ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}></div>
                          <span className="text-gray-700 font-medium">{stage.label}</span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Pipeline Grid */}
              <div className="p-6">
                <div className="grid grid-cols-5 gap-6">
                  {FULFILLMENT_STAGES.map(stage => {
                    const stageOrders = ordersByStage[stage.key] || []
                    return (
                      <div key={stage.key}>
                        <div className="flex items-center space-x-2 mb-4">
                          <div className={`w-2 h-2 rounded-full ${
                            stage.color === 'blue' ? 'bg-blue-500' :
                            stage.color === 'yellow' ? 'bg-yellow-500' :
                            stage.color === 'purple' ? 'bg-purple-500' :
                            stage.color === 'orange' ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}></div>
                          <h3 className="font-sans text-sm font-semibold text-gray-900">{stage.label}</h3>
                        </div>

                        <div className="space-y-3">
                          {stageOrders.map(order => (
                            <div
                              key={order.id}
                              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-[#444EAA]/30 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">#{order.id.slice(-6).toUpperCase()}</span>
                                <span className={`text-xs px-2 py-1 rounded font-medium ${getInvoiceStatusColor(order.invoiceStatus)}`}>
                                  {order.invoiceStatus.charAt(0).toUpperCase() + order.invoiceStatus.slice(1)}
                                </span>
                              </div>

                              <div className="text-sm font-medium text-gray-900 mb-2">{order.name}</div>

                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex justify-between">
                                  <span>Invoice:</span>
                                  <span className="font-semibold">${order.invoiceAmount}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Margin:</span>
                                  <span className={`font-semibold ${order.profitMargin && order.profitMargin > 30 ? 'text-green-600' : 'text-gray-600'}`}>
                                    {order.profitMargin}%
                                  </span>
                                </div>
                                {order.trackingNumber && (
                                  <div className="flex justify-between">
                                    <span>Tracking:</span>
                                    <span className="font-mono text-gray-500">{order.trackingNumber}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-3 flex space-x-1">
                                <button
                                  className="flex-1 bg-[#444EAA] text-white px-3 py-1 text-xs font-medium rounded hover:bg-[#444EAA]/90"
                                  onClick={() => console.log('Advance order', order.id)}
                                >
                                  Advance
                                </button>
                                <button
                                  className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                                  onClick={() => console.log('View order', order.id)}
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          ))}

                          {stageOrders.length === 0 && (
                            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <p className="text-sm text-gray-500">No orders</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {selectedView === 'financial' && (
            <>
              {/* Financial Summary */}
              <div className="p-6 border-b border-[#444EAA]/10">
                <h2 className="font-sans text-lg font-medium text-gray-900 mb-4">Financial Overview</h2>
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-900">${financialSummary.totalRevenue.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Net Profit</p>
                        <p className="text-2xl font-bold text-blue-900">${financialSummary.profit.toLocaleString()}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-800">Avg Margin</p>
                        <p className="text-2xl font-bold text-purple-900">{financialSummary.averageMargin}%</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-800">Overdue Invoices</p>
                        <p className="text-2xl font-bold text-red-900">{financialSummary.overdueInvoices}</p>
                      </div>
                      <div className="w-10 h-10 bg-red-200 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Management */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sans text-base font-semibold text-gray-900">Invoice Management</h3>
                  <button className="bg-[#444EAA] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#444EAA]/90">
                    Generate Invoice
                  </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fulfillmentOrders.slice(0, 10).map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</div>
                              <div className="text-sm text-gray-500 ml-2">{order.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{order.customerEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">${order.invoiceAmount}</div>
                            <div className="text-xs text-gray-500">Cost: ${(order.productionCost || 0) + (order.shippingCost || 0)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInvoiceStatusColor(order.invoiceStatus)}`}>
                              {order.invoiceStatus.charAt(0).toUpperCase() + order.invoiceStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-semibold ${order.profitMargin && order.profitMargin > 30 ? 'text-green-600' : 'text-gray-600'}`}>
                              {order.profitMargin}%
                            </div>
                            <div className="text-xs text-gray-500">${(order.invoiceAmount || 0) - (order.productionCost || 0) - (order.shippingCost || 0)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button className="text-[#444EAA] hover:text-[#444EAA]/80">Send</button>
                              <button className="text-gray-400 hover:text-gray-600">View</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {selectedView === 'shipping' && (
            <>
              {/* Shipping Overview */}
              <div className="p-6 border-b border-[#444EAA]/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-sans text-lg font-medium text-gray-900">Shipping & Logistics</h2>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-gray-900">{fulfillmentOrders.filter(o => o.fulfillmentStage === 'shipped').length}</div>
                      <div className="text-xs text-gray-500">In Transit</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{fulfillmentOrders.filter(o => o.fulfillmentStage === 'delivered').length}</div>
                      <div className="text-xs text-gray-500">Delivered</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {['UPS', 'FedEx', 'USPS'].map(carrier => {
                    const carrierOrders = fulfillmentOrders.filter(o => o.shippingCarrier === carrier)
                    return (
                      <div key={carrier} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{carrier}</span>
                          <span className="text-sm text-gray-500">{carrierOrders.length} orders</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Avg cost: ${carrierOrders.length > 0 ?
                            Math.round(carrierOrders.reduce((sum, o) => sum + (o.shippingCost || 0), 0) / carrierOrders.length) :
                            0}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Shipping Details */}
              <div className="p-6">
                <div className="space-y-4">
                  {fulfillmentOrders
                    .filter(order => order.fulfillmentStage === 'shipped' || order.fulfillmentStage === 'delivered')
                    .map(order => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            #{order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-sm font-medium text-gray-900">{order.name}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            order.fulfillmentStage === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {order.fulfillmentStage === 'delivered' ? 'Delivered' : 'In Transit'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-700">
                          {order.shippingCarrier}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Customer:</span>
                          <div className="font-medium text-gray-400">{order.customerEmail}</div>
                          <div className="text-gray-700">{order.customerAddress}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Tracking:</span>
                          <div className="font-mono font-medium text-gray-400">{order.trackingNumber}</div>
                          <div className="text-gray-700">
                            Shipped: {order.shippedDate ? new Date(order.shippedDate).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-sm text-gray-700">
                          Shipping cost: <span className="font-semibold">${order.shippingCost}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                            Track Package
                          </button>
                          <button className="px-3 py-1 text-xs text-gray-700 border border-gray-300 rounded hover:bg-gray-50">
                            Contact Customer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {fulfillmentOrders.filter(order => order.fulfillmentStage === 'shipped' || order.fulfillmentStage === 'delivered').length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">No shipments yet</h3>
                    <p className="text-gray-700 text-sm">Orders will appear here once they're shipped to customers</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}