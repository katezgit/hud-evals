import path from "node:path";
import type { NextConfig } from "next";

// turbopack.root pins workspace inference to this monorepo. Without it Next 16
// walks up the FS looking for a lockfile and may pick a stray ~/yarn.lock,
// emitting a warning during build.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/libs"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
