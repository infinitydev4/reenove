import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Role, ArtisanLevel } from "@/lib/generated/prisma"
import bcrypt from "bcrypt"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const specialty = searchParams.get('specialty')
    const availability = searchParams.get('availability')

    // Construire les conditions de recherche
    const whereConditions: any = {
      role: Role.ARTISAN
    }

    // Filtre de recherche par nom ou email
    if (search) {
      whereConditions.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    const artisans = await prisma.user.findMany({
      where: whereConditions,
      include: {
        artisanProfile: true,
        artisanSpecialties: {
          include: {
            service: {
              include: {
                category: true
              }
            }
          }
        },
        quotes: {
          select: {
            id: true,
            status: true,
            amount: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Artisans trouvés dans la DB: ${artisans.length}`)
    console.log('Filtres appliqués:', { search, specialty, availability })

    let formattedArtisans = artisans.map(artisan => {
      const projectsCompleted = artisan.quotes.filter(q => q.status === "completed").length;
      const currentProjects = artisan.quotes.filter(q => q.status === "accepted").length;
      const totalEarnings = artisan.quotes.filter(q => q.status === "completed")
        .reduce((sum, quote) => sum + Number(quote.amount), 0);

      // Déterminer la disponibilité
      let artisanAvailability = "disponible";
      if (currentProjects >= 3) {
        artisanAvailability = "occupé";
      } else if (artisan.role !== Role.ARTISAN || !artisan.artisanProfile?.availableForWork) {
        artisanAvailability = "indisponible";
      }

      // Récupérer la spécialité principale de l'artisan
      const primarySpecialty = artisan.artisanSpecialties[0]?.service?.name || "Non spécifié";
      
      return {
        id: artisan.id,
        name: artisan.name || "Artisan",
        email: artisan.email || "",
        phone: artisan.phone || "Non renseigné",
        address: artisan.address || "Non renseignée",
        city: artisan.city || "Non renseignée",
        status: artisan.role === Role.ARTISAN ? "actif" : "inactif",
        speciality: primarySpecialty,
        rating: (Math.random() * (5 - 4) + 4).toFixed(1),
        projectsCompleted,
        currentProjects,
        totalEarnings: `${totalEarnings}€`,
        availability: artisanAvailability,
        startDate: new Date(artisan.createdAt).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        avatar: artisan.image || "/placeholder.svg",
        verified: artisan.artisanProfile?.verificationStatus === "VERIFIED",
        verificationStatus: artisan.artisanProfile?.verificationStatus || "PENDING"
      };
    });

    // Appliquer les filtres côté serveur
    if (specialty) {
      formattedArtisans = formattedArtisans.filter(artisan => 
        artisan.speciality.toLowerCase().includes(specialty.toLowerCase())
      )
    }

    if (availability === 'available') {
      formattedArtisans = formattedArtisans.filter(artisan => 
        artisan.availability === 'disponible'
      )
    }

    console.log(`Artisans trouvés: ${formattedArtisans.length}`)
    return NextResponse.json(formattedArtisans);
  } catch (error) {
    console.error("Erreur lors de la récupération des artisans :", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des artisans" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      postalCode,
      companyName,
      siret,
      yearsOfExperience,
      level,
      specialties,
      preferredRadius
    } = body

    // Validation des champs obligatoires
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Les champs nom, email et mot de passe sont obligatoires" },
        { status: 400 }
      )
    }

    if (!specialties || specialties.length === 0) {
      return NextResponse.json(
        { error: "Au moins une spécialité doit être sélectionnée" },
        { status: 400 }
      )
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Un utilisateur avec cet email existe déjà" },
        { status: 409 }
      )
    }

    // Vérifier que tous les services existent
    const services = await prisma.service.findMany({
      where: {
        id: { in: specialties }
      }
    })

    if (services.length !== specialties.length) {
      return NextResponse.json(
        { error: "Certaines spécialités sélectionnées n'existent pas" },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'artisan dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Créer l'utilisateur avec le rôle ARTISAN
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: Role.ARTISAN,
          phone: phone || null,
          address: address || null,
          city: city || null,
          postalCode: postalCode || null,
        }
      })

      // 2. Créer le profil artisan
      const artisanProfile = await tx.artisanProfile.create({
        data: {
          userId: newUser.id,
          companyName: companyName || null,
          siret: siret || null,
          yearsOfExperience: yearsOfExperience || null,
          preferredRadius: preferredRadius || 50,
          level: level as ArtisanLevel || "BEGINNER",
          verificationStatus: "PENDING",
          onboardingCompleted: true, // Créé par admin donc considéré comme complété
          availableForWork: true,
          assessmentCompleted: false,
        }
      })

      // 3. Créer les spécialités
      const artisanSpecialties = await Promise.all(
        specialties.map((serviceId: string, index: number) =>
          tx.artisanSpecialty.create({
            data: {
              userId: newUser.id,
              serviceId,
              isPrimary: index === 0, // La première spécialité est la principale
            }
          })
        )
      )

      return {
        user: newUser,
        profile: artisanProfile,
        specialties: artisanSpecialties
      }
    })

    // Récupérer l'artisan créé avec toutes ses relations pour le retourner formaté
    const createdArtisan = await prisma.user.findUnique({
      where: { id: result.user.id },
      include: {
        artisanProfile: true,
        artisanSpecialties: {
          include: {
            service: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    if (!createdArtisan) {
      throw new Error("Erreur lors de la récupération de l'artisan créé")
    }

    // Formater la réponse selon le format attendu par le frontend
    const formattedArtisan = {
      id: createdArtisan.id,
      name: createdArtisan.name || "Artisan",
      email: createdArtisan.email || "",
      phone: createdArtisan.phone || "Non renseigné",
      address: createdArtisan.address || "Non renseignée",
      status: "actif",
      speciality: createdArtisan.artisanSpecialties[0]?.service?.name || "Non spécifié",
      rating: "4.0", // Nouvelle inscription, note par défaut
      projectsCompleted: 0,
      currentProjects: 0,
      totalEarnings: "0€",
      availability: "disponible",
      startDate: new Date(createdArtisan.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      avatar: createdArtisan.image || "/placeholder.svg",
      verified: false,
      verificationStatus: createdArtisan.artisanProfile?.verificationStatus || "PENDING"
    }

    return NextResponse.json(formattedArtisan, { status: 201 })

  } catch (error) {
    console.error("Erreur lors de la création de l'artisan:", error)
    return NextResponse.json(
      { error: "Erreur lors de la création de l'artisan" },
      { status: 500 }
    )
  }
} 