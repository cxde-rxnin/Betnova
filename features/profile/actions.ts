"use server";

import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db/connect";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function submitKycDocument(formData: FormData) {
  const userId = await getUserId();
  
  const document = formData.get("document") as File | null;
  if (!document) throw new Error("Document is required");

  // Upload to Cloudinary using streams
  let documentUrl = "";
  try {
    const arrayBuffer = await document.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    documentUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "betnovo/kyc" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw new Error("Failed to upload KYC document.");
  }

  await connectToDatabase();
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.kycDocumentUrl = documentUrl;
  user.kycStatus = "PENDING";
  await user.save();

  revalidatePath("/profile/kyc");
  return { success: true };
}
