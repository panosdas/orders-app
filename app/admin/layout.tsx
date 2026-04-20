import { cookies } from "next/headers"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "@/lib/session"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/sidebar"
import { Footer } from "@/components/admin/footer"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions)

  if (!session.isLoggedIn || session.role !== "admin") {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <Sidebar userName={session.name} />
        <main className="flex-1 bg-[#F5F5F5]">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
