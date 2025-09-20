"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Background from "@/components/Background"

type Material = {
  id: string
  name: string
  color: string | null
  size: string | null
  quantity: number
  packSize: number
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sidebarHovered, setSidebarHovered] = useState(false)

  // Create form state
  const [name, setName] = useState("")
  const [color, setColor] = useState("")
  const [size, setSize] = useState("")
  const [quantity, setQuantity] = useState<number>(0)
  const [packSize, setPackSize] = useState<number>(24)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await fetch("/api/materials")
        if (!res.ok) throw new Error("Failed to load materials")
        const data = await res.json()
        setMaterials(data.materials)
      } catch (e: any) {
        setError(e.message || "Failed to load materials")
      } finally {
        setLoading(false)
      }
    }
    if (status === "authenticated") fetchMaterials()
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

  const resetForm = () => {
    setName("")
    setColor("")
    setSize("")
    setQuantity(0)
    setPackSize(24)
  }

  const handleCreate = async (e: React.FormEvent) => {
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

  if (status === "loading" || loading) {
    return (
      <div className="h-screen w-screen bg-white relative overflow-hidden flex items-center justify-center" style={{selection: 'rgba(68, 78, 170, 0.15)'}}>
        <Background />
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#444EAA]/20 border-t-[#444EAA] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const navigationItems = [
    {
      label: "Materials",
      active: true,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      label: "Products",
      active: false,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      label: "Fulfillment",
      active: false,
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
    <div className="h-screen w-screen bg-white relative overflow-hidden" style={{selection: 'rgba(68, 78, 170, 0.15)'}}>
      <Background />

      <div className="relative z-10 h-full flex">
        {/* Sidebar */}
        <aside
          className={classNames(
            "bg-white/95 backdrop-blur-xl border-r border-[#444EAA]/10 transition-all duration-300 ease-in-out flex flex-col group",
            sidebarHovered ? "w-64" : "w-20"
          )}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          {/* Logo */}
          <div className={classNames(
            "border-b border-[#444EAA]/10 flex items-center",
            sidebarHovered ? "p-5" : "p-4 justify-center"
          )}>
            <div className={classNames(
              "flex items-center transition-all duration-300",
              sidebarHovered ? "space-x-3" : "justify-center w-full"
            )}>
              <img
                src="/logo.png"
                alt="Tally Logo"
                className="w-8 h-8 flex-shrink-0"
              />
              {sidebarHovered && (
                <span className="font-sans text-xl font-medium text-[#444EAA] tracking-[-0.01em] transition-opacity duration-300">
                  Tally
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={classNames(
            "flex-1 space-y-1",
            sidebarHovered ? "p-2" : "p-3"
          )}>
            {navigationItems.map((item) => (
              <button
                key={item.label}
                className={classNames(
                  "w-full flex items-center transition-all duration-200 group relative",
                  sidebarHovered ? "px-3 py-2.5 justify-start rounded-lg" : "px-3 py-2.5 justify-center rounded-lg",
                  item.active
                    ? "bg-[#444EAA]/10 text-[#444EAA]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
{item.icon}
                {sidebarHovered && (
                  <span className="ml-3 font-inter text-sm font-medium transition-opacity duration-300">
                    {item.label}
                  </span>
                )}
              </button>
            ))}

            {/* Divider */}
            <div className={classNames("border-t border-gray-200", sidebarHovered ? "my-3 mx-2" : "my-3")}></div>

            {integrationItems.map((item) => (
              <button
                key={item.label}
                className={classNames(
                  "w-full flex items-center rounded-xl transition-all duration-200 group",
                  sidebarHovered ? "px-3 py-2.5 justify-start" : "px-3 py-2.5 justify-center",
                  item.active
                    ? "bg-[#444EAA]/10 text-[#444EAA] shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
{item.icon}
                {sidebarHovered && (
                  <span className="ml-3 font-inter text-sm font-medium transition-opacity duration-300">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className={classNames(
            "border-t border-[#444EAA]/10",
            sidebarHovered ? "p-3" : "p-2"
          )}>
            {sidebarHovered && (
              <div className="mb-3 px-3 py-3 bg-gray-50 rounded-lg transition-opacity duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#444EAA] to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">
                      {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user?.email}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!sidebarHovered && (
              <div className="mb-3 flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-[#444EAA] to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {(session.user?.name || session.user?.email || "U")[0].toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={classNames(
                "w-full flex items-center transition-all duration-200 text-red-600 hover:bg-red-50 relative",
                sidebarHovered ? "px-3 py-2.5 justify-start rounded-lg" : "p-3 justify-center rounded-lg"
              )}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {sidebarHovered && (
                <span className="ml-3 font-inter text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Sign out
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Page Header */}
            <div className="p-6 border-b border-[#444EAA]/10 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-sans text-2xl font-medium text-gray-900 mb-1 tracking-[-0.02em]">
                    Materials Inventory
                  </h1>
                  <p className="font-inter text-gray-600 text-sm">
                    Manage your blank apparel stock and quantities
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="group bg-[#444EAA] text-white px-5 py-2.5 rounded-lg font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Material</span>
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-inter">{error}</p>
                </div>
              )}

              {/* Materials Grid */}
              <div className="bg-white/90 backdrop-blur-xl border border-[#444EAA]/20 rounded-xl shadow-sm overflow-hidden">
                {Object.keys(grouped).length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">No materials yet</h3>
                    <p className="text-gray-600 font-inter mb-4 text-sm">Start by adding your first material to track inventory</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-[#444EAA] text-white px-5 py-2.5 rounded-lg font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200"
                    >
                      Add Your First Material
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-[#444EAA]/10">
                    {Object.entries(grouped).map(([key, items], gi) => (
                      <div key={key} className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#444EAA]/10 to-purple-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-[#444EAA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-sans text-base font-medium text-gray-900 tracking-[-0.01em]">
                                {items[0].name}
                              </h3>
                              <p className="text-sm text-gray-600 font-inter">
                                {items[0].color} • {items.length} size{items.length > 1 ? 's' : ''} available
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {items.map((material) => (
                              <div key={material.id} className="flex items-center space-x-2">
                                <div className="text-center">
                                  <div className="text-xs text-gray-500 font-inter mb-1 uppercase tracking-wide">
                                    Size {material.size}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <button
                                      onClick={() => handleAdjust(material.id, -1)}
                                      disabled={material.quantity <= 0}
                                      className="w-7 h-7 rounded border border-gray-200 hover:border-[#444EAA]/40 hover:bg-[#444EAA]/5 transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-[#444EAA] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                      </svg>
                                    </button>

                                    <div className="text-center min-w-[50px]">
                                      <div className="text-lg font-medium text-gray-900">
                                        {material.quantity}
                                      </div>
                                      <div className="text-xs text-gray-500 font-inter">
                                        {material.packSize}/pack
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => handleAdjust(material.id, 1)}
                                      className="w-7 h-7 rounded border border-gray-200 hover:border-[#444EAA]/40 hover:bg-[#444EAA]/5 transition-all duration-200 flex items-center justify-center text-gray-600 hover:text-[#444EAA]"
                                    >
                                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white/95 backdrop-blur-xl border border-[#444EAA]/20 rounded-xl p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <h2 className="font-sans text-xl font-medium text-gray-900 mb-1 tracking-[-0.02em]">
                Add New Material
              </h2>
              <p className="text-gray-600 font-inter text-sm">
                Add a new material to your inventory
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                  Material Name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
                  placeholder="e.g., Gildan T-Shirt"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                    Color
                  </label>
                  <input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
                    placeholder="e.g., Black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                    Size
                  </label>
                  <input
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
                    placeholder="e.g., M"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                    Pack Size
                  </label>
                  <input
                    type="number"
                    value={packSize}
                    onChange={(e) => setPackSize(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
                    placeholder="24"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                  className="px-4 py-2.5 text-gray-600 hover:text-gray-900 transition-colors font-inter text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#444EAA] text-white px-5 py-2.5 rounded-lg font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Adding..." : "Add Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}