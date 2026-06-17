import path from "node:path";
import type { NextConfig } from "next";

// turbopack.root pins workspace inference to this monorepo. Without it Next 16
// walks up the FS looking for a lockfile and may pick a stray ~/yarn.lock,
// emitting a warning during build.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  transpilePackages: ["@repo/ui", "@repo/libs"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  experimental: {
    // Wraps client-side route changes in document.startViewTransition() so the
    // app↔manage sidebar swap can choreograph via ::view-transition-* CSS.
    // Choreography lives in app/globals.css; direction is tagged on <html>
    // by RouteDirectionTagger in the root layout.
    viewTransition: true,
  },
};

export default nextConfig;
