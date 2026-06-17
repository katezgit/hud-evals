import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "HUD", template: "%s | HUD" },
  description: "Authed dashboard.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

// Root layout — the only place that owns <html>, <body>. suppressHydrationWarning
// is required on <html> because next-themes (inside <Providers>) writes the
// data-theme attribute on first paint.
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
