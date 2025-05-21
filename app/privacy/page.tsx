import Navbar from "@/components/navbar"
import { Footer } from "@/components/Footer"
import BottomNavbar from "@/components/bottom-navbar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Politique de Confidentialité | Reenove",
  description: "Notre politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles conformément au RGPD.",
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0E261C]">
      <Navbar />
      
      <main className="flex-1 py-16">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="bg-[#0E261C] rounded-2xl shadow-md border border-[#FCDA89]/20 p-6 md:p-10">
            <header className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Politique de Confidentialité</h1>
              <p className="text-[#FCDA89]/80">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>
            
            <div className="prose prose-lg max-w-none prose-invert">
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Introduction</h2>
                <p className="text-white/90">
                  Chez Reenove, nous prenons la protection de vos données personnelles très au sérieux. 
                  Notre politique de confidentialité décrit comment nous collectons, utilisons, partageons et protégeons 
                  vos informations lorsque vous utilisez notre plateforme, conformément au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Données que nous collectons</h2>
                <p className="text-white/90">
                  Nous collectons les données suivantes :
                </p>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li><strong className="text-[#FCDA89]">Informations d'inscription :</strong> nom, prénom, adresse e-mail, numéro de téléphone.</li>
                  <li><strong className="text-[#FCDA89]">Informations de profil :</strong> photo de profil, adresse, profession (pour les artisans).</li>
                  <li><strong className="text-[#FCDA89]">Informations sur les projets :</strong> descriptions, photos, localisations et budgets des projets.</li>
                  <li><strong className="text-[#FCDA89]">Données d'utilisation :</strong> informations sur la façon dont vous interagissez avec notre plateforme.</li>
                  <li><strong className="text-[#FCDA89]">Communications :</strong> messages échangés avec d'autres utilisateurs ou notre support client.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Fondements juridiques du traitement</h2>
                <p className="text-white/90">
                  Nous traitons vos données personnelles sur les bases légales suivantes :
                </p>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li><strong className="text-[#FCDA89]">Exécution d'un contrat :</strong> pour vous fournir nos services.</li>
                  <li><strong className="text-[#FCDA89]">Consentement :</strong> lorsque vous acceptez explicitement le traitement de vos données.</li>
                  <li><strong className="text-[#FCDA89]">Intérêts légitimes :</strong> pour améliorer nos services et assurer la sécurité de la plateforme.</li>
                  <li><strong className="text-[#FCDA89]">Obligations légales :</strong> pour nous conformer aux lois applicables.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Utilisation de vos données</h2>
                <p className="text-white/90">
                  Nous utilisons vos données pour :
                </p>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li>Vous permettre de créer et gérer votre compte.</li>
                  <li>Mettre en relation clients et artisans.</li>
                  <li>Personnaliser votre expérience utilisateur.</li>
                  <li>Vous envoyer des notifications et communications importantes.</li>
                  <li>Améliorer et développer nos services.</li>
                  <li>Assurer la sécurité de notre plateforme.</li>
                  <li>Vous envoyer des communications marketing (avec votre consentement).</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Partage de vos données</h2>
                <p className="text-white/90">
                  Nous pouvons partager vos données avec :
                </p>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li><strong className="text-[#FCDA89]">Autres utilisateurs :</strong> dans le cadre de la mise en relation entre clients et artisans.</li>
                  <li><strong className="text-[#FCDA89]">Prestataires de services :</strong> qui nous aident à fournir nos services (hébergement, paiement, communication).</li>
                  <li><strong className="text-[#FCDA89]">Partenaires commerciaux :</strong> uniquement avec votre consentement explicite.</li>
                  <li><strong className="text-[#FCDA89]">Autorités :</strong> lorsque la loi l'exige ou pour protéger nos droits légaux.</li>
                </ul>
                <p className="text-white/90">
                  Nous ne vendons pas vos données personnelles à des tiers.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Conservation des données</h2>
                <p className="text-white/90">
                  Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services et
                  respecter nos obligations légales. Si vous supprimez votre compte, nous supprimerons ou anonymiserons
                  vos données personnelles dans un délai de 30 jours, sauf si la loi nous oblige à les conserver plus longtemps.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Vos droits</h2>
                <p className="text-white/90">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li><strong className="text-[#FCDA89]">Droit d'accès :</strong> vous pouvez demander une copie de vos données personnelles.</li>
                  <li><strong className="text-[#FCDA89]">Droit de rectification :</strong> vous pouvez corriger des données inexactes.</li>
                  <li><strong className="text-[#FCDA89]">Droit à l'effacement :</strong> vous pouvez demander la suppression de vos données.</li>
                  <li><strong className="text-[#FCDA89]">Droit à la limitation du traitement :</strong> vous pouvez demander de limiter l'utilisation de vos données.</li>
                  <li><strong className="text-[#FCDA89]">Droit à la portabilité :</strong> vous pouvez obtenir vos données dans un format structuré.</li>
                  <li><strong className="text-[#FCDA89]">Droit d'opposition :</strong> vous pouvez vous opposer au traitement de vos données.</li>
                  <li><strong className="text-[#FCDA89]">Droit de retirer votre consentement :</strong> à tout moment.</li>
                </ul>
                <p className="text-white/90">
                  Pour exercer ces droits, contactez-nous à privacy@reenove.com.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Sécurité des données</h2>
                <p className="text-white/90">
                  Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos données 
                  contre les accès non autorisés, les pertes ou les altérations. Ces mesures incluent le chiffrement des données, 
                  des contrôles d'accès stricts et des audits de sécurité réguliers.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Transferts internationaux</h2>
                <p className="text-white/90">
                  Nos serveurs sont principalement situés dans l'Union Européenne. Si nous devons transférer vos données en dehors de l'UE, 
                  nous nous assurons que des garanties appropriées sont en place, comme les clauses contractuelles types de la Commission européenne.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Cookies et technologies similaires</h2>
                <p className="text-white/90">
                  Notre site utilise des cookies et des technologies similaires pour améliorer votre expérience, 
                  analyser l'utilisation de notre site et personnaliser le contenu. Vous pouvez gérer vos préférences 
                  de cookies via notre bandeau de cookies accessible à tout moment.
                </p>
                
                <h3 className="text-xl mt-6 mb-3 font-bold text-white">Qu'est-ce qu'un cookie ?</h3>
                <p className="text-white/90">
                  Un cookie est un petit fichier texte stocké sur votre appareil lorsque vous visitez un site web.
                  Les cookies nous permettent de reconnaître votre appareil et de mémoriser certaines informations
                  sur votre visite pour faciliter votre navigation future et personnaliser votre expérience.
                </p>
                
                <h3 className="text-xl mt-6 mb-3 font-bold text-white">Types de cookies que nous utilisons</h3>
                <ul className="list-disc pl-6 text-white/90 space-y-3 my-4">
                  <li>
                    <strong className="text-[#FCDA89]">Cookies strictement nécessaires :</strong> Ces cookies sont essentiels au fonctionnement
                    de notre site et ne peuvent pas être désactivés. Ils permettent les fonctionnalités de base comme la navigation
                    et l'accès aux zones sécurisées du site.
                  </li>
                  <li>
                    <strong className="text-[#FCDA89]">Cookies fonctionnels :</strong> Ces cookies nous permettent de personnaliser votre expérience
                    en mémorisant vos préférences (comme votre langue préférée) et en vous offrant des fonctionnalités améliorées.
                  </li>
                  <li>
                    <strong className="text-[#FCDA89]">Cookies analytiques :</strong> Ces cookies nous aident à comprendre comment les visiteurs
                    interagissent avec notre site en collectant des informations de manière anonyme. Cela nous permet d'améliorer
                    constamment notre site et nos services.
                  </li>
                  <li>
                    <strong className="text-[#FCDA89]">Cookies marketing :</strong> Ces cookies sont utilisés pour suivre les visiteurs sur différents
                    sites web. Ils sont conçus pour afficher des publicités pertinentes et engageantes pour l'utilisateur individuel.
                  </li>
                </ul>
                
                <h3 className="text-xl mt-6 mb-3 font-bold text-white">Durée de conservation des cookies</h3>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li><strong className="text-[#FCDA89]">Cookies de session :</strong> Ces cookies sont temporaires et sont supprimés lorsque vous fermez votre navigateur.</li>
                  <li><strong className="text-[#FCDA89]">Cookies persistants :</strong> Ces cookies restent sur votre appareil jusqu'à leur expiration ou jusqu'à ce que vous les supprimiez manuellement.</li>
                </ul>
                
                <h3 className="text-xl mt-6 mb-3 font-bold text-white">Comment gérer vos préférences en matière de cookies</h3>
                <p className="text-white/90">
                  Vous pouvez gérer vos préférences en matière de cookies de plusieurs façons :
                </p>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li>Via notre bannière de cookies accessible à tout moment en cliquant sur l'icône en bas à droite de votre écran.</li>
                  <li>En modifiant les paramètres de votre navigateur pour bloquer ou supprimer les cookies.</li>
                </ul>
                
                <div className="bg-[#FCDA89]/10 p-4 rounded-lg border border-[#FCDA89]/30 mt-6">
                  <p className="text-white/90">
                    <strong className="text-[#FCDA89]">Veuillez noter :</strong> Si vous choisissez de désactiver certains cookies, 
                    certaines parties de notre site peuvent ne pas fonctionner correctement. Les cookies strictement nécessaires
                    ne peuvent pas être désactivés car ils sont essentiels au fonctionnement du site.
                  </p>
                </div>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Modifications de la politique</h2>
                <p className="text-white/90">
                  Nous pouvons modifier cette politique de confidentialité de temps à autre. La date de la dernière mise à jour sera 
                  indiquée en haut de cette page. Nous vous encourageons à consulter régulièrement cette politique.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">Contact</h2>
                <p className="text-white/90">
                  Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques en matière de données personnelles, 
                  veuillez nous contacter à :
                </p>
                <div className="bg-white/5 p-4 rounded-lg mt-4 border border-[#FCDA89]/20">
                  <p className="font-medium text-[#FCDA89]">Reenove</p>
                  <p className="text-white/90">Responsable de la protection des données</p>
                  <p className="text-white/90">Email : <a href="mailto:privacy@reenove.com" className="text-[#FCDA89] hover:text-[#FCDA89]/80 transition-colors">privacy@reenove.com</a></p>
                  <p className="text-white/90">Adresse : 123 Avenue de la Rénovation, 75001 Paris</p>
                </div>
                <p className="mt-4 text-white/90">
                  Vous avez également le droit de déposer une plainte auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) 
                  si vous estimez que le traitement de vos données personnelles constitue une violation du RGPD.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNavbar />
    </div>
  )
} 