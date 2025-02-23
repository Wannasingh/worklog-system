"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Upload } from "lucide-react";
import { useRef } from "react";
import { Profile } from "@/hooks/useProfileData";

interface PersonalInfoTabProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  avatarLoading: boolean;
  avatarError: boolean;
  setAvatarError: (error: boolean) => void;
  loading: boolean;
  userEmail?: string; // Add this prop
}

export function PersonalInfoTab({
  profile,
  setProfile,
  handleSubmit,
  handleImageUpload,
  uploading,
  avatarLoading,
  avatarError,
  setAvatarError,
  loading,
  userEmail, // Add this prop
}: PersonalInfoTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <div className="flex flex-col items-center mb-6 space-y-2">
        <Avatar
          className="h-24 w-24 cursor-pointer relative group"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading || avatarLoading ? (
            <Skeleton className="h-24 w-24 rounded-md" />
          ) : avatarError || !profile.avatar_url ? (
            <AvatarFallback>
              <User className="h-12 w-12" />
            </AvatarFallback>
          ) : (
            <>
              <AvatarImage
                src={profile.avatar_url}
                onError={() => setAvatarError(true)}
                alt={profile.username || "Profile avatar"}
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
            </>
          )}
        </Avatar>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          aria-label="Upload profile picture"
        />
        {uploading && (
          <p className="text-sm text-muted-foreground">กำลังอัพโหลด...</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={profile.username || ""}
            onChange={(e) =>
              setProfile({ ...profile, username: e.target.value })
            }
            placeholder="Your username"
            required
            minLength={3}
            maxLength={50}
            aria-required="true"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={userEmail || ""}
            placeholder="Your email"
            disabled
            className="bg-muted"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full"
          aria-busy={loading}
        >
          {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </Button>
      </form>
    </>
  );
}
