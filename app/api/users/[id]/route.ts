import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";

// Récupérer un utilisateur
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification et les droits
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.AGENT)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}

// Mettre à jour un utilisateur
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification et les droits
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== Role.ADMIN && session.user.role !== Role.AGENT)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const userId = params.id;
    const data = await req.json();

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Protection contre la modification des administrateurs par des non-administrateurs
    if (existingUser.role === Role.ADMIN && session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Vous n'avez pas les droits pour modifier un administrateur" },
        { status: 403 }
      );
    }

    // Mise à jour de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

// Supprimer un utilisateur
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Vérifier l'authentification et les droits
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "Non autorisé. Seuls les administrateurs peuvent supprimer des utilisateurs." },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Protection contre la suppression des administrateurs
    if (existingUser.role === Role.ADMIN && existingUser.id !== session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer un autre administrateur" },
        { status: 403 }
      );
    }

    // Suppression de l'utilisateur
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { success: true, message: "Utilisateur supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
} 