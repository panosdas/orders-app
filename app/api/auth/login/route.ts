import { NextRequest, NextResponse } from "next/server"
import { getIronSession } from "iron-session"
import { SessionData, sessionOptions } from "@/lib/session"
import { getSupabaseAdminClient } from "@/lib/db"
import argon2 from "argon2"

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Συμπληρώστε όλα τα πεδία" }, { status: 400 })
  }

  let user
  try {
    const supabase = getSupabaseAdminClient()
    const { data, error } = await supabase
      .from("USER")
      .select("id, name, password_hash, role, isactive")
      .eq("email", email.trim().toLowerCase())
      .single()

    if (error && error.code !== "PGRST116") throw error
    user = data
  } catch (err) {
    console.error("[DB ERROR]", err)
    return NextResponse.json({ error: "Σφάλμα σύνδεσης με τη βάση δεδομένων" }, { status: 500 })
  }

  if (!user) {
    return NextResponse.json({ error: "Λάθος στοιχεία σύνδεσης" }, { status: 401 })
  }

  if (!user.isactive) {
    return NextResponse.json({ error: "Ο λογαριασμός είναι ανενεργός" }, { status: 401 })
  }

  const validPassword = await argon2.verify(user.password_hash, password)
  if (!validPassword) {
    return NextResponse.json({ error: "Λάθος στοιχεία σύνδεσης" }, { status: 401 })
  }

  const redirectTo = user.role === "admin" ? "/admin" : user.role === "service" ? "/waiter" : "/"

  const response = NextResponse.json({ success: true, redirectTo })
  const session = await getIronSession<SessionData>(request, response, sessionOptions)

  session.userId = user.id
  session.name = user.name
  session.role = user.role
  session.isLoggedIn = true
  await session.save()

  return response
}
