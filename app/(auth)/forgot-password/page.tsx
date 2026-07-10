"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Email, 2: Code, 3: New Pass, 4: Success
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Verification code sent to your email");
        setStep(2);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send code");
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    // Transition to step 3 without an extra API call.
    // The final /api/auth/reset-password call will validate the code.
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      if (res.ok) {
        setStep(4);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to reset password. Invalid code?");
        if (data.error === "Invalid reset code" || data.error === "Reset code has expired") {
          setStep(2); // Kick back to code entry
        }
      }
    } catch (e) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (step === 4) {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Password reset</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your password has been successfully updated.</p>
        <Button className="mt-6 w-full" render={<Link href="/login" />}>Sign in</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">
        {step === 1 && "Forgot password"}
        {step === 2 && "Enter verification code"}
        {step === 3 && "Set new password"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {step === 1 && "Enter your email and we'll send you a code."}
        {step === 2 && `We sent a 6-digit code to ${email}.`}
        {step === 3 && "Please enter your new strong password."}
      </p>

      {step === 1 && (
        <form onSubmit={handleRequestCode} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="fp-email" className="mb-1.5">Email</Label>
            <Input 
              id="fp-email" 
              type="email" 
              placeholder="you@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Code"}
          </Button>
          <div className="text-center mt-4">
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
            </Link>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="fp-code" className="mb-1.5">6-Digit Code</Label>
            <Input 
              id="fp-code" 
              type="text" 
              placeholder="123456" 
              maxLength={6}
              required 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center text-lg tracking-[0.25em]"
            />
          </div>
          <Button type="submit" className="w-full">
            Verify Code <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <div className="text-center mt-4">
            <button type="button" onClick={() => setStep(1)} className="text-sm font-medium text-muted-foreground hover:text-primary">
              Change email address
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
          <div>
            <Label htmlFor="np-pass" className="mb-1.5">New Password</Label>
            <PasswordInput id="np-pass" name="newPassword" placeholder="••••••••" required minLength={6} />
          </div>
          <div>
            <Label htmlFor="np-confirm" className="mb-1.5">Confirm Password</Label>
            <PasswordInput id="np-confirm" name="confirmPassword" placeholder="••••••••" required minLength={6} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      )}
    </div>
  );
}
