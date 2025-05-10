import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Liste des routes protégées qui nécessitent une authentification
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/profile',
  '/onboarding/artisan',
  '/create-project'
]

// Liste des routes qui nécessitent un rôle spécifique
const roleBasedRoutes = {
  '/admin': ['ADMIN', 'AGENT'],
  '/onboarding/artisan': ['ARTISAN']
}

// Liste des routes qui sont accessibles uniquement aux utilisateurs non connectés
const publicOnlyRoutes = [
  '/auth',
  '/register'
]

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { pathname } = url
  
  // Récupérer le token d'authentification
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })
  
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = !!token
  
  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Vérifier si la route nécessite un rôle spécifique
  const requiredRoles = Object.entries(roleBasedRoutes).find(([route]) => pathname.startsWith(route))?.[1]
  
  // Vérifier si la route est uniquement pour les utilisateurs non connectés
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => pathname.startsWith(route))
  
  // Redirection vers la page de connexion si la route est protégée et que l'utilisateur n'est pas authentifié
  if (isProtectedRoute && !isAuthenticated) {
    url.pathname = '/auth'
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }
  
  // Redirection vers la page d'accueil si l'utilisateur est authentifié mais tente d'accéder à une route publique uniquement
  if (isPublicOnlyRoute && isAuthenticated) {
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  
  // Vérification des rôles pour les routes qui nécessitent un rôle spécifique
  if (requiredRoles && isAuthenticated) {
    const userRole = token.role as string
    
    if (!requiredRoles.includes(userRole)) {
      // Si l'utilisateur n'a pas le rôle requis, rediriger vers la page d'accueil
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }
  
  // Continuer le traitement de la requête si tout est correct
  return NextResponse.next()
}

// Configuration pour les routes qui doivent passer par le middleware
export const config = {
  matcher: [
    /*
     * Matcher pour les routes qui nécessitent une authentification
     * - Exclut les routes qui n'ont pas besoin d'authentification comme /api/auth
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)',
  ],
} 