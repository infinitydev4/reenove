/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  eslint: {
    // Ignorez les avertissements ESLint en production
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
