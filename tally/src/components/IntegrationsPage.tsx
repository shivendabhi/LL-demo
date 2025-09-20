import { useState } from 'react'
import Image from 'next/image'
import Breadcrumb from './Breadcrumb'
import type { Order, Product } from '@/types'

interface Integration {
  id: string
  name: string
  description: string
  category: 'sales' | 'fulfillment' | 'design' | 'marketing'
  status: 'connected' | 'disconnected' | 'error' | 'syncing'
  logo: string
  lastSync?: string
  metrics?: {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'neutral'
  }[]
  features: string[]
  setupComplexity: 'easy' | 'medium' | 'advanced'
}

interface IntegrationsPageProps {
  orders: Order[]
  products: Product[]
}

export default function IntegrationsPage({ orders, products }: IntegrationsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showDisconnectModal, setShowDisconnectModal] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [integrationStates, setIntegrationStates] = useState<Record<string, Integration['status']>>({
    shopify: 'connected',
    etsy: 'connected',
    amazon: 'disconnected',
    woocommerce: 'error',
    printful: 'connected',
    printify: 'connected',
    gooten: 'disconnected',
    canva: 'connected',
    adobe: 'disconnected',
    drive: 'connected',
    'facebook-pixel': 'connected',
    'google-analytics': 'connected',
    klaviyo: 'disconnected'
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [connectionSuccess, setConnectionSuccess] = useState(false)
  const [lastSyncTimes, setLastSyncTimes] = useState<Record<string, string>>({
    shopify: '2 minutes ago',
    etsy: '5 minutes ago',
    woocommerce: '2 hours ago (failed)',
    printful: '1 minute ago',
    printify: '3 minutes ago',
    canva: '10 minutes ago',
    drive: '15 minutes ago',
    'facebook-pixel': '30 seconds ago',
    'google-analytics': '5 minutes ago'
  })

  // Calculate real metrics from orders data
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt)
    orderDate.setHours(0, 0, 0, 0)
    return orderDate.getTime() === today.getTime()
  })

  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const last30DaysOrders = orders.filter(order =>
    new Date(order.createdAt) >= last30Days
  )

  const completedOrders = orders.filter(order => order.status === 'COMPLETED')
  const inProductionOrders = orders.filter(order => order.status === 'IN_PROGRESS')

  // Calculate revenue (mock product pricing for demonstration)
  const calculateRevenue = (orderList: Order[]) => {
    return orderList.reduce((total, order) => {
      // Estimate $15-25 per order item based on POD typical margins
      const orderValue = order.orderItems.length * 20
      return total + orderValue
    }, 0)
  }

  // const todayRevenue = calculateRevenue(todayOrders)
  const monthlyRevenue = calculateRevenue(last30DaysOrders)

  // Calculate average shipping time (static calculation)
  const avgShippingTime = completedOrders.length > 0 ? 2.1 : 2.1

  // Shopify metrics (assume 60% of orders come from Shopify)
  const shopifyTodayOrders = Math.floor(todayOrders.length * 0.6)
  const shopifyRevenue = Math.floor(monthlyRevenue * 0.6)

  // Etsy metrics (assume 25% of orders come from Etsy)
  const etsyTodayOrders = Math.floor(todayOrders.length * 0.25)
  const etsyViews = etsyTodayOrders * 120 + 450 // Fixed calculation: 120 views per order + base 450

  // Print provider metrics
  const printfulOrders = Math.floor(completedOrders.length * 0.65) + inProductionOrders.length
  const printifyOrders = Math.floor(completedOrders.length * 0.35)

  // Marketing metrics (fixed calculations based on orders)
  const dailyEvents = todayOrders.length * 28 + 180 // 28 events per order + base 180
  const conversions = Math.floor(todayOrders.length * 0.85) // 85% conversion rate
  const dailySessions = todayOrders.length * 48 + 320 // 48 sessions per order + base 320

  // Handler functions
  const handleConnect = async (integration: Integration) => {
    setSelectedIntegration(integration)
    setIsConnecting(true)
    setShowSetupModal(false)

    // Simulate connection process
    setTimeout(() => {
      setIntegrationStates(prev => ({ ...prev, [integration.id]: 'connected' }))
      setLastSyncTimes(prev => ({ ...prev, [integration.id]: 'just now' }))
      setIsConnecting(false)
      setConnectionSuccess(true)

      setTimeout(() => setConnectionSuccess(false), 3000)
    }, 2000)
  }

  const handleDisconnect = async (integration: Integration) => {
    setIsDisconnecting(true)
    setShowDisconnectModal(false)

    // Simulate disconnection process
    setTimeout(() => {
      setIntegrationStates(prev => ({ ...prev, [integration.id]: 'disconnected' }))
      const newSyncTimes = { ...lastSyncTimes }
      delete newSyncTimes[integration.id]
      setLastSyncTimes(newSyncTimes)
      setIsDisconnecting(false)
    }, 1000)
  }

  const handleRetryConnection = (integration: Integration) => {
    setIntegrationStates(prev => ({ ...prev, [integration.id]: 'syncing' }))

    setTimeout(() => {
      // 70% chance of success, 30% chance it stays in error
      const success = Math.random() > 0.3
      setIntegrationStates(prev => ({
        ...prev,
        [integration.id]: success ? 'connected' : 'error'
      }))

      if (success) {
        setLastSyncTimes(prev => ({ ...prev, [integration.id]: 'just now' }))
      } else {
        setLastSyncTimes(prev => ({ ...prev, [integration.id]: 'sync failed' }))
      }
    }, 2000)
  }

  const handleSync = (integration: Integration) => {
    setIntegrationStates(prev => ({ ...prev, [integration.id]: 'syncing' }))

    setTimeout(() => {
      setIntegrationStates(prev => ({ ...prev, [integration.id]: 'connected' }))
      setLastSyncTimes(prev => ({ ...prev, [integration.id]: 'just now' }))
    }, 1500)
  }

  // Real integrations data based on actual order data
  const integrations: Integration[] = [
    // Sales Channels
    {
      id: 'shopify',
      name: 'Shopify',
      description: 'Sync orders, products, and inventory with your Shopify store',
      category: 'sales',
      status: integrationStates.shopify,
      logo: '/integrations/shopify.png',
      lastSync: lastSyncTimes.shopify,
      metrics: [
        { label: 'Orders Today', value: shopifyTodayOrders, trend: shopifyTodayOrders > 0 ? 'up' : 'neutral' },
        { label: 'Products Synced', value: products.length },
        { label: 'Revenue (30d)', value: `$${shopifyRevenue.toLocaleString()}`, trend: shopifyRevenue > 0 ? 'up' : 'neutral' }
      ],
      features: ['Auto order import', 'Inventory sync', 'Product publishing', 'Fulfillment status updates'],
      setupComplexity: 'easy'
    },
    {
      id: 'etsy',
      name: 'Etsy',
      description: 'Connect your Etsy shop to sync listings and orders',
      category: 'sales',
      status: integrationStates.etsy,
      logo: '/integrations/etsy.png',
      lastSync: lastSyncTimes.etsy,
      metrics: [
        { label: 'Orders Today', value: etsyTodayOrders, trend: etsyTodayOrders > 0 ? 'up' : 'neutral' },
        { label: 'Listings Active', value: Math.round(products.length * 0.8) },
        { label: 'Views (7d)', value: etsyViews > 1000 ? `${(etsyViews/1000).toFixed(1)}k` : etsyViews, trend: etsyViews > 500 ? 'up' : 'neutral' }
      ],
      features: ['Order synchronization', 'Listing management', 'Customer data', 'Review tracking'],
      setupComplexity: 'easy'
    },
    {
      id: 'amazon',
      name: 'Amazon',
      description: 'Manage Amazon FBA and seller central orders',
      category: 'sales',
      status: integrationStates.amazon,
      logo: '/integrations/amazon.png',
      features: ['FBA inventory sync', 'Order management', 'Product catalog', 'Performance metrics'],
      setupComplexity: 'advanced'
    },
    {
      id: 'woocommerce',
      name: 'WooCommerce',
      description: 'Connect your WordPress WooCommerce store',
      category: 'sales',
      status: integrationStates.woocommerce,
      logo: '/integrations/woocommerce.png',
      lastSync: lastSyncTimes.woocommerce,
      features: ['Order sync', 'Product management', 'Customer data', 'Coupon tracking'],
      setupComplexity: 'medium'
    },

    // Print Providers / Fulfillment
    {
      id: 'printful',
      name: 'Printful',
      description: 'Automated printing and shipping for your products',
      category: 'fulfillment',
      status: integrationStates.printful,
      logo: '/integrations/printful.png',
      lastSync: lastSyncTimes.printful,
      metrics: [
        { label: 'Orders Sent', value: printfulOrders, trend: printfulOrders > 0 ? 'up' : 'neutral' },
        { label: 'In Production', value: inProductionOrders.length },
        { label: 'Avg. Ship Time', value: `${avgShippingTime} days`, trend: avgShippingTime <= 2.2 ? 'down' : 'up' }
      ],
      features: ['Auto order forwarding', 'Production tracking', 'Shipping updates', 'Product catalog sync'],
      setupComplexity: 'easy'
    },
    {
      id: 'printify',
      name: 'Printify',
      description: 'On-demand printing with multiple print provider options',
      category: 'fulfillment',
      status: integrationStates.printify,
      logo: '/integrations/printify.png',
      lastSync: lastSyncTimes.printify,
      metrics: [
        { label: 'Orders Sent', value: printifyOrders, trend: printifyOrders > 0 ? 'up' : 'neutral' },
        { label: 'Print Partners', value: 12 },
        { label: 'Avg. Cost/Unit', value: `$8.45`, trend: 'down' }
      ],
      features: ['Multi-provider routing', 'Cost optimization', 'Global fulfillment', 'Quality control'],
      setupComplexity: 'easy'
    },
    {
      id: 'gooten',
      name: 'Gooten',
      description: 'Global print-on-demand with premium quality',
      category: 'fulfillment',
      status: integrationStates.gooten,
      logo: '/integrations/gooten.png',
      features: ['Premium printing', 'Global shipping', 'Custom packaging', 'White label'],
      setupComplexity: 'medium'
    },

    // Design & Assets
    {
      id: 'canva',
      name: 'Canva',
      description: 'Import designs directly from your Canva account',
      category: 'design',
      status: 'connected',
      logo: '/integrations/canva.png',
      lastSync: '10 minutes ago',
      metrics: [
        { label: 'Designs Imported', value: 45 },
        { label: 'Active Projects', value: 8 },
        { label: 'Team Members', value: 3 }
      ],
      features: ['Direct design import', 'Version control', 'Team collaboration', 'Asset library'],
      setupComplexity: 'easy'
    },
    {
      id: 'adobe',
      name: 'Adobe Creative Cloud',
      description: 'Sync designs from Photoshop, Illustrator, and Creative Cloud',
      category: 'design',
      status: 'disconnected',
      logo: '/integrations/adobe.png',
      features: ['Creative Cloud sync', 'Version tracking', 'Asset management', 'Collaboration tools'],
      setupComplexity: 'advanced'
    },
    {
      id: 'drive',
      name: 'Google Drive',
      description: 'Access design files stored in Google Drive',
      category: 'design',
      status: 'connected',
      logo: '/integrations/gdrive.png',
      lastSync: '15 minutes ago',
      metrics: [
        { label: 'Files Synced', value: 234 },
        { label: 'Storage Used', value: '2.1 GB' },
        { label: 'Shared Folders', value: 5 }
      ],
      features: ['File synchronization', 'Folder organization', 'Sharing permissions', 'Auto backup'],
      setupComplexity: 'easy'
    },

    // Marketing & Analytics
    {
      id: 'facebook-pixel',
      name: 'Facebook Pixel',
      description: 'Track conversions and optimize Facebook ad campaigns',
      category: 'marketing',
      status: 'connected',
      logo: '/integrations/facebook.png',
      lastSync: '30 seconds ago',
      metrics: [
        { label: 'Events Today', value: dailyEvents > 1000 ? `${(dailyEvents/1000).toFixed(1)}k` : dailyEvents, trend: dailyEvents > 0 ? 'up' : 'neutral' },
        { label: 'Conversions', value: conversions, trend: conversions > 0 ? 'up' : 'neutral' },
        { label: 'ROAS', value: `${conversions > 0 ? '4.2' : '0'}x`, trend: conversions > 0 ? 'up' : 'neutral' }
      ],
      features: ['Event tracking', 'Conversion optimization', 'Audience building', 'Attribution analysis'],
      setupComplexity: 'medium'
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      description: 'Comprehensive website and ecommerce analytics',
      category: 'marketing',
      status: 'connected',
      logo: '/integrations/ganalytics.png',
      lastSync: '5 minutes ago',
      metrics: [
        { label: 'Sessions Today', value: dailySessions > 1000 ? `${(dailySessions/1000).toFixed(1)}k` : dailySessions, trend: dailySessions > 0 ? 'up' : 'neutral' },
        { label: 'Bounce Rate', value: `32%`, trend: 'down' },
        { label: 'Goal Completions', value: todayOrders.length + Math.floor(todayOrders.length * 0.3), trend: todayOrders.length > 0 ? 'up' : 'neutral' }
      ],
      features: ['Traffic analysis', 'Ecommerce tracking', 'Goal monitoring', 'Custom reports'],
      setupComplexity: 'medium'
    },
    {
      id: 'klaviyo',
      name: 'Klaviyo',
      description: 'Email and SMS marketing automation for ecommerce',
      category: 'marketing',
      status: 'disconnected',
      logo: '/integrations/klaviyo.png',
      features: ['Email automation', 'SMS campaigns', 'Customer segmentation', 'Revenue attribution'],
      setupComplexity: 'medium'
    }
  ]

  const categories = [
    { key: 'all', label: 'All Integrations', count: integrations.length },
    { key: 'sales', label: 'Sales Channels', count: integrations.filter(i => i.category === 'sales').length },
    { key: 'fulfillment', label: 'Print & Fulfillment', count: integrations.filter(i => i.category === 'fulfillment').length },
    { key: 'design', label: 'Design & Assets', count: integrations.filter(i => i.category === 'design').length },
    { key: 'marketing', label: 'Marketing & Analytics', count: integrations.filter(i => i.category === 'marketing').length },
  ]

  const filteredIntegrations = selectedCategory === 'all'
    ? integrations
    : integrations.filter(i => i.category === selectedCategory)

  const getStatusColor = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800'
      case 'disconnected': return 'bg-gray-100 text-gray-800'
      case 'error': return 'bg-red-100 text-red-800'
      case 'syncing': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusDot = (status: Integration['status']) => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'disconnected': return 'bg-gray-400'
      case 'error': return 'bg-red-500'
      case 'syncing': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  const getComplexityColor = (complexity: Integration['setupComplexity']) => {
    switch (complexity) {
      case 'easy': return 'text-green-600'
      case 'medium': return 'text-yellow-600'
      case 'advanced': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const connectedIntegrations = integrations.filter(i => i.status === 'connected')
  const totalOrdersToday = todayOrders.length

  return (
    <div className="flex justify-center">
      <div className="max-w-7xl w-full">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb items={[
            { label: 'Integrations' }
          ]} />

          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-600 bg-white/80 px-3 py-1.5 rounded border border-gray-200">
              <span className="font-medium text-gray-900">{connectedIntegrations.length}</span> connected
            </div>
            <div className="text-sm text-gray-600 bg-white/80 px-3 py-1.5 rounded border border-gray-200">
              <span className="font-medium text-gray-900">{totalOrdersToday}</span> orders today
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.key
                    ? 'bg-white text-[#444EAA] shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.label}
                <span className="ml-2 text-xs text-gray-500">({category.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIntegrations.map((integration) => (
            <div key={integration.id} className="bg-white/90 backdrop-blur-xl border border-[#444EAA]/10 rounded-lg p-6 hover:border-[#444EAA]/20 hover:shadow-md transition-all duration-200">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center relative">
                    <Image
                      src={integration.logo}
                      alt={integration.name}
                      width={32}
                      height={32}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <div className="hidden w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm font-medium">
                      {integration.name.charAt(0)}
                    </div>
                    {/* Status dot */}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusDot(integration.status)}`}></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="font-sans text-lg font-semibold text-gray-900">{integration.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                        {integration.status === 'connected' ? 'Connected' :
                         integration.status === 'error' ? 'Error' :
                         integration.status === 'syncing' ? 'Syncing...' : 'Not Connected'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  {integration.status === 'connected' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedIntegration(integration)
                          setShowConfigModal(true)
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIntegration(integration)
                          setShowDisconnectModal(true)
                        }}
                        className="text-sm text-red-600 hover:text-red-800 px-3 py-1.5 rounded border border-red-200 hover:border-red-300 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  ) : integration.status === 'error' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRetryConnection(integration)}
                        className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Retry</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedIntegration(integration)
                          setShowConfigModal(true)
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        Troubleshoot
                      </button>
                    </div>
                  ) : integration.status === 'syncing' ? (
                    <button
                      disabled
                      className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded text-sm font-medium cursor-not-allowed flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Syncing...</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedIntegration(integration)
                        setShowSetupModal(true)
                      }}
                      className="bg-[#444EAA] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#444EAA]/90 transition-colors"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics */}
              {integration.metrics && integration.status === 'connected' && (
                <div className="mb-4">
                  <div className="grid grid-cols-3 gap-4">
                    {integration.metrics.map((metric, index) => (
                      <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-center space-x-1">
                          <span className="text-lg font-semibold text-gray-900">{metric.value}</span>
                          {metric.trend && (
                            <svg className={`w-4 h-4 ${
                              metric.trend === 'up' ? 'text-green-500 transform rotate-0' :
                              metric.trend === 'down' ? 'text-red-500 transform rotate-180' :
                              'text-gray-400'
                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{metric.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Sync */}
              {integration.lastSync && integration.status === 'connected' && (
                <div className="mb-4 text-xs text-gray-500 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Last sync: {integration.lastSync}</span>
                  </div>
                  <button
                    onClick={() => handleSync(integration)}
                    className="text-xs text-[#444EAA] hover:text-[#444EAA]/80 font-medium hover:underline transition-colors"
                  >
                    Sync now
                  </button>
                </div>
              )}

              {integration.lastSync && integration.status === 'error' && (
                <div className="mb-4 text-xs text-red-500 flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <span>Last sync: {integration.lastSync}</span>
                </div>
              )}

              {/* Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {integration.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded font-medium">
                      {feature}
                    </span>
                  ))}
                  {integration.features.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded font-medium">
                      +{integration.features.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Setup Complexity */}
              <div className="text-xs text-gray-500 flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <span>Setup:</span>
                  <span className={`font-medium ${getComplexityColor(integration.setupComplexity)}`}>
                    {integration.setupComplexity.charAt(0).toUpperCase() + integration.setupComplexity.slice(1)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Category:</span>
                  <span className="font-medium capitalize text-gray-700">
                    {integration.category === 'sales' ? 'Sales Channel' :
                     integration.category === 'fulfillment' ? 'Fulfillment' :
                     integration.category === 'design' ? 'Design Tools' :
                     'Marketing'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">No integrations found</h3>
            <p className="text-gray-600 text-sm">Try selecting a different category</p>
          </div>
        )}
      </div>

      {/* Setup Modal */}
      {showSetupModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Connect {selectedIntegration.name}</h2>
              <button
                onClick={() => {
                  setShowSetupModal(false)
                  setSelectedIntegration(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">{selectedIntegration.description}</p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">What you&apos;ll get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {selectedIntegration.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-4 rounded-lg border ${
                selectedIntegration.setupComplexity === 'easy' ? 'bg-green-50 border-green-200' :
                selectedIntegration.setupComplexity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <svg className={`w-4 h-4 ${getComplexityColor(selectedIntegration.setupComplexity)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`font-medium ${getComplexityColor(selectedIntegration.setupComplexity)}`}>
                    {selectedIntegration.setupComplexity.charAt(0).toUpperCase() + selectedIntegration.setupComplexity.slice(1)} Setup
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {selectedIntegration.setupComplexity === 'easy' && 'Quick 2-minute setup with just a few clicks.'}
                  {selectedIntegration.setupComplexity === 'medium' && 'Requires API keys and basic configuration (~10 minutes).'}
                  {selectedIntegration.setupComplexity === 'advanced' && 'Technical setup required with API keys, webhooks, and testing.'}
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowSetupModal(false)
                  setSelectedIntegration(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedIntegration && handleConnect(selectedIntegration)}
                disabled={isConnecting}
                className="flex-1 bg-[#444EAA] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isConnecting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <span>Start Setup</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedIntegration.name} Settings</h2>
              <button
                onClick={() => {
                  setShowConfigModal(false)
                  setSelectedIntegration(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {selectedIntegration.status === 'error' ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h4 className="font-medium text-red-900">Connection Issues</h4>
                  </div>
                  <p className="text-red-800 text-sm mb-3">
                    Unable to sync with {selectedIntegration.name}. This could be due to expired credentials or API changes.
                  </p>
                  <ul className="text-sm text-red-700 space-y-1 mb-4">
                    <li>• Check your API keys are still valid</li>
                    <li>• Verify webhook URLs are accessible</li>
                    <li>• Ensure account permissions haven&apos;t changed</li>
                  </ul>
                  <button
                    onClick={() => handleRetryConnection(selectedIntegration)}
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Retry Connection
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h4 className="font-medium text-green-900">Connected Successfully</h4>
                    </div>
                    <p className="text-green-800 text-sm">
                      Integration is active and syncing data properly.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sync Frequency</label>
                      <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40">
                        <option>Every 5 minutes</option>
                        <option>Every 15 minutes</option>
                        <option>Every hour</option>
                        <option>Daily</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Data Sync Options</label>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#444EAA] focus:ring-[#444EAA]" />
                          <span className="text-sm text-gray-700">Sync orders automatically</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#444EAA] focus:ring-[#444EAA]" />
                          <span className="text-sm text-gray-700">Update inventory levels</span>
                        </label>
                        <label className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded border-gray-300 text-[#444EAA] focus:ring-[#444EAA]" />
                          <span className="text-sm text-gray-700">Send fulfillment notifications</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          readOnly
                          value="https://app.tally.com/webhooks/shopify/abc123"
                          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
                        />
                        <button className="px-3 py-2 text-sm text-[#444EAA] hover:text-[#444EAA]/80 border border-[#444EAA] hover:border-[#444EAA]/80 rounded transition-colors">
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowConfigModal(false)
                  setSelectedIntegration(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Close
              </button>
              {selectedIntegration.status !== 'error' && (
                <button className="flex-1 bg-[#444EAA] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200">
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && selectedIntegration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Disconnect {selectedIntegration.name}</h2>
              <button
                onClick={() => {
                  setShowDisconnectModal(false)
                  setSelectedIntegration(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.865-.833-2.635 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h4 className="font-medium text-red-900">Warning</h4>
                </div>
                <p className="text-red-800 text-sm">
                  Disconnecting will stop all data synchronization with {selectedIntegration.name}. You&apos;ll need to reconnect to resume integration features.
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600"><strong>This will affect:</strong></p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  {selectedIntegration.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDisconnectModal(false)
                  setSelectedIntegration(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedIntegration && handleDisconnect(selectedIntegration)}
                disabled={isDisconnecting}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDisconnecting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Disconnecting...</span>
                  </>
                ) : (
                  <span>Disconnect</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {connectionSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Integration connected successfully!</span>
        </div>
      )}
    </div>
  )
}