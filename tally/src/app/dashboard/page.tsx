"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Background from "@/components/Background"
import Sidebar from "@/components/Sidebar"
import MaterialsPage from "@/components/MaterialsPage"
import ProductsPage from "@/components/ProductsPage"
import AddProductPage from "@/components/AddProductPage"
import FulfillmentPage from "@/components/FulfillmentPage"
import AddMaterialModal from "@/components/AddMaterialModal"
import AddOrderModal from "@/components/AddOrderModal"
import type { Material, Order, OrderItem, Product, ProductMaterial, ProductDesign, Design } from "@/types"


function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

function OrderCard({ order, onUpdateStatus }: { order: Order, onUpdateStatus: (id: string, status: string) => void }) {
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

  const getDueDateText = (dueDate: string | null) => {
    if (!dueDate) return "No due date"
    const due = new Date(dueDate)
    const today = new Date()
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return "Due today"
    if (diffDays === 1) return "Due tomorrow"
    if (diffDays <= 7) return `Due in ${diffDays} days`
    return due.toLocaleDateString()
  }

  return (
    <div className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-sans text-base font-semibold text-gray-900 tracking-[-0.01em]">
              {order.name}
            </h4>
            <div className="flex items-center space-x-2">
              <span className={classNames(
                "px-2.5 py-1 rounded-full text-xs font-medium",
                order.status === 'PENDING' ? "bg-yellow-100 text-yellow-800" :
                order.status === 'IN_PROGRESS' ? "bg-blue-100 text-blue-800" :
                "bg-green-100 text-green-800"
              )}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 font-inter">
            <span className={getDueDateColor(order.dueDate)}>
              {getDueDateText(order.dueDate)}
            </span>
            <span>•</span>
            <span>{totalItems} material{totalItems > 1 ? 's' : ''}</span>
            {hasShortages && (
              <>
                <span>•</span>
                <span className="text-red-600 font-medium">
                  {totalShortage} items short
                </span>
              </>
            )}
          </div>
        </div>

        <div className="ml-4">
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <button
              onClick={() => onUpdateStatus(order.id, order.status === 'PENDING' ? 'IN_PROGRESS' : 'COMPLETED')}
              className={classNames(
                "px-4 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center space-x-2",
                order.status === 'PENDING'
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              )}
            >
              {order.status === 'PENDING' ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 016 0v2M7 16a3 3 0 003 3h4a3 3 0 003-3" />
                  </svg>
                  <span>Start Order</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Complete</span>
                </>
              )}
            </button>
          )}
        </div>
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
                    {material.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {material.color} • Size {material.size}
                  </p>
                </div>
                <div className={classNames(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  hasEnough ? "bg-green-500" : "bg-red-500"
                )}></div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  Need: <span className="font-medium text-gray-900">{item.quantityNeeded}</span>
                </span>
                <span className={classNames(
                  "font-medium",
                  hasEnough ? "text-green-600" : "text-red-600"
                )}>
                  Have: {material.quantity}
                </span>
              </div>

              {shortage > 0 && (
                <div className="mt-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded text-center">
                  Short: {shortage} units
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [designs, setDesigns] = useState<Design[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [currentPage, setCurrentPage] = useState<'materials' | 'products' | 'fulfillment'>('materials')
  const [currentView, setCurrentView] = useState<'inventory' | 'orders'>('inventory')
  const [showAddProduct, setShowAddProduct] = useState(false)

  // Create form state
  const [name, setName] = useState("")
  const [color, setColor] = useState("")
  const [size, setSize] = useState("")
  const [quantity, setQuantity] = useState<number>(0)
  const [packSize, setPackSize] = useState<number>(24)
  const [saving, setSaving] = useState(false)

  // Order form state
  const [orderName, setOrderName] = useState("")
  const [priority, setPriority] = useState<number>(0)
  const [dueDate, setDueDate] = useState("")
  const [selectedMaterials, setSelectedMaterials] = useState<Array<{ materialId: string; quantityNeeded: number }>>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch materials with requirements (for yellow state)
        const materialsRes = await fetch("/api/materials/requirements")
        if (!materialsRes.ok) throw new Error("Failed to load materials")
        const materialsData = await materialsRes.json()
        setMaterials(materialsData.materials)

        // Fetch orders
        const ordersRes = await fetch("/api/orders")
        if (!ordersRes.ok) throw new Error("Failed to load orders")
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders)

        // Fetch products
        const productsRes = await fetch("/api/products")
        if (!productsRes.ok) throw new Error("Failed to load products")
        const productsData = await productsRes.json()
        setProducts(productsData.products)

        // Fetch designs
        const designsRes = await fetch("/api/designs")
        if (!designsRes.ok) throw new Error("Failed to load designs")
        const designsData = await designsRes.json()
        setDesigns(designsData.designs)
      } catch (e: any) {
        setError(e.message || "Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    if (status === "authenticated") fetchData()
  }, [status])

  const grouped = useMemo(() => {
    const groups: Record<string, Material[]> = {}
    for (const m of materials) {
      const key = `${m.name}-${m.color ?? ""}`
      if (!groups[key]) groups[key] = []
      groups[key].push(m)
    }
    const sizeOrder = ["XS", "S", "M", "L", "XL", "2XL", "3XL"]
    Object.keys(groups).forEach((k) => {
      groups[k].sort(
        (a, b) => sizeOrder.indexOf(a.size ?? "") - sizeOrder.indexOf(b.size ?? "")
      )
    })
    return groups
  }, [materials])

  const handleAdjust = async (id: string, delta: number) => {
    setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, quantity: m.quantity + delta } : m)))
    const res = await fetch(`/api/materials/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta }),
    })
    if (!res.ok) {
      setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, quantity: m.quantity - delta } : m)))
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error("Failed to update order")

      // Update local state
      setOrders((prev) => prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ))
    } catch (err: any) {
      setError(err.message || "Failed to update order")
    }
  }

  const refreshProducts = async () => {
    try {
      const productsRes = await fetch("/api/products")
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products)
      }
    } catch (error) {
      console.error('Error refreshing products:', error)
    }
  }

  const resetForm = () => {
    setName("")
    setColor("")
    setSize("")
    setQuantity(0)
    setPackSize(24)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, size, quantity, packSize }),
      })
      if (!res.ok) throw new Error("Failed to create material")
      const data = await res.json()
      setMaterials((prev) => [data.material as Material, ...prev])
      setIsModalOpen(false)
      resetForm()
    } catch (err: any) {
      setError(err.message || "Failed to create material")
    } finally {
      setSaving(false)
    }
  }

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: orderName,
          priority,
          dueDate: dueDate || null,
          materials: selectedMaterials
        }),
      })
      if (!res.ok) throw new Error("Failed to create order")
      const data = await res.json()
      setOrders((prev) => [data.order as Order, ...prev])
      setIsOrderModalOpen(false)
      // Reset order form
      setOrderName("")
      setPriority(0)
      setDueDate("")
      setSelectedMaterials([])
    } catch (err: any) {
      setError(err.message || "Failed to create order")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="h-screen w-screen bg-white relative overflow-hidden flex items-center justify-center">
        <Background />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#444EAA]/20 border-t-[#444EAA] rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    )
  }

  if (!session) return null

  const navigationItems = [
    {
      label: "Materials",
      key: "materials",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      label: "Products",
      key: "products",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      label: "Fulfillment",
      key: "fulfillment",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      )
    },
  ]

  const integrationItems = [
    {
      label: "Integrations",
      active: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      )
    },
  ]

  return (
    <div className="h-screen w-screen bg-white relative overflow-hidden">
      <Background />

      <div className="relative z-10 h-full flex">
        <Sidebar
          session={session}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isHovered={sidebarHovered}
          onHover={setSidebarHovered}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-auto p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded max-w-6xl">
                <p className="text-sm text-red-600 font-inter">{error}</p>
              </div>
            )}

            {currentPage === 'materials' && (
              <MaterialsPage
                currentView={currentView}
                onViewChange={setCurrentView}
                materials={materials}
                orders={orders}
                grouped={grouped}
                onAdjust={handleAdjust}
                onAddMaterial={() => setIsModalOpen(true)}
                onAddOrder={() => setIsOrderModalOpen(true)}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {currentPage === 'products' && !showAddProduct && (
              <ProductsPage
                products={products}
                designs={designs}
                onAddProduct={() => setShowAddProduct(true)}
                onAddDesign={() => setIsDesignModalOpen(true)}
              />
            )}

            {currentPage === 'products' && showAddProduct && (
              <AddProductPage
                materials={materials}
                designs={designs}
                onBack={() => setShowAddProduct(false)}
                onProductCreated={refreshProducts}
              />
            )}

            {currentPage === 'fulfillment' && (
              <FulfillmentPage
                orders={orders}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddMaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        name={name}
        setName={setName}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        quantity={quantity}
        setQuantity={setQuantity}
        packSize={packSize}
        setPackSize={setPackSize}
        saving={saving}
      />

      <AddOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onSubmit={handleOrderSubmit}
        orderName={orderName}
        setOrderName={setOrderName}
        priority={priority}
        setPriority={setPriority}
        dueDate={dueDate}
        setDueDate={setDueDate}
        selectedMaterials={selectedMaterials}
        setSelectedMaterials={setSelectedMaterials}
        materials={materials}
      />
    </div>
  )
}
