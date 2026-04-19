import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, Order, SubOrder, Table } from "./types"
import { mockTables } from "./mock-data"

interface WaiterStore {
  // Tables
  tables: Table[]
  updateTableStatus: (tableId: string, status: Table["status"]) => void
  updateTableCustomer: (tableId: string, customerName: string) => void

  // Cart
  cart: CartItem[]
  currentTableId: string | null
  setCurrentTable: (tableId: string | null) => void
  addToCart: (productId: string, quantity?: number, productName?: string, price?: number, comment?: string) => void
  updateCartItem: (cartItemId: string, quantity: number) => void
  removeFromCart: (cartItemId: string) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartItemCount: () => number

  // Orders
  orders: Order[]
  submitOrder: (tableId: string) => void
  addSubOrder: (tableId: string) => void
  markAsPaid: (tableId: string) => void
  getOrderByTableId: (tableId: string) => Order | undefined

  // UI State
  selectedCategory: string | null
  setSelectedCategory: (id: string | null) => void
}

export const useWaiterStore = create<WaiterStore>()(
  persist(
    (set, get) => ({
      // Tables
      tables: mockTables,
      updateTableStatus: (tableId, status) =>
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId ? { ...t, status } : t
          ),
        })),
      updateTableCustomer: (tableId, customerName) =>
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId ? { ...t, customerName } : t
          ),
        })),

      // Cart
      cart: [],
      currentTableId: null,
      setCurrentTable: (tableId) => set({ currentTableId: tableId, cart: [] }),
      
      addToCart: (productId, quantity = 1, productName = "", price = 0, comment = "") =>
        set((state) => {
          const existing = state.cart.find(
            (item) => item.productId === productId && item.comment === comment
          )
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.cartItemId === existing.cartItemId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          const cartItemId = `${productId}-${comment}-${Date.now()}`
          return { cart: [...state.cart, { cartItemId, productId, productName, price, quantity, comment }] }
        }),

      updateCartItem: (cartItemId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { cart: state.cart.filter((item) => item.cartItemId !== cartItemId) }
          }
          return {
            cart: state.cart.map((item) =>
              item.cartItemId === cartItemId ? { ...item, quantity } : item
            ),
          }
        }),

      removeFromCart: (cartItemId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.cartItemId !== cartItemId),
        })),

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const { cart } = get()
        return cart.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getCartItemCount: () => {
        const { cart } = get()
        return cart.reduce((count, item) => count + item.quantity, 0)
      },

      // Orders
      orders: [],

      submitOrder: (tableId) =>
        set((state) => {
          const { cart } = state
          if (cart.length === 0) return state

          const existingOrder = state.orders.find((o) => o.tableId === tableId && !o.isPaid)
          
          const newSubOrder: SubOrder = {
            id: `so-${Date.now()}`,
            items: cart.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              price: item.price,
            })),
            createdAt: new Date(),
          }

          if (existingOrder) {
            // Add sub-order to existing order
            const updatedOrders = state.orders.map((o) => {
              if (o.id === existingOrder.id) {
                const newSubOrders = [...o.subOrders, newSubOrder]
                const newTotal = newSubOrders.reduce(
                  (sum, so) =>
                    sum + so.items.reduce((s, i) => s + i.price * i.quantity, 0),
                  0
                )
                return { ...o, subOrders: newSubOrders, totalAmount: newTotal }
              }
              return o
            })
            return {
              orders: updatedOrders,
              cart: [],
              tables: state.tables.map((t) =>
                t.id === tableId ? { ...t, status: "active" as const } : t
              ),
            }
          }

          // Create new order
          const newOrder: Order = {
            id: `order-${Date.now()}`,
            tableId,
            subOrders: [newSubOrder],
            totalAmount: newSubOrder.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            ),
            isPaid: false,
          }

          return {
            orders: [...state.orders, newOrder],
            cart: [],
            tables: state.tables.map((t) =>
              t.id === tableId ? { ...t, status: "active" as const } : t
            ),
          }
        }),

      addSubOrder: (tableId) => {
        // This triggers navigation to new order mode
        // The submitOrder will handle adding to existing order
      },

      markAsPaid: (tableId) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.tableId === tableId && !o.isPaid ? { ...o, isPaid: true } : o
          ),
          tables: state.tables.map((t) =>
            t.id === tableId ? { ...t, status: "available" as const, customerName: undefined } : t
          ),
        })),

      getOrderByTableId: (tableId) => {
        const { orders } = get()
        return orders.find((o) => o.tableId === tableId && !o.isPaid)
      },

      // UI State
      selectedCategory: null,
      setSelectedCategory: (id) => set({ selectedCategory: id }),
    }),
    {
      name: "waiter-store",
    }
  )
)
