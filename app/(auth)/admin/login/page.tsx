"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Invalid admin credentials");
      } else {
        toast.success("Admin authenticated");
        
        const searchParams = new URLSearchParams(window.location.search);
        const callbackUrl = searchParams.get("callbackUrl") || "/admin";
        
        window.location.href = callbackUrl;
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">Enter your authorized credentials to access operations.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="login-email" className="mb-1.5">Admin Email</Label>
          <Input id="login-email" name="email" type="email" placeholder="admin@betnova.com" required />
        </div>
        <div>
          <Label htmlFor="login-password" className="mb-1.5">Master Password</Label>
          <PasswordInput id="login-password" name="password" placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Authenticate
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium hover:underline text-muted-foreground transition-colors">&larr; Back to standard login</Link>
      </p>
    </div>
  );
}
