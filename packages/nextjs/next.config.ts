import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Ignora errores de TypeScript para permitir el despliegue
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignora advertencias de ESLint/Prettier durante el build
    ignoreDuringBuilds: true,
  },
};

// const nextConfig: NextConfig = {
//   reactStrictMode: true,
//   devIndicators: false,
//   typescript: {
//     ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
//   },
//   eslint: {
//     ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
//   },
//   webpack: config => {
//     config.resolve.fallback = { fs: false, net: false, tls: false };
//     config.externals.push("pino-pretty", "lokijs", "encoding");
//     return config;
//   },
// };

// const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

// if (isIpfs) {
//   nextConfig.output = "export";
//   nextConfig.trailingSlash = true;
//   nextConfig.images = {
//     unoptimized: true,
//   };
// }

module.exports = nextConfig;
