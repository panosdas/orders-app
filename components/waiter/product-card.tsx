"use client"

import { Minus, Plus, ShoppingCart } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWaiterStore } from "@/lib/store"
import type { Product } from "@/lib/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [quantityInput, setQuantityInput] = useState("1")
  const [comment, setComment] = useState("")
  const addToCart = useWaiterStore((state) => state.addToCart)

  const handleDecrease = () => {
    const next = Math.max(1, quantity - 1)
    setQuantity(next)
    setQuantityInput(String(next))
  }

  const handleIncrease = () => {
    const next = quantity + 1
    setQuantity(next)
    setQuantityInput(String(next))
  }

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuantityInput(value)
    const num = parseInt(value, 10)
    if (!isNaN(num) && num > 0) setQuantity(num)
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity, product.name, product.price, comment.trim())
    setQuantity(1)
    setQuantityInput("1")
    setComment("")
  }

  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-black/10 bg-white p-4">
      <h3 className="text-center font-medium">{product.name}</h3>
      <p className="mt-1 text-lg font-bold">{product.price}&#8364;</p>

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
          className="ml-6 gap-2 bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Καλάθι</span>
        </Button>
      </div>

      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Σχόλιο (προαιρετικό)..."
        className="mt-3 w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
      />
    </div>
  )
}
