"use client";

import { Loader, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OtpInput } from "@/components/ui/otp-input";
import { verificationCodeSchema } from "@/schemas/auth";

type Props = {
  code: string;
  error?: string;
  loading: boolean;
  onCodeChange: (value: string) => void;
  onValidate: (field: string, value: string, schema: typeof verificationCodeSchema.shape.code) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onResend: () => void;
  onChangeEmail: () => void;
};

export function SignUpVerificationStep({ code, error, loading, onCodeChange, onValidate, onSubmit, onResend, onChangeEmail }: Props) {
  return (
    <form className="grid gap-3" noValidate onSubmit={onSubmit}>
      <Label className="flex items-center gap-1.5" htmlFor="code">Email verification code<ShieldCheck className="text-muted-foreground size-3.5" /></Label>
      <OtpInput id="code" disabled={loading} value={code} onChange={(value) => { onCodeChange(value); onValidate("code", value, verificationCodeSchema.shape.code); }} />
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button disabled={loading}>
        {loading && <Loader className="animate-spin" />}
        Verify
      </Button>
      <Button type="button" variant="link" disabled={loading} onClick={onResend}>Resend code</Button>
      <Button type="button" variant="link" disabled={loading} onClick={onChangeEmail}>Change email address</Button>
    </form>
  );
}
