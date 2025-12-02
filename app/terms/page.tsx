import Navbar from "@/components/navbar"
import { Footer } from "@/components/Footer"
import BottomNavbar from "@/components/bottom-navbar"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation | Reenove",
  description: "Les conditions générales d'utilisation de la plateforme Reenove - Mise en relation entre artisans et clients pour des projets de rénovation.",
}

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0E261C]">
      <Navbar />
      
      <main className="flex-1 py-16">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="bg-[#0E261C] rounded-2xl shadow-md border border-[#FCDA89]/20 p-6 md:p-10">
            <header className="mb-10 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Conditions Générales d'Utilisation</h1>
              <p className="text-[#FCDA89]/80">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>
            
            <div className="prose prose-lg max-w-none prose-invert">
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">1. Introduction</h2>
                <p className="text-white/90">
                  Bienvenue sur Reenove, une plateforme qui met en relation des clients avec des artisans qualifiés pour des projets de rénovation.
                  Les présentes Conditions Générales d'Utilisation (CGU) régissent votre utilisation de la plateforme Reenove, 
                  accessible depuis le site web www.reenove.com et l'application mobile Reenove.
                </p>
                <p className="text-white/90">
                  En utilisant notre plateforme, vous acceptez d'être lié par ces CGU. Si vous n'acceptez pas ces conditions, 
                  veuillez ne pas utiliser notre plateforme.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">2. Définitions</h2>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li><strong className="text-[#FCDA89]">Plateforme :</strong> le site web et l'application mobile Reenove.</li>
                  <li><strong className="text-[#FCDA89]">Utilisateur :</strong> toute personne qui accède à la Plateforme.</li>
                  <li><strong className="text-[#FCDA89]">Compte :</strong> espace personnel créé par un Utilisateur sur la Plateforme.</li>
                  <li><strong className="text-[#FCDA89]">Client :</strong> Utilisateur qui publie un projet de rénovation sur la Plateforme.</li>
                  <li><strong className="text-[#FCDA89]">Artisan :</strong> Utilisateur professionnel qui propose ses services sur la Plateforme.</li>
                  <li><strong className="text-[#FCDA89]">Projet :</strong> demande de travaux publiée par un Client sur la Plateforme.</li>
                  <li><strong className="text-[#FCDA89]">Devis :</strong> proposition commerciale faite par un Artisan en réponse à un Projet.</li>
                  <li><strong className="text-[#FCDA89]">Services :</strong> ensemble des fonctionnalités proposées par la Plateforme.</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">3. Inscription et création de compte</h2>
                <h3 className="text-xl mb-3 font-semibold text-white">3.1 Conditions d'inscription</h3>
                <p className="text-white/90">
                  Pour utiliser nos Services, vous devez créer un compte. Vous devez être âgé d'au moins 18 ans et avoir la capacité juridique pour contracter.
                  Pour les Artisans, vous devez également être un professionnel légalement établi et disposer des qualifications et assurances nécessaires.
                </p>
                
                <h3 className="text-xl mb-3 mt-6 font-semibold text-white">3.2 Exactitude des informations</h3>
                <p className="text-white/90">
                  Vous vous engagez à fournir des informations exactes, complètes et à jour lors de votre inscription et à les maintenir à jour.
                  Reenove se réserve le droit de vérifier l'exactitude des informations fournies et de suspendre ou supprimer un compte
                  en cas d'informations inexactes ou incomplètes.
                </p>
                
                <h3 className="text-xl mb-3 mt-6 font-semibold text-white">3.3 Sécurité du compte</h3>
                <p className="text-white/90">
                  Vous êtes responsable de la confidentialité de vos identifiants de connexion et de toutes les activités effectuées via votre compte.
                  Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte ou de toute autre violation de sécurité.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">4. Description des services</h2>
                <h3 className="text-xl mb-3 font-semibold text-white">4.1 Services pour les Clients</h3>
                <p className="text-white/90">
                  La Plateforme permet aux Clients de :
                </p>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li>Publier des projets de rénovation</li>
                  <li>Recevoir des devis d'Artisans qualifiés</li>
                  <li>Communiquer avec les Artisans</li>
                  <li>Sélectionner un Artisan pour réaliser le projet</li>
                  <li>Évaluer les Artisans après réalisation du projet</li>
                </ul>
                
                <h3 className="text-xl mb-3 mt-6 font-semibold text-white">4.2 Services pour les Artisans</h3>
                <p className="text-white/90">
                  La Plateforme permet aux Artisans de :
                </p>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li>Créer et gérer un profil professionnel</li>
                  <li>Accéder aux projets correspondant à leurs compétences</li>
                  <li>Envoyer des devis aux Clients</li>
                  <li>Communiquer avec les Clients</li>
                  <li>Gérer leurs missions</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">5. Règles d'utilisation</h2>
                <h3 className="text-xl mb-3 font-semibold text-white">5.1 Règles générales</h3>
                <p className="text-white/90">
                  En utilisant notre Plateforme, vous vous engagez à :
                </p>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li>Respecter les lois et réglementations en vigueur</li>
                  <li>Ne pas porter atteinte aux droits des tiers</li>
                  <li>Ne pas publier de contenu illégal, offensant, diffamatoire ou inapproprié</li>
                  <li>Ne pas utiliser la Plateforme à des fins frauduleuses</li>
                  <li>Ne pas tenter de contourner le fonctionnement normal de la Plateforme</li>
                </ul>
                
                <h3 className="text-xl mb-3 mt-6 font-semibold text-white">5.2 Règles spécifiques aux Clients</h3>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li>Fournir des informations précises et complètes sur les projets</li>
                  <li>Ne pas publier de projets fictifs ou sans intention réelle de réalisation</li>
                  <li>Répondre aux devis et aux messages des Artisans dans un délai raisonnable</li>
                </ul>
                
                <h3 className="text-xl mb-3 mt-6 font-semibold text-white">5.3 Règles spécifiques aux Artisans</h3>
                <ul className="list-disc pl-6 text-white/90 space-y-2 my-4">
                  <li>Disposer des qualifications, certifications et assurances nécessaires pour exercer leur métier</li>
                  <li>Fournir des devis détaillés et honnêtes</li>
                  <li>Respecter les engagements pris envers les Clients</li>
                  <li>Maintenir à jour les informations de leur profil</li>
                </ul>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">6. Conditions financières</h2>
                <h3 className="text-xl mb-3 font-semibold text-white">6.1 Commission</h3>
                <p className="text-white/90">
                  L'inscription et l'utilisation de la Plateforme sont gratuites pour les Clients. 
                  Les Artisans s'acquittent d'une commission sur les projets obtenus via la Plateforme, 
                  selon les modalités détaillées dans nos Conditions Particulières pour les Artisans.
                </p>
                
                <h3 className="text-xl mb-3 mt-6 font-semibold text-white">6.2 Modalités de paiement</h3>
                <p className="text-white/90">
                  Les modalités de paiement des commissions sont précisées dans les Conditions Particulières pour les Artisans. 
                  Reenove utilise des prestataires de services de paiement sécurisés pour traiter les transactions.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">7. Propriété intellectuelle</h2>
                <p className="text-white/90">
                  La Plateforme, son contenu, son design, ses logos, ses marques et tous les éléments qui la composent 
                  sont la propriété exclusive de Reenove ou de ses partenaires. Ils sont protégés par les lois sur la propriété intellectuelle.
                </p>
                <p className="text-white/90">
                  Toute reproduction, représentation, modification, publication, adaptation ou exploitation de tout ou partie 
                  des éléments de la Plateforme sans autorisation préalable écrite de Reenove est strictement interdite.
                </p>
                <p className="text-white/90">
                  En publiant du contenu sur la Plateforme (textes, photos, etc.), vous accordez à Reenove une licence non exclusive, 
                  mondiale, gratuite, pour utiliser, reproduire, adapter et afficher ce contenu sur la Plateforme.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">8. Responsabilité</h2>
                <h3 className="text-xl mb-3 font-semibold text-white">8.1 Responsabilité de Reenove</h3>
                <p className="text-white/90">
                  Reenove est un intermédiaire qui met en relation des Clients et des Artisans, mais n'est pas partie aux contrats conclus entre eux. 
                  Reenove ne peut être tenu responsable de la qualité des prestations réalisées par les Artisans, ni des éventuels litiges entre Clients et Artisans.
                </p>
                <p className="text-white/90">
                  Reenove s'efforce d'assurer le bon fonctionnement de la Plateforme mais ne garantit pas son fonctionnement ininterrompu et sans erreur.
                </p>
                
                <h3 className="text-xl mb-3 mt-6 font-semibold text-white">8.2 Responsabilité des Utilisateurs</h3>
                <p className="text-white/90">
                  Les Utilisateurs sont seuls responsables du contenu qu'ils publient sur la Plateforme. 
                  Les Artisans sont seuls responsables des prestations qu'ils réalisent.
                </p>
                <p className="text-white/90">
                  Les Utilisateurs s'engagent à indemniser Reenove contre toute réclamation, action ou revendication 
                  résultant de la violation des présentes CGU ou des lois en vigueur.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">9. Résiliation</h2>
                <p className="text-white/90">
                  Vous pouvez résilier votre compte à tout moment en suivant la procédure prévue dans votre espace personnel.
                </p>
                <p className="text-white/90">
                  Reenove se réserve le droit de suspendre ou résilier votre compte, sans préavis ni indemnité, 
                  en cas de non-respect des présentes CGU ou en cas d'inactivité prolongée.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">10. Modification des CGU</h2>
                <p className="text-white/90">
                  Reenove se réserve le droit de modifier les présentes CGU à tout moment. Les Utilisateurs seront informés 
                  des modifications par une notification sur la Plateforme ou par email. Les modifications prennent effet 
                  dès leur publication sur la Plateforme.
                </p>
                <p className="text-white/90">
                  Si vous continuez à utiliser la Plateforme après la modification des CGU, vous acceptez les nouvelles conditions.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">11. Protection des données personnelles</h2>
                <p className="text-white/90">
                  Reenove collecte et traite vos données personnelles conformément à sa Politique de Confidentialité, que vous pouvez consulter 
                  <a href="/privacy" className="text-[#FCDA89] hover:text-[#FCDA89]/80 font-medium transition-colors"> ici</a>.
                </p>
              </section>
              
              <section className="mb-10">
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">12. Loi applicable et juridiction compétente</h2>
                <p className="text-white/90">
                  Les présentes CGU sont régies par le droit français. 
                </p>
                <p className="text-white/90">
                  En cas de litige, une solution amiable sera recherchée en priorité. À défaut d'accord amiable, les tribunaux français seront compétents.
                </p>
              </section>
              
              <section>
                <h2 className="text-2xl mb-4 font-bold text-[#FCDA89]">13. Contact</h2>
                <p className="text-white/90">
                  Pour toute question concernant ces CGU, vous pouvez nous contacter à l'adresse suivante :
                </p>
                <div className="bg-white/5 p-4 rounded-lg mt-4 border border-[#FCDA89]/20">
                  <p className="font-medium text-[#FCDA89]">Reenove</p>
                  <p className="text-white/90">Service Juridique</p>
                  <p className="text-white/90">Email : <a href="mailto:contact@reenove.com" className="text-[#FCDA89] hover:text-[#FCDA89]/80 transition-colors">contact@reenove.com</a></p>
                  <p className="text-white/90">Adresse : 123 Boulevard des Artisans, 13000 Marseille, France</p>
                </div>
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