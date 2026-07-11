"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, UploadCloud } from "lucide-react";
import { submitKycDocument } from "../actions";
import { toast } from "sonner";

export function KycUploadForm() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 5MB.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("document", file);

    try {
      await submitKycDocument(formData);
      toast.success("Document submitted successfully");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Government Issued ID (Passport, Driver's License)</Label>
        <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
          <Input 
            type="file" 
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm font-medium">
              {file ? file.name : "Click to upload or drag and drop"}
            </div>
            <div className="text-xs text-muted-foreground">
              JPEG, PNG up to 5MB
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !file}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit for Verification
      </Button>
    </form>
  );
}
