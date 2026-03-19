"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PhotoUpload } from "@/components/shared/photo-upload";
import { uploadProgressPhoto } from "@/actions/progress";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/hooks/use-supabase";

interface ProgressPhoto {
  id: string;
  storage_path: string;
  date: string;
  category: string;
}

interface ProgressPhotosSectionProps {
  photos: ProgressPhoto[];
  userId: string;
}

export function ProgressPhotosSection({
  photos,
  userId,
}: ProgressPhotosSectionProps) {
  const router = useRouter();
  const supabase = useSupabase();

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "front");

    const result = await uploadProgressPhoto(formData);
    if (result?.success) {
      toast.success("Photo uploaded!");
      router.refresh();
    } else {
      toast.error(result?.error || "Failed to upload");
    }
  }

  function getPhotoUrl(path: string) {
    const { data } = supabase.storage
      .from("user-uploads")
      .getPublicUrl(path);
    return data.publicUrl;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Camera className="h-5 w-5" />
        Progress Photos
      </h2>

      <PhotoUpload onUpload={handleUpload} label="Add Progress Photo" />

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="aspect-square bg-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPhotoUrl(photo.storage_path)}
                  alt={`Progress ${photo.category}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(photo.date).toLocaleDateString()}
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {photo.category}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-8">
            <Camera className="h-8 w-8 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">
              No progress photos yet
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
