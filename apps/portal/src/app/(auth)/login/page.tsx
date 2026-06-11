import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@repo/ui/components/brand-mark";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@repo/ui/components/card";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <Card variant="elevated">
      <CardHeader className="flex flex-col items-center gap-3 pt-6 pb-4">
        <BrandMark size="sm" />
        <h1 className="text-subtitle font-semibold text-foreground">
          Sign in to HUD
        </h1>
      </CardHeader>

      <CardContent className="p-6">
        <LoginForm />
      </CardContent>

      <CardFooter className="justify-center text-caption text-muted-foreground">
        <span>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign up
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
