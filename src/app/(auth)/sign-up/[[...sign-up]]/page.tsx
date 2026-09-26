"use client";

import { useClerk, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import KanbanLogo from "@/components/layout/header/kanban-logo";
import { emailPasswordSchema, getFieldErrors, getValidationMessage, verificationCodeSchema } from "@/schemas/auth";
import { AuthProvider } from "../../components/social-auth-buttons";
import { SignUpCredentialsStep } from "../../components/sign-up-credentials-step";
import { SignUpVerificationStep } from "../../components/sign-up-verification-step";

export default function SignUpPage() {
  const clerk = useClerk();
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [provider, setProvider] = useState<AuthProvider | null>(null);
  const loading = fetchStatus === "fetching";
  const message =
    formError ??
    (step === "email"
      ? errors.fields.emailAddress?.message ?? errors.fields.password?.message
      : errors.fields.code?.message) ??
    errors.global?.[0]?.message;
  const navigate = ({
    decorateUrl,
  }: {
    decorateUrl: (url: string) => string;
  }) => router.push(decorateUrl("/welcome"));
  function validateField(field: string, value: string, schema: typeof emailPasswordSchema.shape.email) {
    const message = getValidationMessage(schema, value);
    setFieldErrors((current) => message ? { ...current, [field]: message } : Object.fromEntries(Object.entries(current).filter(([key]) => key !== field)));
  }

  async function startEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const validated = emailPasswordSchema.safeParse({ email, password });
    if (!validated.success) {
      setFieldErrors(getFieldErrors(validated.error));
      return;
    }
    setFieldErrors({});
    if ((await signUp.create({ emailAddress: validated.data.email, password: validated.data.password })).error) return;
    if (!(await signUp.verifications.sendEmailCode()).error) setStep("code");
  }
  async function verifyCode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validated = verificationCodeSchema.safeParse({ code });
    if (!validated.success) {
      setFieldErrors(getFieldErrors(validated.error));
      return;
    }
    setFieldErrors({});
    if (
      (await signUp.verifications.verifyEmailCode(validated.data)).error ||
      signUp.status !== "complete"
    )
      return;
    await signUp.finalize({ navigate });
  }
  async function startSso(strategy: AuthProvider) {
    if (loading || provider !== null) return;
    setFormError(null);
    setProvider(strategy);
    const oauthProvider = strategy === "oauth_github" ? "github" : "google";
    try {
      clerk.closeGoogleOneTap();
      const { error } = await signUp.sso({
        strategy,
        redirectUrl: "/welcome",
        redirectCallbackUrl: `/sso-callback?provider=${oauthProvider}`,
      });
      if (error) setProvider(null);
    } catch (error) {
      console.error("Unable to start sign-up with OAuth provider", error);
      setFormError("We couldn't start sign-up with that provider. Please try again.");
      setProvider(null);
    }
  }

  return (
    <Card className="mx-auto w-full border-0 bg-transparent shadow-none sm:w-96 md:w-[420px]">
      <CardHeader className="gap-3 px-6 pt-7 text-center sm:px-8">
        <CardTitle className="mx-auto">
          <KanbanLogo glow="auth" />
        </CardTitle>
        <CardDescription className="mx-auto max-w-sm leading-6">
          {step === "email"
            ? "Create your account and start making progress."
            : `Enter the verification code sent to ${email}.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 px-6 sm:px-8">
        {message && (
          <p role="alert" className="text-destructive text-sm">
            {message}
          </p>
        )}
        {step === "email" ? (
          <>
            <SignUpCredentialsStep email={email} password={password} errors={fieldErrors} loading={loading} provider={provider} onEmailChange={setEmail} onPasswordChange={setPassword} onValidate={validateField} onSubmit={startEmail} onProvider={(value) => void startSso(value)} />
          </>
        ) : (
          <SignUpVerificationStep code={code} error={fieldErrors.code} loading={loading} onCodeChange={setCode} onValidate={validateField} onSubmit={verifyCode} onResend={() => void signUp.verifications.sendEmailCode()} onChangeEmail={() => setStep("email")} />
        )}
      </CardContent>
      <CardFooter className="text-muted-foreground justify-center pt-1 text-sm">
        Already have an account?
        <Button
        className="ps-1"
          variant="link"
          size="sm"
          onClick={() => router.push("/sign-in")}
        >
          Sign in
        </Button>
      </CardFooter>
    </Card>
  );
}
