import CategoryCard from "@/components/category-card"

export default function CategoriesSection() {
  return (
    <section className="w-full py-20 bg-[#0E261C]">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Expertise Multi-domaines</h2>
          <div className="w-20 h-1 bg-[#FCDA89] mx-auto mb-6"></div>
          <p className="text-white/70 max-w-2xl mx-auto">
            Découvrez nos artisans par catégorie de métier
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 max-w-5xl mx-auto">
          <CategoryCard icon="hammer" title="Menuiserie" count={42} />
          <CategoryCard icon="wrench" title="Plomberie" count={38} />
          <CategoryCard icon="zap" title="Électricité" count={56} />
          <CategoryCard icon="paintbrush" title="Peinture" count={29} />
          <CategoryCard icon="brick-wall" title="Maçonnerie" count={31} />
          <CategoryCard icon="garden" title="Jardinage" count={24} />
        </div>
      </div>
    </section>
  )
} 