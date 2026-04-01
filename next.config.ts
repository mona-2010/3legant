import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "akwlfwaubucratjbekch.supabase.co",
      },
    ],
  },
};

export default nextConfig;
