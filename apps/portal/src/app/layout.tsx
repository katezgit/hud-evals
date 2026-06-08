import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Portal", template: "%s | Portal" },
  description: "Authed dashboard.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

// Root layout — the only place that owns <html>, <body>, ThemeProvider.
// next-themes is wired with `attribute="data-theme"` because token themes key off
// [data-theme="dark"] in packages/ui/src/styles/color.css. suppressHydrationWarning
// is required on <html> because next-themes writes the attribute on first paint.
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          {children}
          {/* TODO: re-add Toaster once @repo/ui ships a toast component. */}
        </ThemeProvider>
      </body>
    </html>
  );
}
