"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
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

const NAV_ITEMS = [
  { label: "Τραπέζια", href: "/admin" },
  { label: "Νέα Παραγγελία Take Away", href: "/admin/takeaway" },
  { label: "Παραγγελίες", href: "/admin/paraggelies" },
  { label: "Κατηγορίες", href: "/admin/categories" },
  { label: "Προϊόντα", href: "/admin/products" },
  { label: "Στατιστικά", href: "/admin/statistika" },
]

interface SidebarProps {
  userName: string
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <>
      <aside className="flex w-56 flex-col bg-[#5A52D5] text-white min-h-screen">
        <div className="px-4 py-5 text-xl font-bold">Διαχείρηση</div>

        <nav className="flex-1 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/20 space-y-1">
          <p className="text-xs text-white/50 truncate">{userName}</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white px-3"
            onClick={() => setConfirmOpen(true)}
          >
            Αποσύνδεση
          </Button>
        </div>
      </aside>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Αποσύνδεση</AlertDialogTitle>
            <AlertDialogDescription>
              Θέλετε σίγουρα να αποσυνδεθείτε;
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Άκυρο</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>Αποσύνδεση</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
