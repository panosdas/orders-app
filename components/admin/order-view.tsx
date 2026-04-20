"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ActiveOrder } from "@/lib/types"

interface OrderViewProps {
  tableNum: string
  waiterName: string
  order: ActiveOrder
}

export function OrderView({ tableNum, waiterName, order }: OrderViewProps) {
  const router = useRouter()
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleComplete = async () => {
    if (isCompleting) return
    setIsCompleting(true)
    setError(null)
    try {
      const res = await fetch("/api/orders/complete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: Number(order.id) }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Σφάλμα ολοκλήρωσης")
        return
      }
      router.push("/admin")
      router.refresh()
    } catch {
      setError("Σφάλμα δικτύου. Δοκιμάστε ξανά.")
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-0.5">
          <p className="text-base font-medium">Τραπέζι {tableNum}</p>
          <p className="text-base font-medium">Παραγγελία #{order.id}</p>
          <p className="text-base font-medium">Σερβιτόρος&nbsp; {waiterName}</p>
        </div>
        <Button
          className="bg-[#6DD3E3] hover:bg-[#5bc3d3] disabled:opacity-40"
          onClick={() => setConfirmOpen(true)}
          disabled={isCompleting}
        >
          {isCompleting ? "Επεξεργασία..." : "Πληρωμή"}
        </Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Είδος</TableHead>
              <TableHead className="text-center">Ποσότητα</TableHead>
              <TableHead className="text-right">Τιμή</TableHead>
              <TableHead>Σχόλιο</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {order.items.map((item, idx) => (
              <TableRow key={idx}>
                <TableCell>{item.productName}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {(item.quantity * item.unitPrice).toFixed(0)}€
                </TableCell>
                <TableCell className="text-sm text-gray-500">
                  {item.comment?.trim() || "-"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t-2 font-bold">
              <TableCell>Σύνολο</TableCell>
              <TableCell />
              <TableCell className="text-right">{order.grandTotal.toFixed(0)}€</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Επιβεβαίωση πληρωμής</AlertDialogTitle>
            <AlertDialogDescription>
              Θέλετε σίγουρα να ολοκληρώσετε την παραγγελία #{order.id} για το τραπέζι {tableNum};
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Άκυρο</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#6DD3E3] hover:bg-[#5bc3d3]"
              onClick={handleComplete}
            >
              Πληρωμή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
