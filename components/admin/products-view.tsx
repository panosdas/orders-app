"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Category {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  price: number
  categoryId: number
  categoryName: string
  isAvailable: boolean
}

export function ProductsView() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories"),
      ])
      if (productsRes.ok) setProducts(await productsRes.json())
      if (categoriesRes.ok) setCategories(await categoriesRes.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price || !categoryId) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: parseFloat(price), categoryId: parseInt(categoryId) }),
      })
      if (res.ok) {
        setName("")
        setPrice("")
        setCategoryId("")
        await fetchData()
      } else {
        const data = await res.json()
        setError(data.error ?? "Σφάλμα προσθήκης")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const isFormValid = name.trim() && price && !isNaN(parseFloat(price)) && parseFloat(price) >= 0 && categoryId

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold">Προϊόντα</h2>

      <div className="border rounded-lg p-4 space-y-3 bg-white">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Νέο Προϊόν
        </h3>
        <form onSubmit={handleSubmit} className="flex gap-2 flex-wrap">
          <Input
            placeholder="Όνομα προϊόντος"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className="flex-1 min-w-40"
          />
          <Input
            placeholder="Τιμή (€)"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={submitting}
            className="w-32"
          />
          <Select value={categoryId} onValueChange={setCategoryId} disabled={submitting}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Κατηγορία" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={submitting || !isFormValid}
            className="bg-[#5A52D5] hover:bg-[#4a43c0] text-white"
          >
            {submitting ? "Αποθήκευση..." : "Προσθήκη"}
          </Button>
        </form>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold">ID</TableHead>
              <TableHead className="font-bold">Όνομα</TableHead>
              <TableHead className="font-bold">Κατηγορία</TableHead>
              <TableHead className="font-bold">Τιμή</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                  Φόρτωση...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-400">
                  Δεν υπάρχουν προϊόντα
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="text-gray-500 w-16">{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-gray-600">{product.categoryName}</TableCell>
                  <TableCell>{product.price}€</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
