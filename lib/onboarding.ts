import { prisma } from '@/lib/prisma'

/**
 * Met à jour la progression d'onboarding d'un artisan
 * @param userId L'identifiant de l'utilisateur artisan
 * @param step L'étape complétée (profile, specialties, documents, confirmation)
 */
export async function updateOnboardingProgress(userId: string, step: string) {
  try {
    const artisanProfile = await prisma.artisanProfile.findUnique({
      where: { userId },
    })

    if (!artisanProfile) {
      // Créer le profil s'il n'existe pas
      await prisma.artisanProfile.create({
        data: {
          userId,
          onboardingCompleted: false
        }
      })
    }

    // Vérifier si l'étape est valide
    if (!['profile', 'location', 'specialties', 'documents', 'payment', 'confirmation'].includes(step)) {
      throw new Error('Étape d\'onboarding invalide')
    }

    // Mettre à jour les champs correspondants en fonction de l'étape
    switch (step) {
      case 'profile':
        await prisma.artisanProfile.update({
          where: { userId },
          data: { 
            // S'assurer que les champs existent dans le modèle
            // Ces champs sont soit déjà définis, soit à définir dans le schéma
            onboardingCompleted: true 
          }
        })
        break
      case 'location':
        await prisma.artisanProfile.update({
          where: { userId },
          data: { 
            onboardingCompleted: true 
          }
        })
        break
      case 'specialties':
        await prisma.artisanProfile.update({
          where: { userId },
          data: { 
            onboardingCompleted: true 
          }
        })
        break
      case 'documents':
        await prisma.artisanProfile.update({
          where: { userId },
          data: { 
            onboardingCompleted: true 
          }
        })
        break
      case 'payment':
        await prisma.artisanProfile.update({
          where: { userId },
          data: { 
            onboardingCompleted: true 
          }
        })
        break
      case 'confirmation':
        await prisma.artisanProfile.update({
          where: { userId },
          data: { 
            onboardingCompleted: true 
          }
        })
        break
    }

    return true
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la progression:', error)
    throw error
  }
}

/**
 * Récupère la progression d'onboarding d'un artisan
 * @param userId L'identifiant de l'utilisateur artisan
 * @returns Un objet contenant les étapes complétées
 */
export async function getOnboardingProgress(userId: string) {
  try {
    // Récupérer le profil artisan
    const artisanProfile = await prisma.artisanProfile.findUnique({
      where: { userId },
      include: {
        user: true // Inclure les informations de l'utilisateur
      }
    })

    if (!artisanProfile) {
      // Créer le profil s'il n'existe pas
      await prisma.artisanProfile.create({
        data: {
          userId,
          onboardingCompleted: false
        }
      })
      
      // Retourner la progression initiale
      return {
        completedSteps: [],
        progress: {
          profile: false,
          location: false,
          specialties: false,
          documents: false,
          confirmation: false
        },
        onboardingCompletedAt: null
      }
    }

    // Récupérer les spécialités
    const specialties = await prisma.artisanSpecialty.findMany({
      where: { userId },
    })

    // Récupérer les documents
    const documents = await prisma.artisanDocument.findMany({
      where: { userId },
    })

    // Récupérer l'abonnement
    const subscription = await prisma.artisanSubscription.findUnique({
      where: { userId },
    })

    // Déterminer les étapes complétées
    const completedSteps = []
    
    // Profil complété si le profil existe
    if (artisanProfile) {
      completedSteps.push('profile')
    }
    
    // Location complétée si l'adresse et le code postal sont définis dans le User
    if (artisanProfile && artisanProfile.user && artisanProfile.user.address && artisanProfile.user.postalCode) {
      completedSteps.push('location')
    }
    
    // Spécialités complétées si au moins une spécialité existe
    if (specialties.length > 0) {
      completedSteps.push('specialties')
    }
    
    // Documents complétés si au moins KBIS et assurance existent
    if (documents.length >= 2 && 
        documents.some((doc: { type: string }) => doc.type === 'KBIS') && 
        documents.some((doc: { type: string }) => doc.type === 'INSURANCE')) {
      completedSteps.push('documents')
    }
    
    // Payment complété seulement si un abonnement ACTIVE existe (payé)
    if (subscription && subscription.status === 'ACTIVE') {
      completedSteps.push('payment')
    }
    
    // Confirmation complétée si onboardingCompleted est true
    if (artisanProfile.onboardingCompleted) {
      completedSteps.push('confirmation')
    }

          // Retourner la progression
      return {
        completedSteps,
        progress: {
          profile: !!artisanProfile,
          location: !!artisanProfile && !!artisanProfile.user && !!artisanProfile.user.address && !!artisanProfile.user.postalCode,
          specialties: specialties.length > 0,
          documents: documents.length >= 2 && 
                    documents.some((doc: { type: string }) => doc.type === 'KBIS') && 
                    documents.some((doc: { type: string }) => doc.type === 'INSURANCE'),
          payment: !!subscription && subscription.status === 'ACTIVE',
          confirmation: artisanProfile.onboardingCompleted
      },
      onboardingCompletedAt: artisanProfile.onboardingCompleted ? new Date() : null
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la progression:', error)
    throw error
  }
} 