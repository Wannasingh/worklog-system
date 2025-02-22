"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Clock, LogIn, LogOut } from "lucide-react";

interface TimeRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  created_at: string;
}

export default function HomePage() { 
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<TimeRecord | null>(null);

  useEffect(() => {
    if (user) {
      loadTimeRecords();
    }
  }, [user]);

  const loadTimeRecords = async () => {
    try {
      const { data, error } = await supabase
        .from("time_records")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setTimeRecords(data || []);
      
      // Find current active record (no check_out time)
      const active = data?.find(record => !record.check_out);
      setCurrentRecord(active || null);

    } catch (error) {
      console.error("Error loading time records:", error);
      toast.error("ไม่สามารถโหลดข้อมูลการลงเวลาได้");
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("time_records")
        .insert([
          {
            user_id: user?.id,
            check_in: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCurrentRecord(data);
      await loadTimeRecords();
      toast.success("บันทึกเวลาเข้างานเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error checking in:", error);
      toast.error("ไม่สามารถบันทึกเวลาเข้างานได้");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!currentRecord) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("time_records")
        .update({
          check_out: new Date().toISOString(),
        })
        .eq("id", currentRecord.id);

      if (error) throw error;

      setCurrentRecord(null);
      await loadTimeRecords();
      toast.success("บันทึกเวลาออกงานเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error("ไม่สามารถบันทึกเวลาออกงานได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              การลงเวลาวันนี้
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentRecord ? (
                <>
                  <div className="text-sm text-muted-foreground">
                    เข้างานเมื่อ:{" "}
                    {format(new Date(currentRecord.check_in), "HH:mm น.", {
                      locale: th,
                    })}
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCheckOut}
                    disabled={loading}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {loading ? "กำลังบันทึก..." : "ลงเวลาออกงาน"}
                  </Button>
                </>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleCheckIn}
                  disabled={loading}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {loading ? "กำลังบันทึก..." : "ลงเวลาเข้างาน"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
}