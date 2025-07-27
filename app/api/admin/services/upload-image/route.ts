import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadToS3, deleteFromS3, extractKeyFromS3Url } from "@/lib/s3";

// Vérifier les permissions d'administrateur
async function isAdmin(session: any) {
  if (!session?.user) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });
  
  return user?.role === "ADMIN";
}

// POST - Upload d'image pour un service
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'administrateur
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const serviceId = formData.get('serviceId') as string;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Utilisez JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux. Taille maximum : 5MB." },
        { status: 400 }
      );
    }

    // Si serviceId est fourni, vérifier que le service existe
    let service = null;
    if (serviceId) {
      service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { id: true, name: true, icon: true }
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service non trouvé" },
          { status: 404 }
        );
      }
    }

    // Convertir le fichier en buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `service-${serviceId || 'new'}-${timestamp}.${fileExtension}`;
    const s3Key = `services/images/${fileName}`;

    // Upload vers S3
    const imageUrl = await uploadToS3(buffer, s3Key, file.type);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Erreur lors de l'upload de l'image" },
        { status: 500 }
      );
    }

    // Si c'est pour un service existant, mettre à jour la base de données
    if (service) {
      // Supprimer l'ancienne image si elle existe
      if (service.icon) {
        const oldKey = extractKeyFromS3Url(service.icon);
        if (oldKey) {
          await deleteFromS3(oldKey);
        }
      }

      // Mettre à jour le service avec la nouvelle image
      await prisma.service.update({
        where: { id: serviceId },
        data: { icon: imageUrl }
      });

      console.log(`✅ Image du service mise à jour: ${service.name} -> ${imageUrl}`);
    }

    return NextResponse.json({
      imageUrl,
      message: "Image uploadée avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de l'upload de l'image:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer l'image d'un service
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'administrateur
    const session = await getServerSession(authOptions);
    
    if (!await isAdmin(session)) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json(
        { error: "ID du service requis" },
        { status: 400 }
      );
    }

    // Récupérer le service
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, name: true, icon: true }
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service non trouvé" },
        { status: 404 }
      );
    }

    if (!service.icon) {
      return NextResponse.json(
        { error: "Aucune image à supprimer" },
        { status: 400 }
      );
    }

    // Supprimer l'image de S3
    const s3Key = extractKeyFromS3Url(service.icon);
    if (s3Key) {
      await deleteFromS3(s3Key);
    }

    // Mettre à jour le service en supprimant l'URL de l'image
    await prisma.service.update({
      where: { id: serviceId },
      data: { icon: null }
    });

    console.log(`✅ Image du service supprimée: ${service.name}`);

    return NextResponse.json({
      message: "Image supprimée avec succès"
    });

  } catch (error) {
    console.error("Erreur lors de la suppression de l'image:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'image" },
      { status: 500 }
    );
  }
} 