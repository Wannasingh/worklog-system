import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string;
  onAvatarUpdate: (url: string) => void;
}

export function AvatarUpload({ userId, avatarUrl, onAvatarUpdate }: AvatarUploadProps) {
  const supabase = createClientComponentClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // List all existing files for this user
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list();

      // Find and delete any existing avatar files for this user
      const userFiles = existingFiles?.filter(file => file.name.includes(userId));
      if (userFiles && userFiles.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove(userFiles.map(file => file.name));
      }

      // Create a fixed filename format for each user
      const fileName = `avatar_${userId}.jpg`;

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { 
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      onAvatarUpdate(publicUrl);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mb-6 space-y-2">
      <Avatar
        className="h-24 w-24 cursor-pointer relative group"
        onClick={() => fileInputRef.current?.click()}
      >
        <AvatarImage src={avatarUrl} />
        <AvatarFallback>
          <User className="h-12 w-12" />
        </AvatarFallback>
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Upload className="h-6 w-6 text-white" />
        </div>
      </Avatar>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
      {uploading && (
        <p className="text-sm text-muted-foreground">กำลังอัพโหลด...</p>
      )}
    </div>
  );
}