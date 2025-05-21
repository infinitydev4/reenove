import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Configuration Cloudinary (en fallback)
const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Vérification des variables d'environnement S3
const s3Enabled = !!(
  process.env.REENOVE_AWS_REGION && 
  process.env.REENOVE_AWS_ACCESS_KEY_ID && 
  process.env.REENOVE_AWS_SECRET_ACCESS_KEY && 
  process.env.REENOVE_AWS_S3_BUCKET_NAME
)

// Configuration AWS S3 (si les variables sont définies)
let s3Client: S3Client | null = null
if (s3Enabled) {
  s3Client = new S3Client({
    region: process.env.REENOVE_AWS_REGION || "eu-west-3",
    credentials: {
      accessKeyId: process.env.REENOVE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.REENOVE_AWS_SECRET_ACCESS_KEY || ""
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    // Pour les besoins de démo, désactivons la vérification d'authentification
    // Nous voulons permettre l'upload même sans session
    const session = await getServerSession(authOptions)
    /* Commenter pour le développement/démo
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }
    */

    // Extraire le fichier de la requête
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Type de fichier non autorisé. Seuls les formats JPEG, PNG, WEBP et GIF sont acceptés." 
      }, { status: 400 })
    }

    // Vérifier la taille du fichier (max 5 MB)
    const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "Le fichier est trop volumineux. Taille maximale: 5 MB." 
      }, { status: 400 })
    }

    console.log("Traitement du fichier:", file.name, "Type:", file.type, "Taille:", file.size)

    // Générer un nom de fichier unique
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileExtension = file.name.split('.').pop() || ""
    const uniqueFileName = `${uuidv4()}.${fileExtension}`
    const s3Key = `uploads/${uniqueFileName}`

    let imageUrl = ""

    // Essayer d'utiliser AWS S3 d'abord (si configuré)
    if (s3Client && s3Enabled && process.env.REENOVE_AWS_S3_BUCKET_NAME) {
      try {
        console.log("Tentative d'upload vers S3 avec le bucket:", process.env.REENOVE_AWS_S3_BUCKET_NAME)
        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.REENOVE_AWS_S3_BUCKET_NAME,
          Key: s3Key,
          Body: buffer,
          ContentType: file.type
        }))
        
        imageUrl = `https://${process.env.REENOVE_AWS_S3_BUCKET_NAME}.s3.${process.env.REENOVE_AWS_REGION}.amazonaws.com/${s3Key}`
        console.log("Upload S3 réussi:", imageUrl)
      } catch (s3Error) {
        console.error("Erreur AWS S3:", s3Error)
        // Si S3 échoue, utiliser Cloudinary comme fallback
      }
    } else {
      console.log("S3 désactivé ou mal configuré, utilisation du stockage local")
    }

    // Si l'URL d'image n'est pas définie, utiliser le stockage local
    if (!imageUrl) {
      try {
        // En mode développement, utiliser un stockage local temporaire à la place de Cloudinary
        if (process.env.NODE_ENV === 'development') {
          // Solution temporaire pour les tests - stocker localement l'image (en base64)
          const base64Data = buffer.toString("base64")
          // Ne pas tronquer les données base64 pour l'affichage correct des images
          imageUrl = `data:${file.type};base64,${base64Data}`
          console.log("Image stockée en base64 (développement uniquement) - Taille:", base64Data.length)
        } else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
          // Si en production et Cloudinary est configuré
          const base64Data = buffer.toString("base64")
          const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
              `data:${file.type};base64,${base64Data}`,
              { 
                public_id: uniqueFileName.split(".")[0],
                folder: "renoveo",
                resource_type: "image"
              },
              (error: any, result: any) => {
                if (error) reject(error)
                else resolve(result)
              }
            )
          })
          
          // Corriger cette ligne avec le type approprié
          imageUrl = (result as any).secure_url
          console.log("Upload Cloudinary réussi:", imageUrl)
        }
      } catch (cloudinaryError) {
        console.error("Erreur lors du stockage de l'image:", cloudinaryError)
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ 
        error: "Aucun service de stockage configuré correctement" 
      }, { status: 500 })
    }

    console.log("URL finale de l'image:", imageUrl.substring(0, 100) + "...")
    
    return NextResponse.json({ 
      success: true, 
      fileUrl: imageUrl 
    })
  } catch (error) {
    console.error("Erreur de téléchargement:", error)
    return NextResponse.json({ 
      error: "Échec du téléchargement du fichier" 
    }, { status: 500 })
  }
} 