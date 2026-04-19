"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useWaiterStore } from "@/lib/store"
import type { CartItem as CartItemType } from "@/lib/types"

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const [quantityInput, setQuantityInput] = useState(String(item.quantity))
  const updateCartItem = useWaiterStore((state) => state.updateCartItem)
  const removeFromCart = useWaiterStore((state) => state.removeFromCart)

  useEffect(() => {
    setQuantityInput(String(item.quantity))
  }, [item.quantity])

  const handleDecrease = () => {
    if (item.quantity > 1) updateCartItem(item.cartItemId, item.quantity - 1)
  }

  const handleIncrease = () => {
    updateCartItem(item.cartItemId, item.quantity + 1)
  }

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuantityInput(value)
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0) updateCartItem(item.cartItemId, num)
  }

  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-black/10 bg-white p-4">
      <h3 className="text-center font-medium">{item.productName}</h3>
      <p className="mt-1 text-lg font-bold">{item.price}&#8364;</p>

      {item.comment && (
        <p className="mt-1 rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700 italic">
          {item.comment}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-red-500 text-white hover:bg-red-600"
          onClick={handleDecrease}
        >
          <Minus className="h-5 w-5" />
        </Button>
        <input
          type="number"
          value={quantityInput}
          onChange={handleQuantityInputChange}
          className="w-12 text-center text-lg font-medium rounded border border-gray-300 py-1"
          min="1"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-green-500 text-white hover:bg-green-600"
          onClick={handleIncrease}
        >
          <Plus className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="ml-2 h-10 w-10 text-red-600 hover:bg-red-50"
          onClick={() => removeFromCart(item.cartItemId)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}
