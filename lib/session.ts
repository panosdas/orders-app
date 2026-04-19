import { SessionOptions } from "iron-session"

export interface SessionData {
  userId: number
  name: string
  role: string
  isLoggedIn: boolean
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "orders_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 1 day — sliding: reset on every request via middleware
  },
}
