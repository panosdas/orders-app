"use client"

import Link from "next/link"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

type TableStatus = "available" | "mine" | "mine-paid" | "other"

interface TableItem {
  id: number
  table_num: string
  status: TableStatus
  waiterName?: string
}

interface TablesGridProps {
  tables: TableItem[]
}

export function TablesGrid({ tables }: TablesGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {tables.map((table) => {
        const blocked = table.status === "other"

        const card = (
          <div
            className={cn(
              "flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-lg border-2 border-black/10 p-4 transition-transform",
              !blocked && "active:scale-95",
              table.status === "available" && "bg-[#C8E6C9]",
              table.status === "mine" && "bg-[#FFCC80]",
              table.status === "mine-paid" && "bg-[#6DD3E3]",
              table.status === "other" && "cursor-not-allowed bg-[#EF9A9A] opacity-80",
            )}
          >
            <span className="text-lg font-bold">{table.table_num}</span>
            {blocked && (
              <span className="flex items-center gap-1 text-xs text-red-900">
                <Lock className="h-3 w-3" />
                {table.waiterName ?? "Σε εξυπηρέτηση"}
              </span>
            )}
            {table.status === "mine-paid" && (
              <span className="text-xs text-white/90">Αναμονή ταμείου</span>
            )}
          </div>
        )

        if (blocked) return <div key={table.id}>{card}</div>

        return (
          <Link key={table.id} href={`/waiter/table/${table.id}`}>
            {card}
          </Link>
        )
      })}
    </div>
  )
}
