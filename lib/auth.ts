import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

// Log d'erreur silencieux pour éviter d'encombrer la console
const logError = (message: string, error?: any) => {
  // En production, on pourrait utiliser un service de logging externe
  if (process.env.NODE_ENV === "production") {
    // Log silencieux en production
    return
  }
  
  // En développement, on affiche un message court sans la trace complète
  console.log(`[Auth] ${message}`)
}

async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    })
    return user
  } catch (error) {
    logError("Erreur lors de la recherche de l'utilisateur")
    throw new Error("Erreur de base de données")
  }
}

async function verifyPassword(password: string, hashedPassword: string) {
  try {
    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    logError("Erreur lors de la vérification du mot de passe")
    throw new Error("Erreur de vérification du mot de passe")
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Veuillez fournir un email et un mot de passe")
          }

          const user = await getUserByEmail(credentials.email)

          if (!user) {
            throw new Error("Aucun compte trouvé avec cet email")
          }

          if (!user.password) {
            throw new Error("Méthode d'authentification non valide")
          }

          const isPasswordValid = await verifyPassword(credentials.password, user.password)

          if (!isPasswordValid) {
            throw new Error("Mot de passe incorrect")
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          // Capture l'erreur sans afficher la trace complète
          if (error instanceof Error) {
            logError(`Échec d'authentification: ${error.message}`)
            throw error
          }
          logError("Erreur d'authentification inconnue")
          throw new Error("Erreur d'authentification inconnue")
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      
      if (token.role && session.user) {
        session.user.role = token.role
      }
      
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      
      return token
    },
  },
  pages: {
    signIn: "/auth",
    error: "/auth/error",
  },
  logger: {
    error(code, metadata) {
      logError(`Code d'erreur: ${code}`, metadata)
    },
    warn(code) {
      logError(`Avertissement: ${code}`)
    },
    debug(code, metadata) {
      // Ne rien faire en debug pour réduire le bruit
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} 