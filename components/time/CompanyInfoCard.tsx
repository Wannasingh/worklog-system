import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { User } from "@supabase/auth-helpers-nextjs";

interface CompanyInfoCardProps {
  user: User | null;
}

export function CompanyInfoCard({ user }: CompanyInfoCardProps) {
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
            <div className="text-sm text-muted-foreground">แผนก/ฝ่าย</div>
            <div className="font-medium">
              {user?.user_metadata?.department || "-"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">เวลาทำงานปกติ</div>
            <div className="font-medium">09:00 - 18:00 น.</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}