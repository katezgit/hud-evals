import type { Metadata } from "next";
import Link from "next/link";
import { BrandMark } from "@repo/ui/components/brand-mark";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@repo/ui/components/card";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <Card variant="elevated">
      <CardHeader className="flex flex-col items-center gap-3 pt-6 pb-4">
        <BrandMark size="sm" />
        <h1 className="text-subtitle font-semibold text-foreground">
          Create your HUD account
        </h1>
      </CardHeader>

      <CardContent className="p-6">
        <RegisterForm />
      </CardContent>

      <CardFooter className="justify-center text-caption text-muted-foreground">
        <span>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </span>
      </CardFooter>
    </Card>
  );
}
