"use client"

import { Menu, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title: string
  onMenuClick?: () => void
  showMenu?: boolean
  showLogout?: boolean
}

export function Header({ title, onMenuClick, showMenu = false, showLogout = false }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <header className="flex items-center gap-3 bg-[#6DD3E3] px-4 py-3 text-white">
      {showMenu && (
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Menu</span>
        </Button>
      )}
      <h1 className="flex-1 text-lg font-medium">{title}</h1>
      {showLogout && (
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Αποσύνδεση</span>
        </Button>
      )}
    </header>
  )
}
