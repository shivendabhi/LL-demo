import type { Material } from '@/types'
interface AddOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  orderName: string
  setOrderName: (name: string) => void
  priority: number
  setPriority: (priority: number) => void
  dueDate: string
  setDueDate: (date: string) => void
  selectedMaterials: Array<{ materialId: string; quantityNeeded: number }>
  setSelectedMaterials: (materials: Array<{ materialId: string; quantityNeeded: number }>) => void
  materials: Material[]
}

export default function AddOrderModal({
  isOpen,
  onClose,
  onSubmit,
  orderName,
  setOrderName,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  selectedMaterials,
  setSelectedMaterials,
  materials
}: AddOrderModalProps) {
  if (!isOpen) return null

  const handleMaterialToggle = (materialId: string) => {
    const existing = selectedMaterials.find(m => m.materialId === materialId)
    if (existing) {
      setSelectedMaterials(selectedMaterials.filter(m => m.materialId !== materialId))
    } else {
      setSelectedMaterials([...selectedMaterials, { materialId, quantityNeeded: 1 }])
    }
  }

  const handleQuantityChange = (materialId: string, quantity: number) => {
    setSelectedMaterials(selectedMaterials.map(m =>
      m.materialId === materialId ? { ...m, quantityNeeded: quantity } : m
    ))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white/95 backdrop-blur-xl border border-[#444EAA]/20 rounded p-6 w-full max-w-2xl shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-5">
          <h2 className="font-sans text-xl font-medium text-gray-900 mb-1 tracking-[-0.02em]">
            Create New Order
          </h2>
          <p className="text-gray-600 font-inter text-sm">
            Track material requirements for your orders
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
              Order Name
            </label>
            <input
              type="text"
              required
              value={orderName}
              onChange={(e) => setOrderName(e.target.value)}
              placeholder="e.g., Custom T-Shirts for Event"
              className="w-full px-3 py-2.5 border border-gray-200 rounded font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                className="w-full px-3 py-2.5 border border-gray-200 rounded font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
              >
                <option value={0}>Normal Priority</option>
                <option value={1}>High Priority</option>
                <option value={2}>Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 font-inter">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded font-inter text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 font-inter">
              Required Materials
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {materials.map((material) => {
                const isSelected = selectedMaterials.some(m => m.materialId === material.id)
                const selectedMaterial = selectedMaterials.find(m => m.materialId === material.id)

                return (
                  <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleMaterialToggle(material.id)}
                        className="rounded border-gray-300 text-[#444EAA] focus:ring-[#444EAA]"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {material.name}{material.color ? ` (${material.color})` : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          {material.size ? `Size ${material.size}` : 'No size'} • {material.quantity} available
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-600">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={selectedMaterial?.quantityNeeded || 1}
                          onChange={(e) => handleQuantityChange(material.id, parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
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
              className="flex-1 bg-[#444EAA] text-white px-5 py-2.5 rounded font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200"
            >
              Create Order
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}