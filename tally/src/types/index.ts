export interface Material {
  id: string
  name: string
  color: string | null
  size: string | null
  quantity: number
  packSize: number
  totalRequired?: number
  status?: 'sufficient' | 'insufficient'
  shortage?: number
}

export interface Order {
  id: string
  name: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: number | null
  dueDate: string | null
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  quantityNeeded: number
  material: Material
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  sku: string | null
  category: string | null
  canMake: boolean
  maxQuantity: number
  productMaterials: ProductMaterial[]
  productDesigns: ProductDesign[]
  createdAt: string
  updatedAt: string
}

export interface ProductMaterial {
  id: string
  quantityRequired: number
  notes: string | null
  material: Material
}

export interface ProductDesign {
  id: string
  placement: string | null
  sizeInfo: string | null
  notes: string | null
  design: Design
}

export interface Design {
  id: string
  name: string
  description: string | null
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  mimeType: string | null
  tags: string | null
  createdAt: string
  updatedAt: string
}
