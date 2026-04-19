// Waiter App Types

export interface Table {
  id: string
  name: string
  customerName?: string
  status: "available" | "active"
}

export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  price: number
  categoryId: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface SubOrder {
  id: string
  items: OrderItem[]
  createdAt: Date
}

export interface Order {
  id: string
  tableId: string
  subOrders: SubOrder[]
  totalAmount: number
  isPaid: boolean
}

export interface CartItem {
  cartItemId: string
  productId: string
  productName: string
  price: number
  quantity: number
  comment: string
}

export interface ActiveOrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  comment: string | null
}

export interface ActiveOrder {
  id: string
  status: string
  items: ActiveOrderItem[]
  grandTotal: number
}
