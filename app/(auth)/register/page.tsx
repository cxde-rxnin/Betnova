"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to create account");
      } else {
        toast.success("Account created successfully");
        router.push("/login");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
      <p className="mt-1 text-sm text-muted-foreground">Start your betting journey today.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="reg-name" className="mb-1.5">Full Name</Label>
          <Input id="reg-name" name="name" placeholder="Alex Johnson" required />
        </div>
        <div>
          <Label htmlFor="reg-username" className="mb-1.5">Username</Label>
          <Input id="reg-username" name="username" placeholder="alexj" required />
        </div>
        <div>
          <Label htmlFor="reg-email" className="mb-1.5">Email</Label>
          <Input id="reg-email" name="email" type="email" placeholder="you@example.com" required />
        </div>
        <div>
          <Label htmlFor="reg-password" className="mb-1.5">Password</Label>
          <PasswordInput id="reg-password" name="password" placeholder="••••••••" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
