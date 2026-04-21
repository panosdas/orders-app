"use client"

import { useState, useEffect, useCallback } from "react"
import { RefreshCw, TrendingUp, ShoppingBasket } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface ProductStat {
  productId: number
  productName: string
  categoryId: number
  categoryName: string
  totalQuantity: number
  totalRevenue: number
}

interface CategoryStat {
  categoryId: number
  categoryName: string
  products: ProductStat[]
}

interface StatsData {
  totalRevenue: number
  byCategory: CategoryStat[]
}

export function StatsView() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const totalProducts = data?.byCategory.reduce(
    (sum, cat) => sum + cat.products.reduce((s, p) => s + p.totalQuantity, 0),
    0
  ) ?? 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Στατιστικά</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Ανανέωση"
        >
          <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="border rounded-xl p-5 bg-white flex items-center gap-4">
          <div className="p-3 rounded-full bg-[#5A52D5]/10">
            <TrendingUp className="w-6 h-6 text-[#5A52D5]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Γενικά Έσοδα</p>
            <p className="text-2xl font-bold">
              {loading ? "—" : `${(data?.totalRevenue ?? 0).toFixed(2)}€`}
            </p>
          </div>
        </div>
        <div className="border rounded-xl p-5 bg-white flex items-center gap-4">
          <div className="p-3 rounded-full bg-[#6DD3E3]/20">
            <ShoppingBasket className="w-6 h-6 text-[#4BBFCC]" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Σύνολο Τεμαχίων</p>
            <p className="text-2xl font-bold">
              {loading ? "—" : totalProducts}
            </p>
          </div>
        </div>
      </div>

      {/* Per-category tables */}
      {loading ? (
        <p className="text-gray-400 py-8 text-center">Φόρτωση...</p>
      ) : !data || data.byCategory.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">Δεν υπάρχουν δεδομένα</p>
      ) : (
        <div className="space-y-6">
          {data.byCategory.map((cat) => {
            const catRevenue = cat.products.reduce((s, p) => s + p.totalRevenue, 0)
            const catQty = cat.products.reduce((s, p) => s + p.totalQuantity, 0)
            return (
              <div key={cat.categoryId} className="border rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-[#5A52D5]/5 border-b flex items-center justify-between">
                  <span className="font-semibold text-[#5A52D5]">{cat.categoryName}</span>
                  <span className="text-sm text-gray-500">
                    {catQty} τεμ. &middot; {catRevenue.toFixed(2)}€
                  </span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Προϊόν</TableHead>
                      <TableHead className="font-bold text-right">Ποσότητα</TableHead>
                      <TableHead className="font-bold text-right">Έσοδα</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cat.products.map((p) => (
                      <TableRow key={p.productId}>
                        <TableCell>{p.productName}</TableCell>
                        <TableCell className="text-right">{p.totalQuantity}</TableCell>
                        <TableCell className="text-right font-medium">
                          {p.totalRevenue.toFixed(2)}€
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
