import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProfileData } from "../types";

interface PersonalInfoFormProps {
  profile: ProfileData;
  onProfileUpdate: (profile: Partial<ProfileData>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

export function PersonalInfoForm({ profile, onProfileUpdate, onSubmit, loading }: PersonalInfoFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">ชื่อ-นามสกุล</Label>
        <Input
          id="full_name"
          value={profile.full_name}
          onChange={(e) => onProfileUpdate({ full_name: e.target.value })}
          placeholder="Your full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="avatar_url">URL รูปโปรไฟล์</Label>
        <Input
          id="avatar_url"
          value={profile.avatar_url}
          onChange={(e) => onProfileUpdate({ avatar_url: e.target.value })}
          placeholder="https://example.com/avatar.jpg"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
      </Button>
    </form>
  );
}