"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Footer } from "./footer"
import { CategorySidebar } from "./category-sidebar"
import { ProductList } from "./product-list"
import { CartDrawer } from "./cart-drawer"
import { useWaiterStore } from "@/lib/store"
import type { Table, Category, Product } from "@/lib/types"

interface NewOrderViewProps {
  table: Table
  categories: Category[]
  products: Product[]
}

export function NewOrderView({ table, categories, products }: NewOrderViewProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const setCurrentTable = useWaiterStore((state) => state.setCurrentTable)
  const clearCart = useWaiterStore((state) => state.clearCart)
  const cart = useWaiterStore((state) => state.cart)

  useEffect(() => {
    setCurrentTable(table.id)
    return () => setCurrentTable(null)
  }, [table.id, setCurrentTable])

  const handleCancel = () => {
    if (cart.length > 0) {
      setShowCancelDialog(true)
    } else {
      router.push("/waiter")
    }
  }

  const handleCancelConfirm = () => {
    clearCart()
    setShowCancelDialog(false)
    router.push("/waiter")
  }

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
          <h1 className="text-lg font-semibold">{table.name}</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      <CategorySidebar open={sidebarOpen} onOpenChange={setSidebarOpen} categories={categories} />

      <main className="flex flex-1 flex-col pb-16">
        <ProductList categories={categories} products={products} />
      </main>

      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-center gap-2">
              <X className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-bold">Ακύρωση Παραγγελίας</h2>
            </div>
            <p className="text-gray-700">
              Έχετε {cart.length} προϊόντα στο καλάθι. Θέλετε να τα διαγράψετε;
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                Όχι, Συνέχεια
              </Button>
              <Button className="bg-red-500 hover:bg-red-600" onClick={handleCancelConfirm}>
                Ναι, Ακύρωση
              </Button>
            </div>
          </div>
        </div>
      )}

      <CartDrawer tableId={table.id} parentOrderId={null} />
      <Footer />
    </div>
  )
}
