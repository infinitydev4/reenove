export const artisanAssignmentEmailTemplate = {
  subject: (projectTitle: string) => `Nouveau projet attribué : ${projectTitle}`,
  
  html: (data: {
    artisanName: string;
    projectTitle: string;
    projectDescription: string;
    clientName: string;
    projectLocation: string;
    projectBudget?: string;
    category: string;
    loginUrl: string;
  }) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouveau projet attribué</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: white;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #0E261C;
        }
        .container {
            background: #0E261C;
            border-radius: 16px;
            padding: 40px;
            box-shadow: 0 8px 24px rgba(14, 38, 28, 0.8);
            border: 1px solid rgba(252, 218, 137, 0.2);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .logo {
            font-size: 32px;
            font-weight: 800;
            color: #0E261C;
            background: #FCDA89;
            padding: 15px 30px;
            border-radius: 12px;
            display: inline-block;
            letter-spacing: -1px;
            box-shadow: 0 4px 12px rgba(252, 218, 137, 0.3);
        }
        .title {
            color: #FCDA89;
            font-size: 28px;
            font-weight: bold;
            margin: 25px 0;
        }
        .alert-box {
            background: rgba(252, 218, 137, 0.15);
            border-left: 4px solid #FCDA89;
            padding: 20px;
            margin: 25px 0;
            border-radius: 12px;
            border: 1px solid rgba(252, 218, 137, 0.3);
        }
        .project-details {
            background: rgba(252, 218, 137, 0.1);
            padding: 28px;
            border-radius: 16px;
            margin: 25px 0;
            border: 2px solid #FCDA89;
            box-shadow: 0 6px 16px rgba(252, 218, 137, 0.2);
        }
        .detail-row {
            display: flex;
            margin-bottom: 12px;
            padding: 12px 0;
            border-bottom: 1px solid rgba(252, 218, 137, 0.2);
        }
        .detail-label {
            font-weight: bold;
            width: 140px;
            color: rgba(255, 255, 255, 0.7);
        }
        .detail-value {
            color: white;
            flex: 1;
            font-weight: 600;
        }
        .cta-button {
            display: inline-block;
            background: #FCDA89;
            color: #0E261C;
            padding: 18px 36px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: bold;
            margin: 25px 0;
            text-align: center;
            font-size: 16px;
            box-shadow: 0 6px 20px rgba(252, 218, 137, 0.4);
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            margin-top: 40px;
            padding-top: 25px;
            border-top: 1px solid #FCDA89;
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            text-align: center;
        }
        .next-steps {
            background: rgba(252, 218, 137, 0.1);
            border-left: 4px solid #FCDA89;
            padding: 24px;
            margin: 25px 0;
            border-radius: 12px;
            border: 1px solid rgba(252, 218, 137, 0.3);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Reenove</div>
            <h1 class="title">🎉 Félicitations ! Nouveau projet attribué</h1>
        </div>

        <div class="alert-box">
            <p><strong>Bonjour ${data.artisanName},</strong></p>
            <p>Excellente nouvelle ! Nos experts Reenove ont sélectionné votre profil pour un nouveau projet dans votre secteur d'activité.</p>
        </div>

        <div class="project-details">
            <h3 style="color: #FCDA89; margin-top: 0; font-size: 20px;">📋 Détails du projet</h3>
            
            <div class="detail-row">
                <div class="detail-label">Titre :</div>
                <div class="detail-value"><strong>${data.projectTitle}</strong></div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Catégorie :</div>
                <div class="detail-value">${data.category}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Client :</div>
                <div class="detail-value">${data.clientName}</div>
            </div>
            
            <div class="detail-row">
                <div class="detail-label">Localisation :</div>
                <div class="detail-value">${data.projectLocation}</div>
            </div>
            
            ${data.projectBudget ? `
            <div class="detail-row">
                <div class="detail-label">Budget indicatif :</div>
                <div class="detail-value">${data.projectBudget}</div>
            </div>
            ` : ''}
            
            <div class="detail-row">
                <div class="detail-label">Description :</div>
                <div class="detail-value">${data.projectDescription}</div>
            </div>
        </div>

        <div class="next-steps">
            <h3 style="color: #FCDA89; margin-top: 0; font-size: 20px;">🚀 Prochaines étapes</h3>
            <ol>
                <li><strong>Consultez votre tableau de bord</strong> pour voir tous les détails du projet</li>
                <li><strong>Contactez le client</strong> pour planifier une visite ou un rendez-vous</li>
                <li><strong>Préparez votre devis</strong> en fonction des spécifications du projet</li>
                <li><strong>Commencez les travaux</strong> une fois l'accord client obtenu</li>
            </ol>
        </div>

        <div style="text-align: center;">
            <a href="${data.loginUrl}" class="cta-button">
                🎯 Voir le projet sur mon tableau de bord
            </a>
        </div>

        <div style="background: rgba(252, 218, 137, 0.15); padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid rgba(252, 218, 137, 0.3);">
            <p style="margin: 0; text-align: center; color: white;">
                <strong style="color: #FCDA89;">💡 Conseil Reenove :</strong> Contactez rapidement le client pour montrer votre professionnalisme et votre réactivité !
            </p>
        </div>

        <div class="footer">
            <p><strong style="color: #FCDA89;">Reenove vous accompagne !</strong></p>
            <p>Notre équipe reste à votre disposition pour toute question ou assistance.</p>
            <p style="color: #FCDA89;">📧 Email : support@reenove.fr | 📞 Téléphone : 01 XX XX XX XX</p>
            <hr style="margin: 25px 0; border: none; border-top: 1px solid rgba(252, 218, 137, 0.3);">
            <p style="font-size: 12px; color: rgba(255, 255, 255, 0.5);">
                Vous recevez cet email car vous êtes inscrit comme artisan sur la plateforme Reenove.<br>
                Si vous ne souhaitez plus recevoir ces notifications, contactez notre support.
            </p>
        </div>
    </div>
</body>
</html>
  `,

  text: (data: {
    artisanName: string;
    projectTitle: string;
    projectDescription: string;
    clientName: string;
    projectLocation: string;
    projectBudget?: string;
    category: string;
    loginUrl: string;
  }) => `
Bonjour ${data.artisanName},

Félicitations ! Nos experts Reenove ont sélectionné votre profil pour un nouveau projet.

DÉTAILS DU PROJET :
- Titre : ${data.projectTitle}
- Catégorie : ${data.category}
- Client : ${data.clientName}
- Localisation : ${data.projectLocation}
${data.projectBudget ? `- Budget indicatif : ${data.projectBudget}` : ''}
- Description : ${data.projectDescription}

PROCHAINES ÉTAPES :
1. Consultez votre tableau de bord pour voir tous les détails
2. Contactez le client pour planifier une visite
3. Préparez votre devis
4. Commencez les travaux une fois l'accord obtenu

Accédez à votre tableau de bord : ${data.loginUrl}

L'équipe Reenove reste à votre disposition pour toute assistance.

Email : support@reenove.fr
Téléphone : 01 XX XX XX XX

---
Reenove - Votre partenaire de confiance pour tous vos projets
  `
} 