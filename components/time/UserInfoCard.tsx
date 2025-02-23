import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { User as SupabaseUser } from "@supabase/auth-helpers-nextjs";

interface UserInfoCardProps {
  user: SupabaseUser | null;
}

export function UserInfoCard({ user }: UserInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          ข้อมูลพนักงาน
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground">ชื่อ-นามสกุล</div>
            <div className="font-medium">
              {user?.user_metadata?.title_prefix} {user?.user_metadata?.first_name}{" "}
              {user?.user_metadata?.last_name}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">รหัสพนักงาน</div>
            <div className="font-medium">
              {user?.user_metadata?.employee_id || "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">ตำแหน่ง</div>
            <div className="font-medium">
              {user?.user_metadata?.position || "-"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}