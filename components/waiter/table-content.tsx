"use client"

import { useWaiterStore } from "@/lib/store"
import { NewOrderView } from "./new-order-view"
import { OrderOverview } from "./order-overview"
import type { Table, Category, Product, ActiveOrder, ActiveOrderItem } from "@/lib/types"

interface TableContentProps {
  table: Table
  categories: Category[]
  products: Product[]
  activeOrder: ActiveOrder | null
}

export function TableContent({ table, categories, products, activeOrder }: TableContentProps) {
  const getOrderByTableId = useWaiterStore((state) => state.getOrderByTableId)
  const zustandOrder = getOrderByTableId(table.id)

  const displayOrder: ActiveOrder | null = activeOrder ?? (zustandOrder
    ? {
        id: zustandOrder.id,
        status: "active",
        items: zustandOrder.subOrders.flatMap((so) =>
          so.items.map(
            (item): ActiveOrderItem => ({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              unitPrice: item.price,
              comment: null,
            })
          )
        ),
        grandTotal: zustandOrder.totalAmount,
      }
    : null)

  if (displayOrder) {
    return <OrderOverview table={table} order={displayOrder} categories={categories} products={products} />
  }

  return <NewOrderView table={table} categories={categories} products={products} />
}
