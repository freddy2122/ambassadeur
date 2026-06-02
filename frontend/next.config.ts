import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /** Dossier `out/` avec HTML statique — même usage que CRA/Vite dans public_html chez Hostinger. */
  output: "export",
  images: {
    /** Obligatoire avec `output: "export"` (pas d’API d’optimisation Next en ligne). */
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "eiggroupe.com",
      },
      {
        protocol: "https",
        hostname: "www.eiggroupe.com",
      },
    ],
  },
};

export default nextConfig;
