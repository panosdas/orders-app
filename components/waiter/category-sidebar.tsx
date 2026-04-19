"use client"

import { useWaiterStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Category } from "@/lib/types"

interface CategorySidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: Category[]
}

export function CategorySidebar({ open, onOpenChange, categories }: CategorySidebarProps) {
  const selectedCategory = useWaiterStore((state) => state.selectedCategory)
  const setSelectedCategory = useWaiterStore((state) => state.setSelectedCategory)

  const handleSelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        aria-describedby={undefined}
        className="w-[280px] bg-[#7C6CEB] p-0 text-white [&>button]:hidden"
      >
        <SheetHeader className="p-4 pb-2">
          <SheetTitle className="text-xl font-bold text-white">Κατηγορίες</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelect(category.id)}
              className={cn(
                "rounded-md px-4 py-3 text-left text-sm transition-colors",
                selectedCategory === category.id ? "bg-white/20" : "hover:bg-white/10",
              )}
            >
              {category.name}
            </button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
