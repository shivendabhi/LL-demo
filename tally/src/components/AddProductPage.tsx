import { useState } from 'react'
import Breadcrumb from './Breadcrumb'
import type { Material, Design } from '@/types'

interface AddProductPageProps {
  materials: Material[]
  designs: Design[]
  onBack: () => void
  onProductCreated: () => void
}

export default function AddProductPage({ materials, designs, onBack, onProductCreated }: AddProductPageProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Basic product info
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [sku, setSku] = useState('')
  const [category, setCategory] = useState('')

  // Materials selection
  const [selectedMaterials, setSelectedMaterials] = useState<Array<{ materialId: string; quantityRequired: number; notes?: string }>>([])

  // Designs selection
  const [selectedDesigns, setSelectedDesigns] = useState<Array<{ designId: string; placement?: string; sizeInfo?: string; notes?: string }>>([])

  const addMaterial = () => {
    if (materials.length > 0) {
      setSelectedMaterials([...selectedMaterials, { materialId: materials[0].id, quantityRequired: 1 }])
    }
  }

  const removeMaterial = (index: number) => {
    setSelectedMaterials(selectedMaterials.filter((_, i) => i !== index))
  }

  const updateMaterial = (index: number, field: string, value: any) => {
    const updated = [...selectedMaterials]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedMaterials(updated)
  }

  const addDesign = () => {
    if (designs.length > 0) {
      setSelectedDesigns([...selectedDesigns, { designId: designs[0].id, placement: '' }])
    }
  }

  const removeDesign = (index: number) => {
    setSelectedDesigns(selectedDesigns.filter((_, i) => i !== index))
  }

  const updateDesign = (index: number, field: string, value: any) => {
    const updated = [...selectedDesigns]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedDesigns(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || null,
          price: price ? parseFloat(price) : null,
          sku: sku || null,
          category: category || null,
          materials: selectedMaterials.length > 0 ? selectedMaterials : undefined,
          designs: selectedDesigns.length > 0 ? selectedDesigns : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      // Show success and trigger refresh
      setShowSuccess(true)
      onProductCreated()

      // Reset form after short delay
      setTimeout(() => {
        setShowSuccess(false)
        onBack()
      }, 2000)

    } catch (error) {
      console.error('Error creating product:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex justify-center">
        <div className="max-w-4xl w-full">
          <div className="flex items-center justify-between mb-6">
            <Breadcrumb items={[
              { label: 'Products', onClick: onBack },
              { label: 'Add Product' }
            ]} />

            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 flex items-center space-x-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Products</span>
            </button>
          </div>

          <div className="bg-white/90 backdrop-blur-xl border border-[#444EAA]/20 rounded shadow-sm">
            <div className="p-8">
              <div className="mb-8">
                <h1 className="font-sans text-2xl font-semibold text-gray-900">Create New Product</h1>
                <p className="text-gray-600 mt-2 text-sm">Build a product template by specifying materials and designs needed for production</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-6">
                  <h3 className="font-sans text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-800 mb-2">
                        Product Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-800 mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-800 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                      placeholder="Describe your product"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-800 mb-2">
                        Price ($)
                      </label>
                      <input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label htmlFor="sku" className="block text-sm font-medium text-gray-800 mb-2">
                        SKU
                      </label>
                      <input
                        id="sku"
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40 transition-all duration-200"
                        placeholder="SKU-123"
                      />
                    </div>
                  </div>
                </div>

                {/* Materials Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h3 className="font-sans text-lg font-semibold text-gray-900">Materials Required</h3>
                    <button
                      type="button"
                      onClick={addMaterial}
                      disabled={materials.length === 0}
                      className="bg-[#444EAA] text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Material</span>
                    </button>
                  </div>

                  {selectedMaterials.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm">No materials added yet</p>
                      <p className="text-gray-500 text-xs mt-1">Add materials to specify what's needed to make this product</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedMaterials.map((material, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                              <select
                                value={material.materialId}
                                onChange={(e) => updateMaterial(index, 'materialId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40"
                              >
                                {materials.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} - {m.color} ({m.size})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed</label>
                              <input
                                type="number"
                                min="1"
                                value={material.quantityRequired}
                                onChange={(e) => updateMaterial(index, 'quantityRequired', parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40"
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeMaterial(index)}
                                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-sm transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Designs Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <h3 className="font-sans text-lg font-semibold text-gray-900">Designs</h3>
                    <button
                      type="button"
                      onClick={addDesign}
                      disabled={designs.length === 0}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Design</span>
                    </button>
                  </div>

                  {selectedDesigns.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-gray-600 text-sm">No designs added yet</p>
                      <p className="text-gray-500 text-xs mt-1">Add designs to specify what artwork goes on this product</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDesigns.map((design, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Design</label>
                              <select
                                value={design.designId}
                                onChange={(e) => updateDesign(index, 'designId', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40"
                              >
                                {designs.map((d) => (
                                  <option key={d.id} value={d.id}>
                                    {d.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Placement</label>
                              <input
                                type="text"
                                value={design.placement || ''}
                                onChange={(e) => updateDesign(index, 'placement', e.target.value)}
                                placeholder="e.g. Front center, Back, Sleeve"
                                className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#444EAA]/20 focus:border-[#444EAA]/40"
                              />
                            </div>

                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={() => removeDesign(index)}
                                className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded text-sm transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Section */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onBack}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name}
                    className="bg-[#444EAA] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#444EAA]/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Product...' : 'Create Product'}
                  </button>
                </div>
              </form>
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
          <span className="font-medium">Product created successfully!</span>
        </div>
      )}
    </>
  )
}