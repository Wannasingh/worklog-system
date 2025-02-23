"use client";
import { useAuth } from "@/contexts/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TimeRecordCard } from "@/components/time/TimeRecordCard";
import { TimeHistoryCard } from "@/components/time/TimeHistoryCard";
import { CompanyInfoCard } from "@/components/time/CompanyInfoCard";
import { UserInfoCard } from "@/components/time/UserInfoCard";


interface TimeRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  created_at: string;
}

// Add company location configuration
const COMPANY_LOCATION = {
  latitude: 13.7563, // Replace with your company's actual latitude
  longitude: 100.5018, // Replace with your company's actual longitude
  radius: 100, // Radius in meters
};

export default function HomePage() {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(false);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<TimeRecord | null>(null);

  const loadTimeRecords = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("time_records")
        .select("*")
        .eq("user_id", user.id)
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

  useEffect(() => {
    loadTimeRecords();
  }, [user, supabase]); // Add dependencies

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { data, error } = await supabase
        .from("time_records")
        .insert([
          {
            user_id: user?.id,
            check_in: new Date().toISOString(),
            check_in_location: `(${position.coords.latitude},${position.coords.longitude})`,
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
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { error } = await supabase
        .from("time_records")
        .update({
          check_out: new Date().toISOString(),
          check_out_location: `(${position.coords.latitude},${position.coords.longitude})`,
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
      <div className="grid gap-6">
        <UserInfoCard user={user} />
        <CompanyInfoCard user={user} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <TimeRecordCard
            currentRecord={currentRecord}
            loading={loading}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            companyLocation={COMPANY_LOCATION}
          />
          <TimeHistoryCard timeRecords={timeRecords} />
        </div>
      </div>
    </div>
  );
}