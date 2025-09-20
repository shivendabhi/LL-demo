import QuantityControl from './QuantityControl'
import type { Material } from '@/types'


interface InventoryViewProps {
  grouped: Record<string, Material[]>
  onAdjust: (materialId: string, adjustment: number) => void
  onAddMaterial: () => void
  searchQuery?: string
  totalMaterials?: number
  filteredCount?: number
}

export default function InventoryView({
  grouped,
  onAdjust,
  onAddMaterial,
  searchQuery,
  totalMaterials,
  filteredCount
}: InventoryViewProps) {
  const getProductIcon = (materialName: string) => {
    const name = materialName.toLowerCase()
    if (name.includes('hoodie')) {
      return '/hoodie.png'
    } else if (name.includes('crewneck')) {
      return '/crewneck.png'
    } else if (name.includes('tee') || name.includes('t-shirt')) {
      return '/t-shirt.png'
    }
    return '/t-shirt.png' // default fallback
  }
  if (Object.keys(grouped).length === 0) {
    // No materials at all vs no search results
    const isSearchResult = searchQuery || totalMaterials !== filteredCount

    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3">
          {isSearchResult ? (
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          )}
        </div>

        {isSearchResult ? (
          <>
            <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">No materials found</h3>
            <p className="text-gray-600 font-inter mb-4 text-sm">
              {searchQuery
                ? `No materials match "${searchQuery}"`
                : 'No materials match your current filters'
              }
            </p>
            <p className="text-sm text-gray-500">
              Try adjusting your search or filters to find what you're looking for
            </p>
          </>
        ) : (
          <>
            <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">No materials yet</h3>
            <p className="text-gray-600 font-inter mb-4 text-sm">Start by adding your first material to track inventory</p>
            <button
              onClick={onAddMaterial}
              className="bg-[#444EAA] text-white px-5 py-2.5 rounded font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200"
            >
              Add Your First Material
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Results Summary */}
      {(searchQuery || totalMaterials !== filteredCount) && (
        <div className="px-6 py-3 bg-gray-50/50 border-b border-[#444EAA]/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <span>
                Showing {filteredCount} of {totalMaterials} materials
                {searchQuery && (
                  <>
                    {' '}matching "<span className="font-medium text-gray-900">{searchQuery}</span>"
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="divide-y divide-[#444EAA]/10">
      {Object.entries(grouped).map(([key, items], gi) => (
        <div key={key} className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#444EAA]/10 to-purple-100 rounded flex items-center justify-center p-2">
                <img
                  src={getProductIcon(items[0].name)}
                  alt={items[0].name}
                  className="w-full h-full object-contain"
                />
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
    </div>
  )
}