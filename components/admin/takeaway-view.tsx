"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Menu, ShoppingCart, ChevronUp, ChevronDown, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
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
import { cn } from "@/lib/utils"
import type { Category, Product } from "@/lib/types"

interface CartItem {
  cartItemId: string
  productId: string
  productName: string
  price: number
  quantity: number
  comment: string
}

interface TakeawayViewProps {
  categories: Category[]
  products: Product[]
}

// ── Cart Item ─────────────────────────────────────────────────────────────────

function TakeawayCartItem({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem
  onUpdate: (id: string, qty: number) => void
  onRemove: (id: string) => void
}) {
  const [qtyInput, setQtyInput] = useState(String(item.quantity))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQtyInput(e.target.value)
    const n = parseInt(e.target.value, 10)
    if (!isNaN(n) && n > 0) onUpdate(item.cartItemId, n)
  }

  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-black/10 bg-white p-4">
      <h3 className="text-center font-medium">{item.productName}</h3>
      <p className="mt-1 text-lg font-bold">{item.price}€</p>
      {item.comment && (
        <p className="mt-1 rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700 italic">
          {item.comment}
        </p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-red-500 text-white hover:bg-red-600"
          onClick={() => item.quantity > 1 && onUpdate(item.cartItemId, item.quantity - 1)}
        >
          <Minus className="h-5 w-5" />
        </Button>
        <input
          type="number"
          value={qtyInput}
          onChange={handleChange}
          className="w-12 text-center text-lg font-medium rounded border border-gray-300 py-1"
          min="1"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-green-500 text-white hover:bg-green-600"
          onClick={() => onUpdate(item.cartItemId, item.quantity + 1)}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="ml-2 h-10 w-10 text-red-600 hover:bg-red-50"
          onClick={() => onRemove(item.cartItemId)}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

// ── Product Card ──────────────────────────────────────────────────────────────

function TakeawayProductCard({
  product,
  onAdd,
}: {
  product: Product
  onAdd: (productId: string, qty: number, name: string, price: number, comment: string) => void
}) {
  const [quantity, setQuantity] = useState(1)
  const [qtyInput, setQtyInput] = useState("1")
  const [comment, setComment] = useState("")

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQtyInput(e.target.value)
    const n = parseInt(e.target.value, 10)
    if (!isNaN(n) && n > 0) setQuantity(n)
  }

  const handleAdd = () => {
    onAdd(product.id, quantity, product.name, product.price, comment.trim())
    setQuantity(1)
    setQtyInput("1")
    setComment("")
  }

  return (
    <div className="flex flex-col items-center rounded-xl border-2 border-black/10 bg-white p-4">
      <h3 className="text-center font-medium">{product.name}</h3>
      <p className="mt-1 text-lg font-bold">{product.price}€</p>
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-red-500 text-white hover:bg-red-600"
          onClick={() => { const n = Math.max(1, quantity - 1); setQuantity(n); setQtyInput(String(n)) }}
        >
          <Minus className="h-5 w-5" />
        </Button>
        <input
          type="number"
          value={qtyInput}
          onChange={handleQtyChange}
          className="w-12 text-center text-lg font-medium rounded border border-gray-300 py-1"
          min="1"
        />
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-green-500 text-white hover:bg-green-600"
          onClick={() => { setQuantity(quantity + 1); setQtyInput(String(quantity + 1)) }}
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          className="ml-6 gap-2 bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          onClick={handleAdd}
        >
          <ShoppingCart className="h-5 w-5" />
          <span>Καλάθι</span>
        </Button>
      </div>
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Σχόλιο (προαιρετικό)..."
        className="mt-3 w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
      />
    </div>
  )
}

// ── Main View ─────────────────────────────────────────────────────────────────

export function TakeawayView({ categories, products }: TakeawayViewProps) {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successOpen, setSuccessOpen] = useState(false)

  const addToCart = useCallback(
    (productId: string, qty: number, name: string, price: number, comment: string) => {
      setCart((prev) => [
        ...prev,
        {
          cartItemId: `${productId}-${Date.now()}-${Math.random()}`,
          productId,
          productName: name,
          price,
          quantity: qty,
          comment,
        },
      ])
    },
    []
  )

  const updateCartItem = useCallback((id: string, qty: number) => {
    setCart((prev) => prev.map((i) => (i.cartItemId === id ? { ...i, quantity: qty } : i)))
  }, [])

  const removeFromCart = useCallback((id: string) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== id))
  }, [])

  const itemCount = cart.reduce((s, i) => s + i.quantity, 0)
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : []

  const categoryName = categories.find((c) => c.id === selectedCategory)?.name

  const handleSubmit = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/admin/takeaway", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: Number(item.productId),
            quantity: item.quantity,
            price: item.price,
            comment: item.comment || null,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setSubmitError(data.error ?? "Σφάλμα αποστολής παραγγελίας")
        return
      }
      setCart([])
      setCartOpen(false)
      setConfirmOpen(false)
      setSuccessOpen(true)
    } catch {
      setSubmitError("Σφάλμα δικτύου. Δοκιμάστε ξανά.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-[#F5F5F5]">
      {/* Header */}
      <div className="flex items-center gap-3 bg-[#6DD3E3] px-4 py-3 text-white">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="flex-1 text-lg font-semibold">Νέα Παραγγελία Take Away</h1>
      </div>

      {/* Category Sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          aria-describedby={undefined}
          className="w-[280px] bg-[#7C6CEB] p-0 text-white [&>button]:hidden"
        >
          <SheetHeader className="p-4 pb-2">
            <SheetTitle className="text-xl font-bold text-white">Κατηγορίες</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 p-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setSidebarOpen(false) }}
                className={cn(
                  "rounded-md px-4 py-3 text-left text-sm transition-colors",
                  selectedCategory === cat.id ? "bg-white/20" : "hover:bg-white/10"
                )}
              >
                {cat.name}
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Products */}
      <main className="flex flex-1 flex-col pb-16">
        {!selectedCategory ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-gray-500">
            Επιλέξτε μια κατηγορία από το μενού
          </div>
        ) : (
          <div className="flex-1 overflow-auto p-4">
            {categoryName && (
              <h2 className="mb-4 text-center text-xl font-bold">{categoryName}</h2>
            )}
            <div className="flex flex-col gap-4">
              {filteredProducts.map((product) => (
                <TakeawayProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-center text-gray-500">
                  Δεν υπάρχουν προϊόντα σε αυτή την κατηγορία
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {itemCount > 0 && (
        <Drawer open={cartOpen} onOpenChange={setCartOpen}>
          <DrawerTrigger asChild>
            <button className="fixed inset-x-0 bottom-0 flex items-center justify-between bg-[#6DD3E3] px-4 py-3 text-white z-10">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <span className="font-medium">({itemCount})</span>
              </div>
              <ChevronUp className="h-6 w-6" />
            </button>
          </DrawerTrigger>
          <DrawerContent
            aria-describedby={undefined}
            className="h-[98dvh] max-h-[98dvh] rounded-t-2xl flex flex-col"
          >
            <DrawerHeader className="flex flex-row items-center justify-between border-b bg-[#6DD3E3] px-4 py-3 text-white shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <DrawerTitle className="text-white">({itemCount})</DrawerTitle>
              </div>
              <button onClick={() => setCartOpen(false)} className="hover:opacity-80 transition">
                <ChevronDown className="h-6 w-6" />
              </button>
            </DrawerHeader>

            <div className="flex-1 overflow-auto p-4">
              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <TakeawayCartItem
                    key={item.cartItemId}
                    item={item}
                    onUpdate={updateCartItem}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t bg-white p-4 shrink-0">
              {submitError && <p className="text-sm text-red-500">{submitError}</p>}
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Σύνολο: {total.toFixed(2)}€</span>
                <Button
                  className="bg-green-500 px-8 hover:bg-green-600"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isSubmitting}
                >
                  Αποστολή
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Submit Confirm Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Αποστολή παραγγελίας Take Away</AlertDialogTitle>
            <AlertDialogDescription>
              Θέλετε σίγουρα να στείλετε την παραγγελία; Θα καταχωρηθεί ως ολοκληρωμένη.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Άκυρο</AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-500 hover:bg-green-600"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Αποστολή..." : "Αποστολή"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Dialog */}
      <AlertDialog open={successOpen} onOpenChange={setSuccessOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Παραγγελία καταχωρήθηκε</AlertDialogTitle>
            <AlertDialogDescription>
              Η παραγγελία Take Away στάλθηκε επιτυχώς προς εκτύπωση.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setSuccessOpen(false); router.push("/admin") }}>
              Κλείσιμο
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
