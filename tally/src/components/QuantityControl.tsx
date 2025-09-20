function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

interface Material {
  id: string
  quantity: number
  packSize: number
  status?: 'insufficient' | 'sufficient'
  totalRequired?: number
}

interface QuantityControlProps {
  material: Material
  onAdjust: (materialId: string, adjustment: number) => void
}

export default function QuantityControl({ material, onAdjust }: QuantityControlProps) {
  return (
    <div className="flex flex-col">
      {/* Main quantity control box */}
      <div className={classNames(
        "flex items-center border transition-all duration-200 overflow-hidden",
        material.totalRequired && material.totalRequired > 0
          ? "rounded-t border-b-0"
          : "rounded",
        material.status === 'insufficient'
          ? "border-yellow-400 bg-yellow-50"
          : "border-gray-200 hover:border-[#444EAA]/40"
      )}>
        {/* Minus Button */}
        <button
          onClick={() => onAdjust(material.id, -1)}
          disabled={material.quantity <= 0}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#444EAA] hover:bg-[#444EAA]/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-r border-gray-200"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        {/* Quantity Display */}
        <div className="px-4 py-1 text-center min-w-[60px] bg-white">
          <div className={classNames(
            "text-lg font-medium font-inter",
            material.status === 'insufficient' ? "text-yellow-700" : "text-gray-900"
          )}>
            {material.quantity}
          </div>
          <div className="text-xs text-gray-500 font-inter leading-tight">
            {material.packSize}/pack
          </div>
        </div>

        {/* Plus Button */}
        <button
          onClick={() => onAdjust(material.id, 1)}
          className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-[#444EAA] hover:bg-[#444EAA]/5 transition-all duration-200 border-l border-gray-200"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Quantity needed box - appears below when needed */}
      {material.totalRequired && material.totalRequired > 0 && (
        <div className="bg-yellow-300 border border-yellow-400 border-t-0 rounded-b px-2 py-1 text-center">
          <div className="text-sm font-medium font-inter text-yellow-900">
            Need: {material.totalRequired}
          </div>
        </div>
      )}
    </div>
  )
}