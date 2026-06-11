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
import { GithubGlyph, GoogleGlyph } from "../_components/oauth-glyphs";

const COOLDOWN_SECONDS = 30;

const oauthInitial: OAuthState = { status: "idle" };
const magicLinkInitial: MagicLinkState = { status: "idle" };

export default function RegisterForm() {
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
  const headingRef = useRef<HTMLHeadingElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const sentTransitioned = useRef(false);

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

  useEffect(() => {
    if (!sentTransitioned.current) {
      sentTransitioned.current = true;
      return;
    }
    if (sent) {
      headingRef.current?.focus();
    } else {
      emailInputRef.current?.focus();
    }
  }, [sent]);

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

  const magicError =
    magicState.status === "error" ? magicState.message : undefined;

  if (sent) {
    let resendLabel = "Resend link";
    if (cooldown > 0) resendLabel = `Resend in ${cooldown}s`;
    else if (magicPending) resendLabel = "Resending…";

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <Mail aria-hidden="true" className="h-6 w-6 text-foreground" />
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-subtitle font-semibold text-foreground"
          >
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
            aria-busy={magicPending}
          >
            <span aria-live="polite">{resendLabel}</span>
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
            aria-busy={githubPending}
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
            aria-busy={googlePending}
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
        <span aria-hidden="true" className="text-caption text-muted-foreground">
          or
        </span>
        <Separator className="flex-1" />
      </div>

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
        <FormField id="email" label="Email address" required error={magicError}>
          <Input
            ref={emailInputRef}
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
          aria-busy={magicPending}
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
