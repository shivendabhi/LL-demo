import Breadcrumb from './Breadcrumb'
import type { Product, Design } from '@/types'


interface ProductsPageProps {
  products: Product[]
  designs: Design[]
  onAddProduct: () => void
  onAddDesign: () => void
}

export default function ProductsPage({ products, designs, onAddProduct, onAddDesign }: ProductsPageProps) {
  return (
    <div className="flex justify-center">
      <div className="max-w-6xl w-full">
        <Breadcrumb items={[
          { label: 'Products' }
        ]} />

        <div className="space-y-6">
        {/* Products Grid */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#444EAA]/20 rounded shadow-sm overflow-hidden">
          {products.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 font-inter mb-4 text-sm">Create product templates to streamline your workflow</p>
              <button
                onClick={onAddProduct}
                className="bg-[#444EAA] text-white px-5 py-2.5 rounded font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200"
              >
                Create Your First Product
              </button>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-sans text-lg font-medium text-gray-900">Products</h2>
                <button
                  onClick={onAddProduct}
                  className="bg-[#444EAA] text-white px-4 py-2 rounded font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Product</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <div key={product.id} className="bg-gray-50 rounded border border-gray-200 p-4 hover:border-[#444EAA]/40 transition-colors group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-sans text-base font-medium text-gray-900 mb-1">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {product.sku && <span>SKU: {product.sku}</span>}
                          {product.price && <span>${product.price}</span>}
                          {product.category && <span>{product.category}</span>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-all duration-200">
                          Edit
                        </button>
                        <button
                          disabled={!product.canMake}
                          className={`px-4 py-2 rounded text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                            product.canMake
                              ? "bg-[#444EAA] text-white hover:bg-[#444EAA]/90"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <span>Make Order</span>
                        </button>
                      </div>
                    </div>

                    {/* Materials */}
                    <div className="mb-3">
                      <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Materials ({product.productMaterials.length})</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.productMaterials.slice(0, 3).map((pm: any) => (
                          <span key={pm.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {pm.material.name} ({pm.quantityRequired})
                          </span>
                        ))}
                        {product.productMaterials.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">+{product.productMaterials.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Designs */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Designs ({product.productDesigns.length})</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.productDesigns.slice(0, 2).map((pd: any) => (
                          <div key={pd.id} className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded">
                            <span className="text-xs text-gray-700">{pd.design.name}</span>
                          </div>
                        ))}
                        {product.productDesigns.length > 2 && (
                          <span className="text-xs text-gray-500 px-2 py-1">+{product.productDesigns.length - 2} more</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-medium ${product.canMake ? 'text-green-600' : 'text-red-600'}`}>
                          {product.canMake ? `Can make ${product.maxQuantity}` : 'Cannot make - missing materials'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Design Library */}
        <div className="bg-white/90 backdrop-blur-xl border border-[#444EAA]/20 rounded shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-sans text-lg font-medium text-gray-900">Design Library</h2>
              <button
                onClick={onAddDesign}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-inter text-sm font-medium hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Add Design</span>
              </button>
            </div>

            {designs.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 text-sm">No designs uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {designs.map((design) => (
                  <div key={design.id} className="group cursor-pointer">
                    <div className="aspect-square bg-gray-100 rounded border-2 border-dashed border-gray-200 flex items-center justify-center mb-2 group-hover:border-[#444EAA]/40 transition-colors">
                      {design.fileUrl ? (
                        <img
                          src={design.fileUrl}
                          alt={design.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate">{design.name}</p>
                    {design.description && (
                      <p className="text-xs text-gray-500 truncate">{design.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}