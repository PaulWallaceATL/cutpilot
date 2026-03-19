"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  className?: string;
  label?: string;
}

export function PhotoUpload({
  onUpload,
  accept = "image/*",
  className,
  label = "Upload Photo",
}: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onUpload(file);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        {preview ? (
          <div className="space-y-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-full rounded-lg object-cover max-h-64"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={handleUpload} disabled={uploading} className="w-full">
              {uploading ? "Uploading..." : "Confirm Upload"}
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary/50 hover:bg-muted/50"
          >
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                Click to select a photo
              </p>
            </div>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
