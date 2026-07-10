"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function KycGuard({ kycStatus }: { kycStatus: string }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If not verified, and not already on the KYC page or general profile page, redirect them.
    // We allow /profile so they can still see their details and the KYC tab.
    if (kycStatus !== "VERIFIED" && !pathname.startsWith("/profile")) {
      router.push("/profile/kyc");
    }
  }, [kycStatus, pathname, router]);

  return null;
}
