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
  },
  eslint: {
    // Ignorez les avertissements ESLint en production
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
