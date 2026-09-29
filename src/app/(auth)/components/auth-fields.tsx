"use client";

import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FieldProps = {
  id: string;
  value: string;
  error?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

export function AuthEmailField({ id, value, error, autoComplete = "email", onChange }: FieldProps) {
  return (
    <div className="grid gap-2">
      <Label className="flex items-center gap-1.5" htmlFor={id}>
        <Mail className="text-muted-foreground size-3.5" />Email address
      </Label>
      <Input className="border-border bg-background/80 focus-visible:border-primary/60 focus-visible:ring-primary/30 h-10 shadow-xs dark:bg-input/50" id={id} type="email" autoComplete={autoComplete} placeholder="name@example.com" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} value={value} onChange={(event) => onChange(event.target.value)} />
      {error && <p id={`${id}-error`} className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

export function AuthPasswordField({ id, value, error, autoComplete = "current-password", forgotPassword, onChange }: FieldProps & { forgotPassword?: () => void }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <Label className="flex items-center gap-1.5" htmlFor={id}>
          <LockKeyhole className="text-muted-foreground size-3.5" />Password
        </Label>
        {forgotPassword && <Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={forgotPassword}>Forgot password?</Button>}
      </div>
      <div className="relative">
        <Input className="border-border bg-background/80 focus-visible:border-primary/60 focus-visible:ring-primary/30 h-10 pr-10 shadow-xs dark:bg-input/50" id={id} type={visible ? "text" : "password"} autoComplete={autoComplete} placeholder="••••••••" aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} value={value} onChange={(event) => onChange(event.target.value)} />
        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary absolute top-1/2 right-0 size-10 -translate-y-1/2" aria-label={visible ? "Hide password" : "Show password"} onClick={() => setVisible((current) => !current)}>{visible ? <EyeOff /> : <Eye />}</Button>
      </div>
      {error && <p id={`${id}-error`} className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
