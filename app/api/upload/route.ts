import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Définir une région par défaut cohérente
const DEFAULT_REGION = "eu-north-1"

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
    region: process.env.REENOVE_AWS_REGION || DEFAULT_REGION,
    credentials: {
      accessKeyId: process.env.REENOVE_AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.REENOVE_AWS_SECRET_ACCESS_KEY || ""
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    // Logs de débogage pour les variables d'environnement S3
    console.log("Variables d'environnement S3:", {
      region: process.env.REENOVE_AWS_REGION || DEFAULT_REGION,
      accessKey: process.env.REENOVE_AWS_ACCESS_KEY_ID ? `${process.env.REENOVE_AWS_ACCESS_KEY_ID.substring(0, 3)}...` : "non défini",
      secretKey: process.env.REENOVE_AWS_SECRET_ACCESS_KEY ? "défini (masqué)" : "non défini",
      bucket: process.env.REENOVE_AWS_S3_BUCKET_NAME || "non défini",
      s3Enabled: s3Enabled,
      nodeEnv: process.env.NODE_ENV
    });

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
        
        imageUrl = `https://${process.env.REENOVE_AWS_S3_BUCKET_NAME}.s3.${process.env.REENOVE_AWS_REGION || DEFAULT_REGION}.amazonaws.com/${s3Key}`
        console.log("Upload S3 réussi:", imageUrl)
      } catch (s3Error) {
        console.error("Erreur AWS S3:", s3Error)
        // Si S3 échoue, utiliser le stockage en base64 comme solution de secours
      }
    } else {
      console.log("S3 désactivé ou mal configuré, utilisation du stockage base64 temporaire")
      if (!process.env.REENOVE_AWS_S3_BUCKET_NAME) {
        console.error("Variable manquante: REENOVE_AWS_S3_BUCKET_NAME")
      }
    }

    // Si l'URL d'image n'est pas définie, utiliser le stockage base64 temporairement
    if (!imageUrl) {
      try {
        // Solution temporaire - stocker l'image en base64
        const base64Data = buffer.toString("base64")
        imageUrl = `data:${file.type};base64,${base64Data}`
        console.log("Image stockée en base64 (solution temporaire) - Taille:", base64Data.length)
      } catch (error) {
        console.error("Erreur lors du stockage de l'image en base64:", error)
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ 
        error: "Impossible de stocker l'image. Veuillez vérifier la configuration S3." 
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