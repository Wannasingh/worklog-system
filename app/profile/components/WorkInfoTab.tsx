"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase } from "lucide-react";
import { Profile } from "@/hooks/useProfileData";

interface WorkInfoTabProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
}

export function WorkInfoTab({
  profile,
  setProfile,
  handleSubmit,
  loading,
}: WorkInfoTabProps) {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setProfile({ ...profile, [id]: value });
  };

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="h-24 w-24 flex items-center justify-center rounded-full bg-muted">
          <Briefcase className="h-12 w-12" />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="title_prefix">คำนำหน้านาม</Label>
            <select
              id="title_prefix"
              value={profile.title_prefix || ""}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
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
                value={profile.first_name || ""}
                onChange={handleInputChange}
                placeholder="ชื่อ"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">นามสกุล</Label>
              <Input
                id="last_name"
                value={profile.last_name || ""}
                onChange={handleInputChange}
                placeholder="นามสกุล"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="employee_id">รหัสพนักงาน</Label>
          <Input
            id="employee_id"
            value={profile.employee_id || ""}
            onChange={handleInputChange}
            placeholder="EMP001"
            required
            pattern="[A-Za-z0-9\-]+"
            title="รหัสพนักงานต้องเป็นตัวอักษรภาษาอังกฤษหรือตัวเลขเท่านั้น"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">ตำแหน่ง</Label>
          <Input
            id="position"
            value={profile.position || ""}
            onChange={handleInputChange}
            placeholder="ตำแหน่งงาน"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">แผนก/ฝ่าย</Label>
          <Input
            id="department"
            value={profile.department || ""}
            onChange={handleInputChange}
            placeholder="แผนก/ฝ่าย"
            required
          />
        </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="work_start_time">เวลาเข้างาน</Label>
          <Input
            id="work_start_time"
            type="time"
            value={profile.work_start_time || "09:00"}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="work_end_time">เวลาเลิกงาน</Label>
          <Input
            id="work_end_time"
            type="time"
            value={profile.work_end_time || "18:00"}
            onChange={handleInputChange}
            required
          />
        </div>
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
