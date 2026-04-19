"use client"

import { ShoppingCart, ChevronUp, ChevronDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useWaiterStore } from "@/lib/store"
import { CartItem } from "./cart-item"

interface CartDrawerProps {
  tableId: string
  parentOrderId?: string | null
  onOrderSubmitted?: () => void
}

export function CartDrawer({ tableId, parentOrderId, onOrderSubmitted }: CartDrawerProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cart = useWaiterStore((state) => state.cart)
  const getCartTotal = useWaiterStore((state) => state.getCartTotal)
  const getCartItemCount = useWaiterStore((state) => state.getCartItemCount)
  const clearCart = useWaiterStore((state) => state.clearCart)

  const itemCount = getCartItemCount()
  const total = getCartTotal()

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: Number(tableId),
          parentOrderId: parentOrderId ? Number(parentOrderId) : null,
          items: cart.map((item) => ({
            productId: Number(item.productId),
            quantity: item.quantity,
            price: item.price,
            comment: item.comment || null,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Σφάλμα αποστολής παραγγελίας")
        return
      }

      clearCart()
      setIsOpen(false)

      if (onOrderSubmitted) {
        onOrderSubmitted()
      }
      router.refresh()
    } catch {
      setError("Σφάλμα δικτύου. Δοκιμάστε ξανά.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (itemCount === 0) return null

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button className="fixed inset-x-0 bottom-0 flex items-center justify-between bg-[#6DD3E3] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            <span className="font-medium">({itemCount})</span>
          </div>
          <ChevronUp className="h-6 w-6" />
        </button>
      </DrawerTrigger>
      <DrawerContent aria-describedby={undefined} className="h-[98dvh] max-h-[98dvh] rounded-t-2xl flex flex-col">
        <DrawerHeader className="flex flex-row items-center justify-between border-b bg-[#6DD3E3] px-4 py-3 text-white shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            <DrawerTitle className="text-white">({itemCount})</DrawerTitle>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:opacity-80 transition">
            <ChevronDown className="h-6 w-6" />
          </button>
        </DrawerHeader>

        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-col gap-4">
            {cart.map((item) => (
              <CartItem key={item.cartItemId} item={item} />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t bg-white p-4 shrink-0">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold">Σύνολο: {total.toFixed(2)}&#8364;</span>
            <Button
              className="bg-green-500 px-8 hover:bg-green-600"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Αποστολή..." : "Αποστολή"}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
