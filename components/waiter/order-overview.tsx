"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Menu, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Table as TableType, ActiveOrder, Category, Product } from "@/lib/types"
import { CategorySidebar } from "./category-sidebar"
import { ProductList } from "./product-list"
import { CartDrawer } from "./cart-drawer"

interface OrderOverviewProps {
  table: TableType
  order: ActiveOrder
  categories: Category[]
  products: Product[]
}

export function OrderOverview({ table, order, categories, products }: OrderOverviewProps) {
  const router = useRouter()
  const [isAddingMore, setIsAddingMore] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [commentsExpanded, setCommentsExpanded] = useState(true)
  const [isPaying, setIsPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const itemsWithoutComment = order.items.filter((i) => !i.comment?.trim())
  const itemsWithComment = order.items.filter((i) => i.comment?.trim())

  const aggregated = itemsWithoutComment.reduce<
    Record<string, { productName: string; quantity: number; totalPrice: number }>
  >((acc, item) => {
    if (acc[item.productId]) {
      acc[item.productId].quantity += item.quantity
      acc[item.productId].totalPrice += item.quantity * item.unitPrice
    } else {
      acc[item.productId] = {
        productName: item.productName,
        quantity: item.quantity,
        totalPrice: item.quantity * item.unitPrice,
      }
    }
    return acc
  }, {})

  const aggregatedItems = Object.entries(aggregated)
  const headerTitle = `${table.name}${table.customerName ? `-${table.customerName}` : ""}`

  const handlePayment = async () => {
    if (isPaying) return
    setIsPaying(true)
    setPayError(null)
    try {
      const res = await fetch("/api/orders/pay", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: Number(order.id) }),
      })
      if (!res.ok) {
        const data = await res.json()
        setPayError(data.error ?? "Σφάλμα πληρωμής")
        return
      }
      router.push("/waiter")
      router.refresh()
    } catch {
      setPayError("Σφάλμα δικτύου. Δοκιμάστε ξανά.")
    } finally {
      setIsPaying(false)
    }
  }

  if (isAddingMore) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F5F5F5]">
        <div className="flex items-center justify-between bg-[#6DD3E3] px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold">{headerTitle}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => setIsAddingMore(false)}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        </div>

        <CategorySidebar open={sidebarOpen} onOpenChange={setSidebarOpen} categories={categories} />

        <main className="flex flex-1 flex-col pb-16">
          <ProductList categories={categories} products={products} />
        </main>

        <CartDrawer tableId={table.id} parentOrderId={order.id} onOrderSubmitted={() => setIsAddingMore(false)} />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F5F5]">
      <div className="flex items-center justify-between bg-[#6DD3E3] px-4 py-3 text-white">
        <h1 className="text-lg font-semibold">{headerTitle}</h1>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-400"
          onClick={() => router.push("/waiter")}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      {order.status === "paid" && (
        <div className="flex items-center gap-2 bg-amber-50 px-4 py-3 text-amber-800 border-b border-amber-200">
          <span className="text-sm font-medium">⏳ Εν αναμονή επιβεβαίωσης πληρωμής από ταμείο</span>
        </div>
      )}

      <div className="flex justify-end p-4">
        <Button
          className="bg-[#6DD3E3] hover:bg-[#5bc3d3] disabled:opacity-40"
          onClick={() => setIsAddingMore(true)}
          disabled={order.status === "paid"}
        >
          Προσθήκη
        </Button>
      </div>

      <main className="flex-1 space-y-4 px-4">
        <div className="rounded-lg border bg-white p-4">
          <h2 className="mb-4 text-xl font-bold">Παραγγελία #{order.id}</h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Είδος</TableHead>
                <TableHead className="text-center">Ποσότητα</TableHead>
                <TableHead className="text-right">Τιμή</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aggregatedItems.map(([productId, item]) => (
                <TableRow key={productId}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{item.totalPrice.toFixed(2)}€</TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 font-bold">
                <TableCell>Σύνολο</TableCell>
                <TableCell />
                <TableCell className="text-right">{order.grandTotal.toFixed(2)}€</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {itemsWithComment.length > 0 && (
            <div className="mt-6">
              <button
                className="flex w-full items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                onClick={() => setCommentsExpanded((v) => !v)}
              >
                <span>Ειδικές παραγγελίες ({itemsWithComment.length})</span>
                {commentsExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {commentsExpanded && (
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Είδος</TableHead>
                      <TableHead className="text-center">Ποσ.</TableHead>
                      <TableHead>Σχόλιο</TableHead>
                      <TableHead className="text-right">Τιμή</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsWithComment.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-sm text-gray-500">{item.comment}</TableCell>
                        <TableCell className="text-right">
                          {(item.quantity * item.unitPrice).toFixed(2)}€
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          )}
        </div>
      </main>

      <div className="flex flex-col gap-2 p-4">
        {payError && <p className="text-sm text-red-500">{payError}</p>}
        <Button
          className="w-full bg-green-500 py-6 text-lg hover:bg-green-600 disabled:opacity-40"
          onClick={handlePayment}
          disabled={isPaying || order.status === "paid"}
        >
          {isPaying ? "Επεξεργασία..." : "Πληρωμή"}
        </Button>
      </div>
    </div>
  )
}
