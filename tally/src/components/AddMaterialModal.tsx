interface AddMaterialModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  name: string
  setName: (name: string) => void
  color: string
  setColor: (color: string) => void
  size: string
  setSize: (size: string) => void
  quantity: number
  setQuantity: (quantity: number) => void
  packSize: number
  setPackSize: (packSize: number) => void
  saving: boolean
}

export default function AddMaterialModal({
  isOpen,
  onClose,
  onSubmit,
  name,
  setName,
  color,
  setColor,
  size,
  setSize,
  quantity,
  setQuantity,
  packSize,
  setPackSize,
  saving
}: AddMaterialModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-xl border border-[#444EAA]/20 rounded p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-5">
          <h2 className="font-sans text-xl font-medium text-gray-900 mb-1 tracking-[-0.02em]">
            Add New Material
          </h2>
          <p className="text-gray-600 font-inter text-sm">
            Track inventory for blank apparel and materials
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Gildan Ultra Cotton T-Shirt"
              className="w-full px-3 py-2.5 border border-gray-200 rounded font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                Color
              </label>
              <input
                type="text"
                required
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Black"
                className="w-full px-3 py-2.5 border border-gray-200 rounded font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                Size
              </label>
              <input
                type="text"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g., XL"
                className="w-full px-3 py-2.5 border border-gray-200 rounded font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                Current Quantity
              </label>
              <input
                type="number"
                required
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                Pack Size
              </label>
              <input
                type="number"
                required
                min="1"
                value={packSize}
                onChange={(e) => setPackSize(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-2.5 border border-gray-200 text-gray-700 rounded font-inter text-sm font-medium hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#444EAA] text-white px-5 py-2.5 rounded font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Adding..." : "Add Material"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}