import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Profile } from "@/hooks/useProfileData";

interface CompanyInfoCardProps {
  profile: Profile;
}

export function CompanyInfoCard({ profile }: CompanyInfoCardProps) {
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          ข้อมูลบริษัท
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">ชื่อบริษัท</div>
            <div className="font-medium">
              {profile.company_name || "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">แผนก/ฝ่าย</div>
            <div className="font-medium">
              {profile.department || "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">เวลาทำงานปกติ</div>
            <div className="font-medium">
              {profile.work_start_time && profile.work_end_time
                ? `${formatTime(profile.work_start_time)} - ${formatTime(profile.work_end_time)} น.`
                : "08:00 - 17:00 น."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}