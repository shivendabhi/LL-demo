import QuantityControl from './QuantityControl'
import type { Material } from '@/types'


interface InventoryViewProps {
  grouped: Record<string, Material[]>
  onAdjust: (materialId: string, adjustment: number) => void
  onAddMaterial: () => void
}

export default function InventoryView({ grouped, onAdjust, onAddMaterial }: InventoryViewProps) {
  if (Object.keys(grouped).length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">No materials yet</h3>
        <p className="text-gray-600 font-inter mb-4 text-sm">Start by adding your first material to track inventory</p>
        <button
          onClick={onAddMaterial}
          className="bg-[#444EAA] text-white px-5 py-2.5 rounded font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200"
        >
          Add Your First Material
        </button>
      </div>
    )
  }

  return (
    <div className="divide-y divide-[#444EAA]/10">
      {Object.entries(grouped).map(([key, items], gi) => (
        <div key={key} className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#444EAA]/10 to-purple-100 rounded flex items-center justify-center">
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
                      {material.size ? `Size ${material.size}` : 'No Size'}
                    </div>
                    <QuantityControl
                      material={material}
                      onAdjust={onAdjust}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}