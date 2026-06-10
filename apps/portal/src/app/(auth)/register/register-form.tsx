"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { LoaderCircle, Mail, OctagonAlert } from "lucide-react";
import { Alert, AlertDescription } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { FormField } from "@repo/ui/components/form-field";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import {
  signInWithGithub,
  signInWithGoogle,
  sendMagicLinkSignup,
  type MagicLinkState,
  type OAuthState,
} from "@/lib/auth/actions";

const COOLDOWN_SECONDS = 30;

const oauthInitial: OAuthState = { status: "idle" };
const magicLinkInitial: MagicLinkState = { status: "idle" };

function GithubGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="currentColor"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.11.78-.25.78-.55v-1.94c-3.2.7-3.87-1.54-3.87-1.54-.52-1.34-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.59.23 2.77.11 3.06.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.13v3.16c0 .31.21.67.79.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 18 18"
      className="h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.8741 2.6836-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.4673-.806 5.9564-2.1805l-2.9087-2.2581c-.806.54-1.8368.8595-3.0477.8595-2.344 0-4.3282-1.5832-5.0359-3.7104H.9573v2.3318C2.4382 15.9831 5.4818 18 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.9641 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1731 0 7.5477 0 9s.3477 2.8268.9573 4.0418l3.0068-2.3318z"
      />
      <path
        fill="#EA4335"
        d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5814-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582l3.0068 2.3318C4.6718 5.1627 6.656 3.5795 9 3.5795z"
      />
    </svg>
  );
}

export function RegisterForm() {
  const [githubState, githubAction, githubPending] = useActionState(
    signInWithGithub,
    oauthInitial,
  );
  const [googleState, googleAction, googlePending] = useActionState(
    signInWithGoogle,
    oauthInitial,
  );
  const [magicState, magicAction, magicPending] = useActionState(
    sendMagicLinkSignup,
    magicLinkInitial,
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [sentName, setSentName] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const wasPending = useRef(false);

  useEffect(() => {
    const justFinished = wasPending.current && !magicPending;
    wasPending.current = magicPending;
    if (magicState.status !== "success") return;
    if (!sent) {
      setSent(true);
      setSentEmail(magicState.email);
      setSentName(name);
      setCooldown(COOLDOWN_SECONDS);
    } else if (justFinished) {
      setCooldown(COOLDOWN_SECONDS);
    }
  }, [magicState, magicPending, sent, name]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => {
      setCooldown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  function handleDifferentEmail() {
    setSent(false);
    setSentEmail("");
    setSentName("");
    setName("");
    setEmail("");
    setCooldown(0);
  }

  let oauthError: string | null = null;
  if (githubState.status === "error") oauthError = githubState.message;
  else if (googleState.status === "error") oauthError = googleState.message;

  if (sent) {
    let resendLabel = "Resend link";
    if (cooldown > 0) resendLabel = `Resend in ${cooldown}s`;
    else if (magicPending) resendLabel = "Resending…";

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Mail aria-hidden="true" className="h-6 w-6 text-foreground" />
          <h2 className="text-subtitle font-semibold text-foreground">
            Check your email to finish signing up
          </h2>
          <p className="text-caption text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="text-foreground font-medium">{sentEmail}</span>.
            Open it on this device to create your account.
          </p>
        </div>

        <form action={magicAction} className="flex flex-col gap-2">
          <input type="hidden" name="name" value={sentName} />
          <input type="hidden" name="email" value={sentEmail} />
          <Button
            type="submit"
            variant="ghost"
            className="w-full"
            disabled={cooldown > 0 || magicPending}
          >
            {resendLabel}
          </Button>
          <Button
            type="button"
            variant="link"
            className="w-full"
            onClick={handleDifferentEmail}
          >
            Use a different email
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {oauthError && (
        <Alert variant="destructive">
          <OctagonAlert aria-hidden="true" />
          <AlertDescription>{oauthError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-2">
        <form action={githubAction}>
          <Button
            type="submit"
            variant="secondary"
            className="w-full gap-2"
            disabled={githubPending || googlePending}
          >
            {githubPending ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 shrink-0 animate-spin"
              />
            ) : (
              <GithubGlyph />
            )}
            <span>GitHub</span>
          </Button>
        </form>
        <form action={googleAction}>
          <Button
            type="submit"
            variant="secondary"
            className="w-full gap-2"
            disabled={githubPending || googlePending}
          >
            {googlePending ? (
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 shrink-0 animate-spin"
              />
            ) : (
              <GoogleGlyph />
            )}
            <span>Google</span>
          </Button>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-caption text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>

      {magicState.status === "error" && (
        <Alert variant="destructive">
          <OctagonAlert aria-hidden="true" />
          <AlertDescription>{magicState.message}</AlertDescription>
        </Alert>
      )}

      <form action={magicAction} className="flex flex-col gap-3">
        <FormField id="name" label="Name" required>
          <Input
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </FormField>
        <FormField id="email" label="Email address" required>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={magicPending}
        >
          {magicPending ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 shrink-0 animate-spin"
              />
              <span>Sending link…</span>
            </span>
          ) : (
            "Send magic link"
          )}
        </Button>
        <p className="text-caption text-muted-foreground text-center">
          By continuing, you accept HUD&apos;s Terms of Service, Privacy Policy,
          and Acceptable Use Policy.
        </p>
      </form>
    </div>
  );
}
