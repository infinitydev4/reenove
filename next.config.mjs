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
    // Activer cette option pour autoriser les data URLs en développement
    unoptimized: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Ignorez les avertissements ESLint en production
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
