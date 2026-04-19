"use client"

import { useWaiterStore } from "@/lib/store"
import { ProductCard } from "./product-card"
import type { Category, Product } from "@/lib/types"

interface ProductListProps {
  categories: Category[]
  products: Product[]
}

export function ProductList({ categories, products }: ProductListProps) {
  const selectedCategory = useWaiterStore((state) => state.selectedCategory)

  if (!selectedCategory) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-gray-500">
        Επιλέξτε μια κατηγορία από το μενού
      </div>
    )
  }

  const categoryName = categories.find((c) => c.id === selectedCategory)?.name
  const filteredProducts = products.filter((p) => p.categoryId === selectedCategory)

  return (
    <div className="flex-1 overflow-auto p-4">
      {categoryName && (
        <h2 className="mb-4 text-center text-xl font-bold">{categoryName}</h2>
      )}
      <div className="flex flex-col gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {filteredProducts.length === 0 && (
          <p className="text-center text-gray-500">Δεν υπάρχουν προϊόντα σε αυτή την κατηγορία</p>
        )}
      </div>
    </div>
  )
}
