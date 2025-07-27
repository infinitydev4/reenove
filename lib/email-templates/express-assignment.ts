import { TimeSlot } from "@/lib/generated/prisma"

interface ExpressAssignmentEmailData {
  artisanName: string
  serviceName: string
  bookingDate: Date
  timeSlot: TimeSlot
  clientName: string
  address: string
  price: number
  specialRequirements?: string
  notes?: string
  bookingId: string
}

// Fonction utilitaire pour formater le créneau horaire
function formatTimeSlot(timeSlot: TimeSlot): string {
  switch (timeSlot) {
    case TimeSlot.MORNING_8_12:
      return "8h00 - 12h00"
    case TimeSlot.AFTERNOON_14_18:
      return "14h00 - 18h00"
    case TimeSlot.EVENING_18_20:
      return "18h00 - 20h00"
    case TimeSlot.ALL_DAY:
      return "Toute la journée"
    default:
      return "Créneau non spécifié"
  }
}

export function getExpressAssignmentEmailTemplate(data: ExpressAssignmentEmailData) {
  const formattedDate = data.bookingDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const formattedTimeSlot = formatTimeSlot(data.timeSlot)
  const formattedPrice = data.price.toFixed(2)

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelle réservation express attribuée - Reenove</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #0E261C;
      color: white;
      line-height: 1.6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #0E261C;
      box-shadow: 0 20px 25px -5px rgba(14, 38, 28, 0.8);
      border-radius: 16px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #FCDA89 0%, #FCDA89 100%);
      color: #0E261C;
      padding: 40px 32px;
      text-align: center;
      position: relative;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="%23000" opacity="0.05"/><circle cx="75" cy="75" r="1" fill="%23000" opacity="0.05"/><circle cx="50" cy="10" r="1" fill="%23000" opacity="0.03"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.1;
    }
    .header-content {
      position: relative;
      z-index: 1;
    }
    .reenove-logo {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: -1px;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }
    .header p {
      margin: 8px 0 0 0;
      opacity: 0.8;
      font-size: 16px;
      font-weight: 500;
    }
    .content {
      padding: 40px 32px;
      background: #0E261C;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 24px;
      color: #FCDA89;
      font-weight: 600;
    }
    .intro-text {
      color: white;
      margin-bottom: 32px;
      font-size: 16px;
      line-height: 1.7;
    }
    .booking-card {
      background: rgba(252, 218, 137, 0.1);
      border-radius: 16px;
      padding: 28px;
      margin: 24px 0;
      border: 2px solid #FCDA89;
      box-shadow: 0 8px 16px rgba(252, 218, 137, 0.2);
      position: relative;
      overflow: hidden;
    }
    .booking-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background: #FCDA89;
    }
    .booking-title {
      font-size: 22px;
      font-weight: 700;
      color: #FCDA89;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .service-icon {
      width: 32px;
      height: 32px;
      background: #FCDA89;
      color: #0E261C;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid rgba(252, 218, 137, 0.2);
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      font-weight: 500;
      color: rgba(255, 255, 255, 0.7);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .detail-value {
      font-weight: 600;
      color: white;
      text-align: right;
      flex: 1;
      margin-left: 16px;
    }
    .price-highlight {
      background: #FCDA89;
      color: #0E261C;
      padding: 8px 16px;
      border-radius: 25px;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(252, 218, 137, 0.4);
    }
    .requirements {
      background: rgba(252, 218, 137, 0.15);
      border: 1px solid #FCDA89;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      position: relative;
    }
    .requirements::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #FCDA89;
      border-radius: 12px 12px 0 0;
    }
    .requirements h4 {
      margin: 0 0 12px 0;
      color: #FCDA89;
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .requirements p {
      margin: 0;
      color: white;
      font-weight: 500;
    }
    .cta-section {
      text-align: center;
      margin: 36px 0;
    }
    .cta-button {
      display: inline-block;
      background: #FCDA89;
      color: #0E261C;
      text-decoration: none;
      padding: 18px 36px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 16px;
      box-shadow: 0 8px 24px rgba(252, 218, 137, 0.4);
      transition: transform 0.2s, box-shadow 0.2s;
      border: 2px solid #FCDA89;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(252, 218, 137, 0.6);
      background: rgba(252, 218, 137, 0.9);
    }
    .tips {
      background: rgba(252, 218, 137, 0.1);
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
      border: 1px solid #FCDA89;
    }
    .tips h4 {
      margin: 0 0 16px 0;
      color: #FCDA89;
      font-size: 18px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tips ul {
      margin: 0;
      padding-left: 0;
      list-style: none;
    }
    .tips li {
      margin-bottom: 12px;
      color: white;
      padding-left: 24px;
      position: relative;
      font-weight: 500;
    }
    .tips li::before {
      content: '✓';
      position: absolute;
      left: 0;
      color: #FCDA89;
      font-weight: bold;
    }
    .signature {
      background: rgba(252, 218, 137, 0.05);
      border-radius: 12px;
      padding: 24px;
      margin: 32px 0;
      border-left: 4px solid #FCDA89;
    }
    .signature p {
      color: white;
      margin: 8px 0;
      line-height: 1.6;
    }
    .signature .team {
      color: #FCDA89;
      font-weight: 700;
      font-size: 18px;
      margin-top: 16px;
    }
    .footer {
      background: rgba(14, 38, 28, 0.8);
      padding: 32px;
      text-align: center;
      border-top: 1px solid #FCDA89;
    }
    .footer p {
      margin: 8px 0;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
    .reenove-brand {
      font-weight: 800;
      color: #FCDA89;
      font-size: 16px;
    }
    .contact-info {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(252, 218, 137, 0.3);
    }
    .contact-info a {
      color: #FCDA89;
      text-decoration: none;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      background: #FCDA89;
      color: #0E261C;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <div class="reenove-logo">REENOVE</div>
        <h1>
          <span class="service-icon">🚀</span>
          Nouvelle Réservation Express
        </h1>
        <p>Une nouvelle intervention vous a été attribuée</p>
        <span class="badge">Express Premium</span>
      </div>
    </div>

    <div class="content">
      <div class="greeting">
        Bonjour ${data.artisanName} 👋
      </div>

      <div class="intro-text">
        <strong>Excellente nouvelle !</strong> Nos experts Reenove vous ont sélectionné pour une nouvelle réservation express. 
        Cette intervention correspond parfaitement à vos compétences et votre zone d'activité.
      </div>

      <div class="booking-card">
        <div class="booking-title">
          <div class="service-icon">🔧</div>
          ${data.serviceName}
        </div>
        
        <div class="detail-row">
          <span class="detail-label">
            📅 <span>Date d'intervention</span>
          </span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">
            ⏰ <span>Créneau horaire</span>
          </span>
          <span class="detail-value">${formattedTimeSlot}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">
            👤 <span>Client</span>
          </span>
          <span class="detail-value">${data.clientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">
            📍 <span>Adresse</span>
          </span>
          <span class="detail-value">${data.address}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">
            💰 <span>Tarif fixe garanti</span>
          </span>
          <span class="detail-value">
            <span class="price-highlight">${formattedPrice}€</span>
          </span>
        </div>
      </div>

      ${data.specialRequirements ? `
      <div class="requirements">
        <h4>⚠️ Exigences particulières</h4>
        <p>${data.specialRequirements}</p>
      </div>
      ` : ''}

      ${data.notes ? `
      <div class="requirements">
        <h4>📝 Notes administratives</h4>
        <p>${data.notes}</p>
      </div>
      ` : ''}

      <div class="cta-section">
        <a href="https://reenove.com/artisan/rendez-vous" class="cta-button">
          📱 Accéder à mon planning Reenove
        </a>
      </div>

      <div class="tips">
        <h4>💡 Conseils de nos experts Reenove</h4>
        <ul>
          <li>Contactez le client 24h avant pour confirmer le rendez-vous</li>
          <li>Arrivez à l'heure avec tout votre matériel professionnel</li>
          <li>Prenez des photos avant/après pour enrichir votre portfolio</li>
          <li>Demandez un avis client à la fin de l'intervention</li>
          <li>Respectez les consignes de sécurité et de propreté</li>
        </ul>
      </div>

      <div class="signature">
        <p>
          Cette réservation express fait partie de notre <strong>service premium</strong> qui garantit des interventions rapides 
          et bien rémunérées. <strong>Nos experts Reenove vous conseillent</strong> de maintenir un excellent 
          niveau de service pour continuer à recevoir ces opportunités privilégiées.
        </p>
        
        <p>
          Pour toute question technique ou administrative, notre équipe support dédiée reste à votre disposition 
          via l'application ou par email.
        </p>

        <p class="team">
          Excellente intervention !<br>
          L'équipe Reenove 🔧
        </p>
      </div>
    </div>

    <div class="footer">
      <p>
        © 2024 <span class="reenove-brand">REENOVE</span> - La plateforme qui connecte propriétaires et artisans qualifiés
      </p>
      <p>
        Votre partenaire de confiance pour des interventions de qualité
      </p>
      
      <div class="contact-info">
        <p>
          Questions ? Contactez-nous : <a href="mailto:support@reenove.com">support@reenove.com</a>
        </p>
        <p>
          Suivez-nous pour plus d'opportunités et de conseils professionnels
        </p>
      </div>
    </div>
  </div>
</body>
</html>
  `

  const text = `
══════════════════════════════════════════════════════════
🚀 REENOVE - NOUVELLE RÉSERVATION EXPRESS ATTRIBUÉE
══════════════════════════════════════════════════════════

Bonjour ${data.artisanName} 👋

EXCELLENTE NOUVELLE ! Nos experts Reenove vous ont sélectionné 
pour une nouvelle réservation express. Cette intervention 
correspond parfaitement à vos compétences et votre zone d'activité.

╔════════════════════════════════════════════════════════════╗
║                 📋 DÉTAILS DE L'INTERVENTION                ║
╚════════════════════════════════════════════════════════════╝

🔧 Service : ${data.serviceName}
📅 Date : ${formattedDate}
⏰ Créneau : ${formattedTimeSlot}
👤 Client : ${data.clientName}
📍 Adresse : ${data.address}
💰 Tarif fixe garanti : ${formattedPrice}€

${data.specialRequirements ? `
⚠️ EXIGENCES PARTICULIÈRES :
${data.specialRequirements}
` : ''}

${data.notes ? `
📝 NOTES ADMINISTRATIVES :
${data.notes}
` : ''}

╔════════════════════════════════════════════════════════════╗
║            💡 CONSEILS DE NOS EXPERTS REENOVE              ║
╚════════════════════════════════════════════════════════════╝

✓ Contactez le client 24h avant pour confirmer le rendez-vous
✓ Arrivez à l'heure avec tout votre matériel professionnel
✓ Prenez des photos avant/après pour enrichir votre portfolio
✓ Demandez un avis client à la fin de l'intervention
✓ Respectez les consignes de sécurité et de propreté

📱 ACCÉDEZ À VOTRE PLANNING REENOVE :
https://reenove.com/artisan/rendez-vous

Cette réservation express fait partie de notre SERVICE PREMIUM 
qui garantit des interventions rapides et bien rémunérées. 
Nos experts Reenove vous conseillent de maintenir un excellent 
niveau de service pour continuer à recevoir ces opportunités 
privilégiées.

Pour toute question technique ou administrative, notre équipe 
support dédiée reste à votre disposition via l'application 
ou par email.

Excellente intervention ! 🔧
L'équipe Reenove

══════════════════════════════════════════════════════════
© 2024 REENOVE - Votre partenaire de confiance
Questions ? support@reenove.com
══════════════════════════════════════════════════════════
  `

  return { html, text }
} 