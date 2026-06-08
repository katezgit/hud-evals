interface AuthLayoutProps {
  children: React.ReactNode;
}

// (auth) group — public, no session gate. Centered card chrome.
// Middleware already redirects authed users hitting /login or /register to /.
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-surface border border-border bg-panel p-8 shadow-card">
        {children}
      </div>
    </div>
  );
}
