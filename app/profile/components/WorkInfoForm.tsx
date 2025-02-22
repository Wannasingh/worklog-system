import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { ProfileData } from "../types";

interface WorkInfoFormProps {
  profile: ProfileData;
  onProfileUpdate: (profile: Partial<ProfileData>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
}

export function WorkInfoForm({ profile, onProfileUpdate, onSubmit, loading }: WorkInfoFormProps) {
  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="h-24 w-24 flex items-center justify-center rounded-full bg-muted">
          <Briefcase className="h-12 w-12" />
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title_prefix">คำนำหน้านาม</Label>
            <select
              id="title_prefix"
              value={profile.title_prefix}
              onChange={(e) => onProfileUpdate({ title_prefix: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">เลือกคำนำหน้านาม</option>
              <option value="นาย">นาย</option>
              <option value="นาง">นาง</option>
              <option value="นางสาว">นางสาว</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">ชื่อ</Label>
              <Input
                id="first_name"
                value={profile.first_name}
                onChange={(e) => onProfileUpdate({ first_name: e.target.value })}
                placeholder="ชื่อ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">นามสกุล</Label>
              <Input
                id="last_name"
                value={profile.last_name}
                onChange={(e) => onProfileUpdate({ last_name: e.target.value })}
                placeholder="นามสกุล"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee_id">รหัสพนักงาน</Label>
          <Input
            id="employee_id"
            value={profile.employee_id}
            onChange={(e) => onProfileUpdate({ employee_id: e.target.value })}
            placeholder="EMP001"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">ตำแหน่ง</Label>
          <Input
            id="position"
            value={profile.position}
            onChange={(e) => onProfileUpdate({ position: e.target.value })}
            placeholder="Your position"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="department">แผนก/ฝ่าย</Label>
          <Input
            id="department"
            value={profile.department}
            onChange={(e) => onProfileUpdate({ department: e.target.value })}
            placeholder="Your department"
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
        </Button>
      </form>
    </>
  );
}