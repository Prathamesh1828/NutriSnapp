import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Forces CSS into the initial HTML — prevents FOUC with Tailwind v4
  experimental: {
    optimizeCss: true,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
};

export default nextConfig;