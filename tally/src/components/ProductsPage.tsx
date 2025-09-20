import { useState } from 'react'
import Breadcrumb from './Breadcrumb'
import type { Product, Design } from '@/types'


interface ProductsPageProps {
  products: Product[]
  designs: Design[]
  onAddProduct: () => void
  onAddDesign: () => void
}

export default function ProductsPage({ products, designs, onAddProduct, onAddDesign }: ProductsPageProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [orderQuantity, setOrderQuantity] = useState(1)
  const [orderName, setOrderName] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Edit form state
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editSku, setEditSku] = useState('')
  const [editCategory, setEditCategory] = useState('')

  // Design form state
  const [designName, setDesignName] = useState('')
  const [designDescription, setDesignDescription] = useState('')
  const [designTags, setDesignTags] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)

  const handleCreateOrder = (product: Product) => {
    setSelectedProduct(product)
    setOrderName(`${product.name} Order`)
    setOrderQuantity(1)
    setDueDate('')
    setPriority(0)
    setIsOrderModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setEditName(product.name)
    setEditDescription(product.description || '')
    setEditPrice(product.price?.toString() || '')
    setEditSku(product.sku || '')
    setEditCategory(product.category || '')
    setIsEditModalOpen(true)
  }

  const handleAddDesign = () => {
    setDesignName('')
    setDesignDescription('')
    setDesignTags('')
    setSelectedFile(null)
    setFilePreview(null)
    setIsDesignModalOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)

      // Create preview for image files
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    setIsSubmitting(true)
    try {
      // Calculate materials needed based on product requirements and order quantity
      const materialsNeeded = selectedProduct.productMaterials.map(pm => ({
        materialId: pm.material.id,
        quantityNeeded: pm.quantityRequired * orderQuantity
      }))

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: orderName,
          priority,
          dueDate: dueDate || null,
          materials: materialsNeeded
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      // Show success message
      setIsOrderModalOpen(false)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)

    } catch (error) {
      console.error('Error creating order:', error)
      // You could add error handling UI here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/products/${selectedProduct.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName,
          description: editDescription || null,
          price: editPrice ? parseFloat(editPrice) : null,
          sku: editSku || null,
          category: editCategory || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update product')
      }

      // Close modal and show success
      setIsEditModalOpen(false)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)

      // You could also refresh the products list here if needed
      // window.location.reload() or refetch products

    } catch (error) {
      console.error('Error updating product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitDesign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('name', designName)
      formData.append('description', designDescription)
      formData.append('tags', designTags)

      const response = await fetch('/api/designs', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to create design')
      }

      // Close modal and show success
      setIsDesignModalOpen(false)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)

      // You could refresh the designs list here if needed
      // window.location.reload() or refetch designs

    } catch (error) {
      console.error('Error creating design:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
    <div className="flex justify-center">
      <div className="max-w-6xl w-full">
        <div className="flex items-center justify-between mb-6">
          <Breadcrumb items={[
            { label: 'Products' }
          ]} />

          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddDesign}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded font-inter text-sm font-medium hover:bg-gray-200 transition-all duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Add Design</span>
            </button>
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
        </div>

        <div className="space-y-8">
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
                <div>
                  <h2 className="font-sans text-xl font-semibold text-gray-900">Product Catalog</h2>
                  <p className="text-sm text-gray-600 mt-1">{products.length} product{products.length !== 1 ? 's' : ''} ready for production</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:border-[#444EAA]/40 hover:shadow-md transition-all duration-200 group">
                    {/* Header with status indicator */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-sans text-lg font-semibold text-gray-900">
                            {product.name}
                          </h3>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            product.canMake
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.canMake ? 'Ready' : 'Blocked'}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                        )}

                        {/* Price and SKU prominently displayed */}
                        <div className="flex items-center space-x-6 text-sm">
                          {product.price && (
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500">Price:</span>
                              <span className="font-semibold text-gray-900">${product.price}</span>
                            </div>
                          )}
                          {product.sku && (
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-500">SKU:</span>
                              <span className="font-medium text-gray-700">{product.sku}</span>
                            </div>
                          )}
                          {product.category && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded capitalize">
                              {product.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md border border-gray-200 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          disabled={!product.canMake}
                          onClick={() => product.canMake && handleCreateOrder(product)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                            product.canMake
                              ? "bg-[#444EAA] text-white hover:bg-[#444EAA]/90 shadow-sm hover:shadow-md"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Create Order</span>
                        </button>
                      </div>
                    </div>

                    {/* Production capacity prominently displayed */}
                    <div className={`mb-4 p-3 rounded-lg ${
                      product.canMake ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Production Status</span>
                        <span className={`text-sm font-semibold ${product.canMake ? 'text-green-700' : 'text-red-700'}`}>
                          {product.canMake ? `Can make up to ${product.maxQuantity}` : 'Missing materials - cannot produce'}
                        </span>
                      </div>
                    </div>

                    {/* Materials and Designs in a two-column layout */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Materials */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span>Materials ({product.productMaterials.length})</span>
                        </h4>
                        <div className="space-y-1">
                          {product.productMaterials.slice(0, 2).map((pm: any) => (
                            <div key={pm.id} className="text-xs bg-blue-50 text-blue-800 px-2.5 py-1.5 rounded border border-blue-200">
                              <div className="font-medium">{pm.material.name}</div>
                              <div className="text-blue-600">Need: {pm.quantityRequired}</div>
                            </div>
                          ))}
                          {product.productMaterials.length > 2 && (
                            <div className="text-xs text-gray-500 px-2 py-1">+{product.productMaterials.length - 2} more materials</div>
                          )}
                        </div>
                      </div>

                      {/* Designs */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-1">
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Designs ({product.productDesigns.length})</span>
                        </h4>
                        <div className="space-y-1">
                          {product.productDesigns.slice(0, 2).map((pd: any) => (
                            <div key={pd.id} className="text-xs bg-purple-50 text-purple-800 px-2.5 py-1.5 rounded border border-purple-200">
                              <div className="font-medium">{pd.design.name}</div>
                              <div className="text-purple-600">{pd.placement}</div>
                            </div>
                          ))}
                          {product.productDesigns.length > 2 && (
                            <div className="text-xs text-gray-500 px-2 py-1">+{product.productDesigns.length - 2} more designs</div>
                          )}
                        </div>
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
              <div>
                <h2 className="font-sans text-xl font-semibold text-gray-900">Design Library</h2>
                <p className="text-sm text-gray-600 mt-1">{designs.length} design{designs.length !== 1 ? 's' : ''} available for products</p>
              </div>
            </div>

            {designs.length === 0 ? (
              <div className="text-center py-12 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-sans text-lg font-medium text-gray-900 mb-2">No designs yet</h3>
                <p className="text-gray-600 mb-4 text-sm max-w-md mx-auto">Upload your first design to start building product templates</p>
                <button
                  onClick={handleAddDesign}
                  className="bg-[#444EAA] text-white px-6 py-2.5 rounded font-inter text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 inline-flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Upload Your First Design</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {designs.map((design) => (
                  <div key={design.id} className="group cursor-pointer bg-white rounded-lg border border-gray-200 p-3 hover:border-[#444EAA]/40 hover:shadow-md transition-all duration-200">
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200 flex items-center justify-center mb-3 group-hover:border-[#444EAA]/30 transition-colors relative overflow-hidden">
                      {design.fileUrl ? (
                        <>
                          <img
                            src={design.fileUrl}
                            alt={design.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                        </>
                      ) : (
                        <div className="text-center">
                          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-500 font-medium">No Preview</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">{design.name}</h4>
                      {design.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{design.description}</p>
                      )}
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 capitalize">
                            {design.mimeType?.split('/')[1] || 'file'}
                          </span>
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[#444EAA] hover:text-[#444EAA]/80 font-medium">
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>

    {/* Success Notification */}
    {showSuccess && (
      <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="font-medium">Success!</span>
      </div>
    )}

    {/* Create Order Modal */}
    {isOrderModalOpen && selectedProduct && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Create Order</h2>
            <button
              onClick={() => setIsOrderModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Product:</p>
            <p className="font-semibold text-gray-900">{selectedProduct.name}</p>
            <p className="text-xs text-gray-500 mt-1">
              Uses {selectedProduct.productMaterials.length} material{selectedProduct.productMaterials.length !== 1 ? 's' : ''} •
              Max quantity: {selectedProduct.maxQuantity}
            </p>
          </div>

          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div>
              <label htmlFor="orderName" className="block text-sm font-medium text-gray-800 mb-2">
                Order Name
              </label>
              <input
                id="orderName"
                type="text"
                required
                value={orderName}
                onChange={(e) => setOrderName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                placeholder="Enter order name"
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-800 mb-2">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                max={selectedProduct.maxQuantity}
                required
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-1">Max: {selectedProduct.maxQuantity}</p>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-800 mb-2">
                Due Date (optional)
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-800 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
              >
                <option value={0}>Normal</option>
                <option value={1}>High</option>
                <option value={2}>Urgent</option>
              </select>
            </div>

            {/* Materials Preview */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900 mb-2">Materials Required:</p>
              <div className="space-y-1">
                {selectedProduct.productMaterials.map((pm: any) => (
                  <div key={pm.id} className="text-xs text-blue-800 flex justify-between">
                    <span>{pm.material.name}</span>
                    <span className="font-medium">{pm.quantityRequired * orderQuantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#444EAA] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit Product Modal */}
    {isEditModalOpen && selectedProduct && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Edit Product</h2>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmitEdit} className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-800 mb-2">
                Product Name
              </label>
              <input
                id="editName"
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-800 mb-2">
                Description (optional)
              </label>
              <textarea
                id="editDescription"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                placeholder="Enter description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editPrice" className="block text-sm font-medium text-gray-800 mb-2">
                  Price ($)
                </label>
                <input
                  id="editPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label htmlFor="editSku" className="block text-sm font-medium text-gray-800 mb-2">
                  SKU
                </label>
                <input
                  id="editSku"
                  type="text"
                  value={editSku}
                  onChange={(e) => setEditSku(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                  placeholder="SKU-123"
                />
              </div>
            </div>

            <div>
              <label htmlFor="editCategory" className="block text-sm font-medium text-gray-800 mb-2">
                Category
              </label>
              <select
                id="editCategory"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
              >
                <option value="">Select category</option>
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
                <option value="home">Home & Living</option>
                <option value="stationery">Stationery</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-sm font-medium text-gray-700 mb-1">Current Materials & Designs</p>
              <p className="text-xs text-gray-600">
                {selectedProduct.productMaterials.length} material{selectedProduct.productMaterials.length !== 1 ? 's' : ''} •
                {selectedProduct.productDesigns.length} design{selectedProduct.productDesigns.length !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Note: To modify materials and designs, use the product builder
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#444EAA] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Add Design Modal */}
    {isDesignModalOpen && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Add Design</h2>
            <button
              onClick={() => setIsDesignModalOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmitDesign} className="space-y-4">
            <div>
              <label htmlFor="designName" className="block text-sm font-medium text-gray-800 mb-2">
                Design Name
              </label>
              <input
                id="designName"
                type="text"
                required
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                placeholder="Enter design name"
              />
            </div>

            <div>
              <label htmlFor="designDescription" className="block text-sm font-medium text-gray-800 mb-2">
                Description (optional)
              </label>
              <textarea
                id="designDescription"
                value={designDescription}
                onChange={(e) => setDesignDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                placeholder="Describe your design"
              />
            </div>

            <div>
              <label htmlFor="designTags" className="block text-sm font-medium text-gray-800 mb-2">
                Tags (optional)
              </label>
              <input
                id="designTags"
                type="text"
                value={designTags}
                onChange={(e) => setDesignTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                placeholder="e.g. vintage, modern, abstract (comma separated)"
              />
            </div>

            <div>
              <label htmlFor="designFile" className="block text-sm font-medium text-gray-800 mb-2">
                Design File
              </label>
              <input
                id="designFile"
                type="file"
                required
                accept="image/*,.pdf,.ai,.eps,.svg"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PNG, JPG, PDF, AI, EPS, SVG (max 10MB)
              </p>
            </div>

            {/* File Preview */}
            {filePreview && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                <div className="w-full h-32 bg-white rounded border border-gray-200 flex items-center justify-center overflow-hidden">
                  <img
                    src={filePreview}
                    alt="Design preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Selected File Info */}
            {selectedFile && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-900">{selectedFile.name}</p>
                    <p className="text-xs text-blue-700">
                      {selectedFile.type} • {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setIsDesignModalOpen(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="flex-1 bg-[#444EAA] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Uploading...' : 'Add Design'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  )
}