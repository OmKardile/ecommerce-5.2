import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // reactCompiler disabled — babel-plugin-react-compiler not installed in sandbox;
  // can be re-enabled after `bun add -d babel-plugin-react-compiler`
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
