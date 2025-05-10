const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Assurez-vous que le dossier public/icons existe
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
  console.log('Dossier icons créé avec succès');
}

// Chemin vers l'image source (R monochrome sur fond noir)
// Si vous avez déjà une image source, remplacez ce chemin
const sourceImage = path.join(__dirname, '../public/icon.png');

// Tailles d'icônes à générer (selon les standards PWA)
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Fonction pour générer les icônes
async function generateIcons() {
  try {
    // Vérifier que l'image source existe
    if (!fs.existsSync(sourceImage)) {
      console.error(`L'image source ${sourceImage} n'existe pas.`);
      console.log('Veuillez placer une image source nommée logo.png dans le dossier public/');
      return;
    }

    console.log(`Génération des icônes à partir de ${sourceImage}...`);

    // Générer chaque taille d'icône
    const resizePromises = sizes.map(size => {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      return sharp(sourceImage)
        .resize(size, size)
        .toFile(outputPath)
        .then(() => {
          console.log(`✅ Icône ${size}x${size} générée avec succès`);
          return { size, path: outputPath };
        });
    });

    const results = await Promise.all(resizePromises);
    
    // Générer une icône spéciale pour favicon.ico (taille 32x32)
    await sharp(sourceImage)
      .resize(32, 32)
      .toFile(path.join(__dirname, '../public/favicon.ico'))
      .then(() => {
        console.log('✅ favicon.ico généré avec succès');
      });

    console.log('\nRécapitulatif des icônes générées:');
    results.forEach(result => {
      console.log(`- icon-${result.size}x${result.size}.png`);
    });
    console.log('- favicon.ico');

    // Générer un manifest.json avec les icônes
    generateManifest(results);

    console.log('\n✨ Génération des icônes terminée avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la génération des icônes:', error);
  }
}

// Fonction pour générer ou mettre à jour le fichier manifest.json
function generateManifest(iconResults) {
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  
  // Vérifier si le manifest existe déjà
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log('⚠️ Un fichier manifest.json existant a été trouvé et sera mis à jour');
    } catch (error) {
      console.error('❌ Erreur lors de la lecture du manifest.json existant:', error);
    }
  }

  // Mettre à jour les icônes dans le manifest
  manifest.icons = iconResults.map(icon => ({
    src: `/icons/icon-${icon.size}x${icon.size}.png`,
    sizes: `${icon.size}x${icon.size}`,
    type: 'image/png',
    purpose: 'any maskable'
  }));

  // Ajouter des propriétés de base si elles n'existent pas déjà
  manifest.name = manifest.name || 'Reenove';
  manifest.short_name = manifest.short_name || 'Reenove';
  manifest.theme_color = manifest.theme_color || '#ffffff';
  manifest.background_color = manifest.background_color || '#ffffff';
  manifest.display = manifest.display || 'standalone';
  manifest.start_url = manifest.start_url || '/';
  manifest.scope = manifest.scope || '/';
  manifest.description = manifest.description || 'Plateforme de mise en relation entre artisans et clients';

  // Écrire le manifest mis à jour
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('✅ Manifest.json mis à jour avec les nouvelles icônes');
}

// Exécuter la fonction de génération
generateIcons(); 