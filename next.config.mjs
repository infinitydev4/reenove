/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'renoveo.s3.eu-north-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.eu-west-3.amazonaws.com',
      },
    ],
    // Permettre les URLs data:image
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Les formats sont limités à avif et webp uniquement
    formats: ['image/avif', 'image/webp'],
    domains: ['localhost'],
    // Activer cette option pour autoriser les data URLs en développement et temporairement en production
    unoptimized: true, // Permet d'utiliser les data URLs à la fois en développement et en production
  },
  eslint: {
    // Ignorez les avertissements ESLint en production
    ignoreDuringBuilds: true,
  },
  // Définir les en-têtes de sécurité pour permettre Google Maps et ses API
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://js.stripe.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.googleapis.com;
              img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://renoveo.s3.eu-north-1.amazonaws.com https://*.s3.amazonaws.com https://*.s3.eu-west-3.amazonaws.com;
              font-src 'self' https://fonts.gstatic.com;
              frame-src 'self' https://*.google.com https://maps.googleapis.com https://js.stripe.com;
              connect-src 'self' https://*.googleapis.com https://api.stripe.com;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ]
  }
};

export default nextConfig;
