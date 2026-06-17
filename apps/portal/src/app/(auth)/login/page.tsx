import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@repo/ui/components/brand-mark";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-[420px] rounded-lg bg-card p-6 lg:border lg:border-border lg:p-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <BrandMark size="sm" />
          <h1 className="text-subtitle font-semibold text-foreground">
            Sign in to HUD
          </h1>
        </div>
        <LoginForm />
        <p className="text-center text-caption text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
