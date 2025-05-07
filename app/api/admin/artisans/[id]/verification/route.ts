import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ArtisanVerificationStatus, Role } from "@/lib/generated/prisma"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions d'admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }
    
    // Vérifier si l'utilisateur est administrateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    
    if (user?.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const artisanId = params.id
    const body = await request.json()
    
    // Validation du corps de la requête
    if (!body.verificationStatus || !Object.values(ArtisanVerificationStatus).includes(body.verificationStatus)) {
      return NextResponse.json(
        { error: "Le statut de vérification est invalide" },
        { status: 400 }
      )
    }

    // Vérifier que l'artisan existe
    const artisan = await prisma.user.findUnique({
      where: {
        id: artisanId,
        role: Role.ARTISAN,
      },
      include: {
        artisanProfile: true,
      },
    })

    if (!artisan || !artisan.artisanProfile) {
      return NextResponse.json(
        { error: "Artisan non trouvé" },
        { status: 404 }
      )
    }

    // Mettre à jour le statut de vérification
    const updatedProfile = await prisma.artisanProfile.update({
      where: {
        id: artisan.artisanProfile.id,
      },
      data: {
        verificationStatus: body.verificationStatus as ArtisanVerificationStatus,
      },
    })

    // Retourner la réponse avec le statut mis à jour
    return NextResponse.json({
      success: true,
      verificationStatus: updatedProfile.verificationStatus,
    })
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut de vérification:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du statut de vérification" },
      { status: 500 }
    )
  }
} 