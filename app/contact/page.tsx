import { Metadata } from "next"
import Navbar from "@/components/navbar"
import { Footer } from "@/components/Footer"
import BottomNavbar from "@/components/bottom-navbar"
import ContactForm from "@/components/contact/ContactForm"
import ContactInfo from "@/components/contact/ContactInfo"

export const metadata: Metadata = {
  title: "Contact | Reenove - Plateforme d'artisans",
  description: "Contactez l'équipe Reenove pour toute question concernant notre service, l'assistance technique ou les partenariats. Notre équipe est à votre disposition pour vous aider.",
  keywords: "contact Reenove, service client, assistance, aide, question, partenariat",
}

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero section */}
        <section className="w-full py-16 md:py-24 bg-[#0E261C]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Contactez-nous</h1>
              <div className="w-20 h-1 bg-[#FCDA89] mx-auto mb-6"></div>
              <p className="text-white/70 text-lg">
                Une question, une suggestion ou besoin d&apos;aide ? Notre équipe est à votre écoute.
              </p>
            </div>
          </div>
        </section>
        
        {/* Contact section */}
        <section className="w-full py-16 bg-[#0A1210]">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
              <ContactForm />
              <ContactInfo />
            </div>
          </div>
        </section>
        
        {/* Map section */}
        <section className="w-full h-[400px] bg-[#0E261C]/90 relative">
          <div className="absolute inset-0 z-0 opacity-70">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2903.5550385232267!2d5.364415512364828!3d43.29618977111872!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9c0c9059f380f%3A0x7e3ec011d06e1f!2sVieux-Port%20de%20Marseille!5e0!3m2!1sfr!2sfr!4v1651234567890!5m2!1sfr!2sfr" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }}
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
          <div className="absolute inset-0 bg-[#0E261C]/50 z-10"></div>
        </section>
      </main>
      
      <Footer />
      <BottomNavbar />
    </div>
  )
} 