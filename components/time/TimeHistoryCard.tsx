import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { TimeRecord } from "@/types/time";

interface TimeHistoryCardProps {
  timeRecords: TimeRecord[];
}

export function TimeHistoryCard({ timeRecords }: TimeHistoryCardProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>ประวัติการลงเวลาล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeRecords.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
                <div className="font-medium">
                  {format(new Date(record.created_at), "EEEE d MMMM yyyy", {
                    locale: th,
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  เข้างาน: {format(new Date(record.check_in), "HH:mm น.")}
                  {record.check_out &&
                    ` - ออกงาน: ${format(
                      new Date(record.check_out),
                      "HH:mm น."
                    )}`}
                </div>
              </div>
              {!record.check_out && (
                <div className="text-sm text-green-600 font-medium">
                  กำลังทำงาน
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}