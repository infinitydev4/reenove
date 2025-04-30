import NextAuth from "next-auth"
import { Role } from "@/lib/generated/prisma"

declare module "next-auth" {
  interface User {
    id: string
    role?: Role
    phone?: string
    address?: string
    city?: string
    postalCode?: string
  }

  interface Session {
    user: User & {
      id: string
      role?: Role
      phone?: string
      address?: string
      city?: string
      postalCode?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role
  }
} 