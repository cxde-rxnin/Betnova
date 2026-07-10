"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck } from "lucide-react";

export default function TwoFactorPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className="animate-fade-in text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Two-Factor Authentication</h1>
      <p className="mt-2 text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          id="2fa-code"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          maxLength={6}
          className="text-center text-2xl tracking-[0.5em] font-mono"
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify Code
        </Button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        Lost access to your authenticator? <button className="text-primary hover:underline">Use recovery code</button>
      </p>
    </div>
  );
}
