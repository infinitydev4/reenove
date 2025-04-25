"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return { success: true, data: categories }
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return { success: false, error: "Impossible de récupérer les catégories" }
  }
}

export async function getCategoryWithServices(categoryId: string) {
  try {
    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
        isActive: true,
      },
      include: {
        services: {
          where: {
            isActive: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    })

    if (!category) {
      return { success: false, error: "Catégorie non trouvée" }
    }

    return { success: true, data: category }
  } catch (error) {
    console.error("Failed to fetch category with services:", error)
    return { success: false, error: "Impossible de récupérer les détails de la catégorie" }
  }
}

export async function createCategory(data: { name: string; description?: string; icon?: string }) {
  try {
    const { name, description, icon } = data
    
    const existingCategory = await prisma.category.findUnique({
      where: { name },
    })

    if (existingCategory) {
      return { success: false, error: "Une catégorie avec ce nom existe déjà" }
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        description,
        icon,
        slug: slugify(name),
      },
    })

    revalidatePath("/admin/categories")
    return { success: true, data: newCategory }
  } catch (error) {
    console.error("Failed to create category:", error)
    return { success: false, error: "Impossible de créer la catégorie" }
  }
}

export async function updateCategory(
  categoryId: string,
  data: { name?: string; description?: string; icon?: string; isActive?: boolean }
) {
  try {
    const { name, description, icon, isActive } = data
    
    // Si le nom est mis à jour, vérifier qu'il n'existe pas déjà
    if (name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name,
          id: { not: categoryId },
        },
      })

      if (existingCategory) {
        return { success: false, error: "Une catégorie avec ce nom existe déjà" }
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name, slug: slugify(name) }),
        ...(description !== undefined && { description }),
        ...(icon !== undefined && { icon }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    revalidatePath("/admin/categories")
    return { success: true, data: updatedCategory }
  } catch (error) {
    console.error("Failed to update category:", error)
    return { success: false, error: "Impossible de mettre à jour la catégorie" }
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    // Vérifier si la catégorie est utilisée par des services
    const categoryWithServices = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            services: true,
          },
        },
      },
    })

    if (categoryWithServices?._count.services && categoryWithServices._count.services > 0) {
      return {
        success: false,
        error: "Impossible de supprimer cette catégorie car elle est associée à des services",
      }
    }

    await prisma.category.delete({
      where: { id: categoryId },
    })

    revalidatePath("/admin/categories")
    return { success: true }
  } catch (error) {
    console.error("Failed to delete category:", error)
    return { success: false, error: "Impossible de supprimer la catégorie" }
  }
} 