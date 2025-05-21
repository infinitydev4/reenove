import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

// Vérifier si AWS S3 est correctement configuré
const isS3Configured = !!(process.env.REENOVE_AWS_ACCESS_KEY_ID && 
                        process.env.REENOVE_AWS_SECRET_ACCESS_KEY && 
                        process.env.REENOVE_AWS_S3_BUCKET_NAME)

// Définir une région par défaut cohérente
const DEFAULT_REGION = "eu-north-1"

// Configuration AWS S3 seulement si les clés sont définies
const s3Client = isS3Configured ? new S3Client({
  region: process.env.REENOVE_AWS_REGION || DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.REENOVE_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.REENOVE_AWS_SECRET_ACCESS_KEY || ""
  }
}) : null

// Récupérer le nom du bucket
const bucketName = process.env.REENOVE_AWS_S3_BUCKET_NAME || ""

/**
 * Téléverser un fichier vers AWS S3
 * @param buffer - Contenu du fichier
 * @param key - Chemin du fichier sur S3 (inclut le nom du fichier)
 * @param contentType - Type MIME du fichier
 * @returns URL du fichier uploadé ou null en cas d'erreur
 */
export async function uploadToS3(buffer: Buffer, key: string, contentType: string): Promise<string | null> {
  if (!isS3Configured || !s3Client) {
    console.warn("AWS S3 n'est pas configuré. Impossible d'uploader le fichier.")
    return null
  }

  try {
    console.log("Upload du fichier vers S3:", key)
    
    // Upload du fichier vers S3 sans ACL (compatible avec les buckets qui n'autorisent pas les ACLs)
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType
    }))
    
    // Générer l'URL du fichier
    const fileUrl = `https://${bucketName}.s3.${process.env.REENOVE_AWS_REGION || DEFAULT_REGION}.amazonaws.com/${key}`
    console.log("Fichier uploadé avec succès:", fileUrl)
    
    return fileUrl
  } catch (error) {
    console.error("Erreur AWS S3:", error)
    return null
  }
}

/**
 * Supprimer un fichier sur AWS S3
 * @param key - Chemin du fichier sur S3
 * @returns true si le fichier a été supprimé avec succès, false sinon
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  if (!isS3Configured || !s3Client) {
    console.warn("AWS S3 n'est pas configuré. Impossible de supprimer le fichier.")
    return false
  }

  try {
    console.log("Suppression du fichier S3:", key)
    
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    }))
    
    console.log("Fichier supprimé avec succès")
    return true
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier S3:", error)
    return false
  }
}

/**
 * Extraire la clé S3 à partir d'une URL S3
 * @param url - URL complète du fichier S3
 * @returns Clé S3 (chemin relatif du fichier dans le bucket)
 */
export function extractKeyFromS3Url(url: string): string | null {
  if (!url || !url.includes('amazonaws.com')) return null
  
  try {
    // Format typique: https://bucket-name.s3.region.amazonaws.com/path/to/file.ext
    const urlParts = url.split('amazonaws.com/')
    if (urlParts.length < 2) return null
    
    return urlParts[1]
  } catch (error) {
    console.error("Erreur lors de l'extraction de la clé S3:", error)
    return null
  }
}

/**
 * Vérifier si S3 est correctement configuré
 */
export function isS3Available(): boolean {
  return isS3Configured
}

/**
 * Obtenir le client S3 pour des usages avancés
 */
export function getS3Client(): S3Client | null {
  return s3Client
}

/**
 * Obtenir le nom du bucket S3
 */
export function getBucketName(): string {
  return bucketName
}

export default {
  uploadToS3,
  deleteFromS3,
  extractKeyFromS3Url,
  isS3Available,
  getS3Client,
  getBucketName
} 