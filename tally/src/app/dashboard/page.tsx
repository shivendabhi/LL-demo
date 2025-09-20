"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Background from "@/components/Background"
import Sidebar from "@/components/Sidebar"
import MaterialsPage from "@/components/MaterialsPage"
import ProductsPage from "@/components/ProductsPage"
import AddProductPage from "@/components/AddProductPage"
import FulfillmentPage from "@/components/FulfillmentPage"
import IntegrationsPage from "@/components/IntegrationsPage"
import AddMaterialModal from "@/components/AddMaterialModal"
import AddOrderModal from "@/components/AddOrderModal"
import type { Material, Order, Product, Design } from "@/types"




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
  const [sidebarHovered, setSidebarHovered] = useState(false)
  const [currentPage, setCurrentPage] = useState<'materials' | 'products' | 'fulfillment' | 'integrations'>('materials')
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
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load data")
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
        order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      ))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update order")
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create material")
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create order")
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


  return (
    <div className="h-screen w-screen bg-white relative overflow-hidden">
      <Background />

      <div className="relative z-10 h-full flex">
        <Sidebar
          session={session}
          currentPage={currentPage}
          onPageChange={(page) => {
            setCurrentPage(page)
            setShowAddProduct(false) // Reset add product mode when changing pages
          }}
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
                onAddDesign={() => console.log('Add design clicked')}
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

            {currentPage === 'integrations' && (
              <IntegrationsPage
                orders={orders}
                products={products}
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
