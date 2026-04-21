"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

export function CategoriesView() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) setCategories(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const newCategory = await res.json()
        setCategories((prev) =>
          [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name, "el"))
        )
        setName("")
      } else {
        const data = await res.json()
        setError(data.error ?? "Σφάλμα προσθήκης")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Κατηγορίες</h2>

      <div className="border rounded-lg p-4 space-y-3 bg-white">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Νέα Κατηγορία
        </h3>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            placeholder="Όνομα κατηγορίας"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={submitting || !name.trim()}
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-gray-400">
                  Φόρτωση...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-gray-400">
                  Δεν υπάρχουν κατηγορίες
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-gray-500 w-16">{cat.id}</TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
