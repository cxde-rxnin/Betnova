import { auth } from "@/lib/auth";
import { requestWithdrawalOTP } from "@/features/wallet/actions";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, currency } = await req.json();
    
    if (!amount || !currency) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await requestWithdrawalOTP(amount, currency);
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
