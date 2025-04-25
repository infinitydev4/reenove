import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

// Configuration Cloudinary
const cloudinary = require('cloudinary').v2
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configuration AWS S3
const s3Client = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
  ? new S3Client({
      region: process.env.AWS_REGION || "eu-west-3",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    })
  : null

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

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

    // Générer un nom de fichier unique
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, '-').toLowerCase()}`

    let imageUrl = ""

    // Essayer d'utiliser Cloudinary d'abord
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        // Convertir le buffer en base64 pour Cloudinary
        const base64Data = buffer.toString("base64")
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload(
            `data:${file.type};base64,${base64Data}`,
            { 
              public_id: fileName.split(".")[0],
              folder: "renoveo",
              resource_type: "image"
            },
            (error: any, result: any) => {
              if (error) reject(error)
              else resolve(result)
            }
          )
        })
        
        // @ts-ignore
        imageUrl = result.secure_url
      } catch (cloudinaryError) {
        console.error("Erreur Cloudinary:", cloudinaryError)
        // Si Cloudinary échoue, on essaie S3 comme solution de secours
      }
    }

    // Si l'URL d'image n'est pas définie, essayer AWS S3
    if (!imageUrl && s3Client) {
      try {
        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: `uploads/${fileName}`,
          Body: buffer,
          ContentType: file.type
        }

        await s3Client.send(new PutObjectCommand(params))
        imageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || "eu-west-3"}.amazonaws.com/uploads/${fileName}`
      } catch (s3Error) {
        console.error("Erreur AWS S3:", s3Error)
        return NextResponse.json({ 
          error: "Échec du téléchargement vers le service de stockage" 
        }, { status: 500 })
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ 
        error: "Aucun service de stockage configuré correctement" 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      url: imageUrl 
    })
  } catch (error) {
    console.error("Erreur de téléchargement:", error)
    return NextResponse.json({ 
      error: "Échec du téléchargement du fichier" 
    }, { status: 500 })
  }
} 