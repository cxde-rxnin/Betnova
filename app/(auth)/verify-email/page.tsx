"use client";

import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);

  return (
    <div className="animate-fade-in text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Mail className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ve sent a verification link to <strong>alex@example.com</strong>. Check your inbox and click the link to continue.
      </p>
      <div className="mt-6 space-y-3">
        {resent ? (
          <div className="inline-flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Email resent successfully
          </div>
        ) : (
          <Button variant="outline" onClick={() => setResent(true)}>
            Resend verification email
          </Button>
        )}
      </div>
    </div>
  );
}
