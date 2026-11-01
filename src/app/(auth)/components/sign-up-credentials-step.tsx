"use client";

import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emailPasswordSchema } from "@/schemas/auth";
import { AuthEmailField, AuthPasswordField } from "./auth-fields";
import { AuthProvider, SocialAuthButtons } from "./social-auth-buttons";

type Props = {
  email: string;
  password: string;
  errors: Record<string, string>;
  loading: boolean;
  provider: AuthProvider | null;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onValidate: (field: string, value: string, schema: typeof emailPasswordSchema.shape.email) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onProvider: (provider: AuthProvider) => void;
}

export function SignUpCredentialsStep({ email, password, errors, loading, provider, onEmailChange, onPasswordChange, onValidate, onSubmit, onProvider }: Props) {
  return (
    <>
      <SocialAuthButtons loading={loading} provider={provider} onProvider={onProvider} />
      <p className="text-muted-foreground before:bg-border flex items-center gap-3 text-sm before:h-px before:flex-1 after:h-px after:flex-1">or continue with email</p>
      <form className="grid gap-4" noValidate onSubmit={onSubmit}>
        <AuthEmailField id="sign-up-email" value={email} error={errors.email} onChange={(value) => { onEmailChange(value); onValidate("email", value, emailPasswordSchema.shape.email); }} />
        <AuthPasswordField id="sign-up-password" value={password} error={errors.password} autoComplete="new-password" onChange={(value) => { onPasswordChange(value); onValidate("password", value, emailPasswordSchema.shape.password); }} />
        <div id="clerk-captcha" />
        <Button disabled={loading}>
          {loading && <Loader className="animate-spin" />}
          Continue
        </Button>
      </form>
    </>
  );
}
