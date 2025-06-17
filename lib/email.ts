import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface User {
  name: string
  email: string
  firstName?: string
  lastName?: string
}

export interface ProjectEstimation {
  title: string
  description: string
  service: string
  category: string
  location: string
  city: string
  postalCode: string
  estimatedPrice?: {
    min: number
    max: number
  }
  budget?: number
}

// Template d'email de bienvenue ultra moderne
const welcomeEmailTemplate = (user: User) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue chez reenove</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0E261C 0%, #1a3a2e 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #0E261C;">
        <!-- Header avec logo -->
        <div style="background: linear-gradient(135deg, #0E261C 0%, #1a3a2e 100%); padding: 40px 20px; text-align: center; border-bottom: 2px solid #FCDA89;">
            <img src="https://reenove.com/logow.png" alt="reenove" style="height: 60px; margin-bottom: 20px;">
            <h1 style="color: #FCDA89; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                🎉 Bienvenue chez reenove !
            </h1>
        </div>

        <!-- Contenu principal -->
        <div style="padding: 40px 30px; background: #0E261C;">
            <div style="background: rgba(252, 218, 137, 0.1); border: 1px solid rgba(252, 218, 137, 0.2); border-radius: 16px; padding: 30px; margin-bottom: 30px;">
                <h2 style="color: #FCDA89; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">
                    Bonjour ${user.firstName || user.name} ! 👋
                </h2>
                <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; margin: 0; font-size: 16px;">
                    Nous sommes ravis de vous accueillir dans la communauté reenove ! Votre compte a été créé avec succès et vous pouvez maintenant profiter de tous nos services.
                </p>
            </div>

            <!-- Avantages -->
            <div style="margin-bottom: 30px;">
                <h3 style="color: #FCDA89; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                    🌟 Ce qui vous attend
                </h3>
                
                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 20px;">
                    <div style="background: rgba(252, 218, 137, 0.1); border: 1px solid rgba(252, 218, 137, 0.2); border-radius: 12px; padding: 20px; flex: 1; min-width: 250px;">
                        <div style="color: #FCDA89; font-size: 24px; margin-bottom: 10px;">🔧</div>
                        <h4 style="color: #FCDA89; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Artisans Vérifiés</h4>
                        <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px; line-height: 1.5;">
                            Tous nos artisans sont rigoureusement sélectionnés et vérifiés
                        </p>
                    </div>
                    
                    <div style="background: rgba(252, 218, 137, 0.1); border: 1px solid rgba(252, 218, 137, 0.2); border-radius: 12px; padding: 20px; flex: 1; min-width: 250px;">
                        <div style="color: #FCDA89; font-size: 24px; margin-bottom: 10px;">⚡</div>
                        <h4 style="color: #FCDA89; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Intervention Rapide</h4>
                        <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px; line-height: 1.5;">
                            Intervention garantie sous 24-48h pour vos projets
                        </p>
                    </div>
                </div>

                <div style="display: flex; flex-wrap: wrap; gap: 15px;">
                    <div style="background: rgba(252, 218, 137, 0.1); border: 1px solid rgba(252, 218, 137, 0.2); border-radius: 12px; padding: 20px; flex: 1; min-width: 250px;">
                        <div style="color: #FCDA89; font-size: 24px; margin-bottom: 10px;">🛡️</div>
                        <h4 style="color: #FCDA89; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Garantie Qualité</h4>
                        <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px; line-height: 1.5;">
                            Tous les travaux sont garantis et assurés
                        </p>
                    </div>
                    
                    <div style="background: rgba(252, 218, 137, 0.1); border: 1px solid rgba(252, 218, 137, 0.2); border-radius: 12px; padding: 20px; flex: 1; min-width: 250px;">
                        <div style="color: #FCDA89; font-size: 24px; margin-bottom: 10px;">💰</div>
                        <h4 style="color: #FCDA89; margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">Prix Négociés</h4>
                        <p style="color: rgba(255, 255, 255, 0.8); margin: 0; font-size: 14px; line-height: 1.5;">
                            Obtenez les meilleurs prix grâce à notre réseau
                        </p>
                    </div>
                </div>
            </div>

            <!-- Call to action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://reenove.com/create-project-ai" style="background: linear-gradient(135deg, #FCDA89 0%, #f5d080 100%); color: #0E261C; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(252, 218, 137, 0.3); transition: all 0.3s ease;">
                    🚀 Créer mon premier projet
                </a>
            </div>

            <!-- Support -->
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: center; margin-top: 30px;">
                <h4 style="color: #FCDA89; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                    💬 Besoin d'aide ?
                </h4>
                <p style="color: rgba(255, 255, 255, 0.8); margin: 0 0 15px 0; font-size: 14px; line-height: 1.5;">
                    Notre équipe est là pour vous accompagner dans tous vos projets
                </p>
                <a href="mailto:contact@reenove.com" style="color: #FCDA89; text-decoration: none; font-weight: 500;">
                    📧 contact@reenove.com
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #0a1f15; padding: 30px 20px; text-align: center; border-top: 1px solid rgba(252, 218, 137, 0.2);">
            <p style="color: rgba(255, 255, 255, 0.6); margin: 0 0 10px 0; font-size: 14px;">
                Merci de faire confiance à reenove pour vos projets de rénovation
            </p>
            <p style="color: rgba(255, 255, 255, 0.4); margin: 0; font-size: 12px;">
                © 2024 reenove. Tous droits réservés.
            </p>
        </div>
    </div>
