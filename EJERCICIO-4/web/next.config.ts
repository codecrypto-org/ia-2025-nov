import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mover serverComponentsExternalPackages fuera de experimental en Next.js 16
  serverExternalPackages: ['@modelcontextprotocol/sdk'],
  
  // Configuración de Turbopack (por defecto en Next.js 16)
  turbopack: {
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
};

export default nextConfig;
