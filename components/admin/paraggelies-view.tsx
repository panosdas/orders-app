"use client"

import React, { useState, useEffect, useCallback } from "react"
import { RefreshCw, Printer, ChevronDown, ChevronRight } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type StatusFilter = "all" | "active" | "paid" | "completed"

interface OrderItem {
  productName: string
  quantity: number
  price: number
  comment: string | null
}

interface Order {
  id: number
  status: string
  totalPrice: number
  tableName: string
  userName: string
  parentOrder: number | null
  items: OrderItem[]
}

const STATUS_LABELS: Record<string, string> = {
  active: "Ενεργή",
  paid: "Πληρωμένη",
  completed: "Ολοκληρωμένη",
}

const FILTER_TABS: { key: StatusFilter; label: string; activeClass: string }[] = [
  { key: "all", label: "Όλες", activeClass: "bg-gray-400 text-white" },
  { key: "active", label: "Ενεργές", activeClass: "bg-green-500 text-white" },
  { key: "paid", label: "Προς Πληρωμή", activeClass: "bg-[#6DD3E3] text-white" },
  { key: "completed", label: "Ολοκληρωμένες", activeClass: "bg-[#4BBFCC] text-white" },
]

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100]

export function ParaggeliesView() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [search, setSearch] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(100)
  const [printingId, setPrintingId] = useState<number | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = statusFilter !== "all" ? `?status=${statusFilter}` : ""
      const res = await fetch(`/api/admin/orders${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
        setPage(0)
      }
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handlePrint = async (e: React.MouseEvent, orderId: number) => {
    e.stopPropagation()
    setPrintingId(orderId)
    try {
      await fetch("/api/admin/orders/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      })
    } finally {
      setPrintingId(null)
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      String(order.id).includes(q) ||
      order.userName.toLowerCase().includes(q) ||
      String(order.tableName).toLowerCase().includes(q)
    )
  })

  const totalRows = filteredOrders.length
  const paginatedOrders = filteredOrders.slice(
    page * rowsPerPage,
    (page + 1) * rowsPerPage
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === tab.key
                ? tab.activeClass
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="ml-auto p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
          title="Ανανέωση"
        >
          <RefreshCw
            className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      <h2 className="text-2xl font-bold">Παραγγελίες</h2>

      <div className="max-w-md">
        <Input
          placeholder="Αριθμός Παραγγελίας, Τραπέζι, Σερβιτόρος"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="font-bold">Αριθμός Παραγγελίας</TableHead>
              <TableHead className="font-bold">Τραπέζι</TableHead>
              <TableHead className="font-bold">Σερβιτόρος</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Παραγγελία Αναφοράς</TableHead>
              <TableHead className="font-bold">Σύνολο</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  Φόρτωση...
                </TableCell>
              </TableRow>
            ) : paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  Δεν βρέθηκαν παραγγελίες
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleRow(order.id)}
                  >
                    <TableCell>
                      {expandedRows.has(order.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </TableCell>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.tableName}</TableCell>
                    <TableCell>{order.userName}</TableCell>
                    <TableCell>{STATUS_LABELS[order.status] ?? order.status}</TableCell>
                    <TableCell>{order.parentOrder ?? "-"}</TableCell>
                    <TableCell>{order.totalPrice}€</TableCell>
                    <TableCell>
                      <button
                        onClick={(e) => handlePrint(e, order.id)}
                        disabled={printingId === order.id}
                        className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title="Εκτύπωση"
                      >
                        <Printer className="w-4 h-4 text-gray-600" />
                      </button>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(order.id) && (
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableCell colSpan={8} className="p-0">
                        <div className="px-12 py-2">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="font-semibold text-sm">Είδος</TableHead>
                                <TableHead className="font-semibold text-sm">Ποσότητα</TableHead>
                                <TableHead className="font-semibold text-sm">Τιμή</TableHead>
                                <TableHead className="font-semibold text-sm">Σχόλιο</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {order.items.length === 0 ? (
                                <TableRow>
                                  <TableCell
                                    colSpan={4}
                                    className="text-center text-gray-400 text-sm"
                                  >
                                    Δεν υπάρχουν προϊόντα
                                  </TableCell>
                                </TableRow>
                              ) : (
                                order.items.map((item, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="text-sm">{item.productName}</TableCell>
                                    <TableCell className="text-sm">{item.quantity}</TableCell>
                                    <TableCell className="text-sm">{item.price}€</TableCell>
                                    <TableCell className="text-sm">
                                      {item.comment ?? "-"}
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end gap-4 text-sm text-gray-600">
        <span>Rows per page:</span>
        <Select
          value={String(rowsPerPage)}
          onValueChange={(v) => {
            setRowsPerPage(Number(v))
            setPage(0)
          }}
        >
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROWS_PER_PAGE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span>
          {totalRows === 0
            ? "0"
            : `${page * rowsPerPage + 1}-${Math.min(
                (page + 1) * rowsPerPage,
                totalRows
              )} of ${totalRows}`}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 0}
        >
          {"<"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setPage((p) => p + 1)}
          disabled={(page + 1) * rowsPerPage >= totalRows}
        >
          {">"}
        </Button>
      </div>
    </div>
  )
}
