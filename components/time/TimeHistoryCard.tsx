import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { TimeRecord } from "@/types/time";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TimeEditForm } from "./TimeEditForm";

interface TimeHistoryCardProps {
  timeRecords: TimeRecord[];
  onUpdateRecord: (id: string, data: Partial<TimeRecord>) => Promise<void>;
}

export function TimeHistoryCard({ timeRecords, onUpdateRecord }: TimeHistoryCardProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle>ประวัติการลงเวลาล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeRecords.length === 0 ? (
            <div className="text-center text-muted-foreground">
              ไม่มีประวัติการลงเวลา
            </div>
          ) : (
            timeRecords.map((record) => (
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
                <div className="flex items-center gap-2">
                  {!record.check_out && (
                    <div className="text-sm text-green-600 font-medium">
                      กำลังทำงาน
                    </div>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>แก้ไขเวลาทำงาน</DialogTitle>
                        <DialogDescription>
                          แก้ไขเวลาเข้า-ออกงานสำหรับวันที่ {format(new Date(record.created_at), "d MMMM yyyy", { locale: th })}
                        </DialogDescription>
                      </DialogHeader>
                      <TimeEditForm
                        record={record}
                        onSubmit={(data) => onUpdateRecord(record.id, data)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}