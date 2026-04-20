"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

type AdminTableStatus = "available" | "active" | "paid"

interface AdminTableItem {
  id: number
  table_num: string
  status: AdminTableStatus
  waiterName?: string
}

interface TablesGridProps {
  tables: AdminTableItem[]
}

export function TablesGrid({ tables }: TablesGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
      {tables.map((table) => {
        const hasOrder = table.status === "active" || table.status === "paid"

        const card = (
          <div
            className={cn(
              "flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-black/10 p-4 transition-transform",
              hasOrder && "active:scale-95",
              table.status === "available" && "bg-[#C8E6C9]",
              table.status === "active" && "bg-[#FFCC80]",
              table.status === "paid" && "bg-[#6DD3E3]",
            )}
          >
            <span className="text-lg font-bold">{table.table_num}</span>
            {table.waiterName && (
              <span className="text-xs text-gray-700">{table.waiterName}</span>
            )}
            {table.status === "paid" && (
              <span className="text-xs text-white/90">Αναμονή πληρωμής</span>
            )}
          </div>
        )

        if (!hasOrder) return <div key={table.id}>{card}</div>

        return (
          <Link key={table.id} href={`/admin/table/${table.id}`}>
            {card}
          </Link>
        )
      })}
    </div>
  )
}
