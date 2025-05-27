import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface CategoryCardProps {
  icon: string
  title: string
  count: number
  className?: string
}

export default function CategoryCard({
  icon,
  title,
  count,
  className,
}: CategoryCardProps) {
  const IconComponent = Icons[icon as keyof typeof Icons]

  return (
    <Link
      href={`/create-project-ai`}
      className={cn(
        "group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#FCDA89]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="h-12 w-12 bg-[#FCDA89]/20 rounded-lg flex items-center justify-center mb-3">
          {IconComponent && <IconComponent className="h-6 w-6 text-[#FCDA89]" />}
        </div>
        <h3 className="font-medium text-white group-hover:text-[#FCDA89] transition-colors">{title}</h3>
        <p className="text-sm text-white/60 mt-1">{count} artisans</p>
      </div>
    </Link>
  )
}