</body>
</html>
`

// Template d'email pour demande de devis
const quoteRequestEmailTemplate = (user: User, project: ProjectEstimation) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre demande de devis - Reenove</title>
</head>
<body style="margin: 0; padding: 0; background: linear-gradient(135deg, #0E261C 0%, #1a3a2e 100%); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #0E261C;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0E261C 0%, #1a3a2e 100%); padding: 40px 20px; text-align: center; border-bottom: 2px solid #FCDA89;">
            <img src="https://reenove.com/logow.png" alt="reenove" style="height: 60px; margin-bottom: 20px;">
            <h1 style="color: #FCDA89; margin: 0; font-size: 28px; font-weight: 700;">
                ✅ Demande de devis confirmée
            </h1>
        </div>

        <!-- Contenu principal -->
        <div style="padding: 40px 30px; background: #0E261C;">
            <!-- Message de confirmation -->
            <div style="background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 16px; padding: 30px; margin-bottom: 30px; text-align: center;">
                <div style="color: #22c55e; font-size: 48px; margin-bottom: 15px;">🎯</div>
                <h2 style="color: #22c55e; margin: 0 0 15px 0; font-size: 22px; font-weight: 600;">
                    Parfait ${user.firstName || user.name} !
                </h2>
                <p style="color: rgba(255, 255, 255, 0.9); line-height: 1.6; margin: 0; font-size: 16px;">
                    Votre demande de devis a été transmise à nos artisans partenaires. Vous recevrez des devis détaillés dans les <strong style="color: #FCDA89;">24-48 heures</strong>.
                </p>
            </div>

            <!-- Résumé du projet -->
            <div style="background: rgba(252, 218, 137, 0.1); border: 1px solid rgba(252, 218, 137, 0.2); border-radius: 16px; padding: 30px; margin-bottom: 30px;">
                <h3 style="color: #FCDA89; margin: 0 0 20px 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
                    📋 Résumé de votre projet
                </h3>
                
                <div style="space-y: 15px;">
                    <div style="margin-bottom: 15px;">
                        <div style="color: rgba(252, 218, 137, 0.8); font-size: 14px; font-weight: 500; margin-bottom: 5px;">TITRE DU PROJET</div>
                        <div style="color: white; font-size: 16px; font-weight: 600;">${project.title}</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="color: rgba(252, 218, 137, 0.8); font-size: 14px; font-weight: 500; margin-bottom: 5px;">SERVICE</div>
                        <div style="color: white; font-size: 16px;">${project.service} • ${project.category}</div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="color: rgba(252, 218, 137, 0.8); font-size: 14px; font-weight: 500; margin-bottom: 5px;">LOCALISATION</div>
                        <div style="color: white; font-size: 16px;">${project.location}, ${project.postalCode} ${project.city}</div>
                    </div>
                    
                    ${project.estimatedPrice ? `
                    <div style="margin-bottom: 15px;">
                        <div style="color: rgba(252, 218, 137, 0.8); font-size: 14px; font-weight: 500; margin-bottom: 5px;">ESTIMATION IA</div>
                        <div style="background: rgba(252, 218, 137, 0.2); padding: 12px 16px; border-radius: 8px; display: inline-block;">
                            <span style="color: #FCDA89; font-size: 18px; font-weight: 700;">${new Intl.NumberFormat('fr-FR').format(project.estimatedPrice.min)}€ - ${new Intl.NumberFormat('fr-FR').format(project.estimatedPrice.max)}€</span>
                        </div>
                    </div>
                    ` : ''}
                    
                    <div style="margin-bottom: 0;">
                        <div style="color: rgba(252, 218, 137, 0.8); font-size: 14px; font-weight: 500; margin-bottom: 5px;">DESCRIPTION</div>
                        <div style="color: rgba(255, 255, 255, 0.9); font-size: 15px; line-height: 1.6;">${project.description}</div>
                    </div>
                </div>
            </div>

            <!-- Prochaines étapes -->
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 30px; margin-bottom: 30px;">
                <h3 style="color: #FCDA89; margin: 0 0 20px 0; font-size: 20px; font-weight: 600;">
                    🗓️ Prochaines étapes
                </h3>
                
                <div style="space-y: 15px;">
                    <div style="display: flex; align-items: start; margin-bottom: 20px;">
                        <div style="background: #FCDA89; color: #0E261C; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; margin-right: 15px; flex-shrink: 0; margin-top: 2px;">1</div>
                        <div>
                            <div style="color: white; font-weight: 600; margin-bottom: 5px;">Analyse de votre demande</div>
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Nos algorithmes sélectionnent les meilleurs artisans pour votre projet</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; margin-bottom: 20px;">
                        <div style="background: #FCDA89; color: #0E261C; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; margin-right: 15px; flex-shrink: 0; margin-top: 2px;">2</div>
                        <div>
                            <div style="color: white; font-weight: 600; margin-bottom: 5px;">Réception des devis (24-48h)</div>
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Vous recevrez 3 à 5 devis détaillés d'artisans qualifiés</div>
                        </div>
                    </div>
                    
                    <div style="display: flex; align-items: start; margin-bottom: 0;">
                        <div style="background: #FCDA89; color: #0E261C; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; margin-right: 15px; flex-shrink: 0; margin-top: 2px;">3</div>
                        <div>
                            <div style="color: white; font-weight: 600; margin-bottom: 5px;">Choix de votre artisan</div>
                            <div style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Comparez les offres et choisissez l'artisan qui vous convient</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Call to action -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://reenove.com/client" style="background: linear-gradient(135deg, #FCDA89 0%, #f5d080 100%); color: #0E261C; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(252, 218, 137, 0.3);">
                    📊 Suivre mon projet
                </a>
            </div>

            <!-- Support -->
            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; text-align: center;">
                <h4 style="color: #FCDA89; margin: 0 0 10px 0; font-size: 16px; font-weight: 600;">
                    💬 Une question ?
                </h4>
                <p style="color: rgba(255, 255, 255, 0.8); margin: 0 0 15px 0; font-size: 14px;">
                    Notre équipe est disponible pour vous accompagner
                </p>
                <a href="mailto:contact@reenove.com" style="color: #FCDA89; text-decoration: none; font-weight: 500;">
                    📧 contact@reenove.com
                </a>
            </div>
        </div>

        <!-- Footer -->
        <div style="background: #0a1f15; padding: 30px 20px; text-align: center; border-top: 1px solid rgba(252, 218, 137, 0.2);">
            <p style="color: rgba(255, 255, 255, 0.6); margin: 0 0 10px 0; font-size: 14px;">
                Merci de faire confiance à reenove pour vos projets de rénovation
            </p>
            <p style="color: rgba(255, 255, 255, 0.4); margin: 0; font-size: 12px;">
                © 2024 Reenove. Tous droits réservés.
            </p>
        </div>
    </div>
</body>
</html>
`

// Fonction pour envoyer l'email de bienvenue
export async function sendWelcomeEmail(user: User) {
  try {
    const data = await resend.emails.send({
      from: 'Reenove <contact@reenove.com>',
      to: [user.email],
      subject: '🎉 Bienvenue chez Reenove ! Votre compte est prêt',
      html: welcomeEmailTemplate(user),
    })

    console.log('Email de bienvenue envoyé:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error)
    return { success: false, error }
  }
}

// Fonction pour envoyer l'email de demande de devis
export async function sendQuoteRequestEmail(user: User, project: ProjectEstimation) {
  try {
    const data = await resend.emails.send({
      from: 'Reenove <contact@reenove.com>',
      to: [user.email],
      subject: `✅ Demande de devis confirmée - ${project.title}`,
      html: quoteRequestEmailTemplate(user, project),
    })

    console.log('Email de demande de devis envoyé:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email de demande de devis:', error)
    return { success: false, error }
  }
}