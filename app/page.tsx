"use client";
import { useAuth } from "@/contexts/AuthContext";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { TimeRecordCard } from "@/components/time/TimeRecordCard";
import { TimeHistoryCard } from "@/components/time/TimeHistoryCard";
import { CompanyInfoCard } from "@/components/time/CompanyInfoCard";
import { UserInfoCard } from "@/components/time/UserInfoCard";
import { useProfileData } from "@/hooks/useProfileData";
import { Card, CardContent } from "@/components/ui/card";

interface TimeRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  created_at: string;
  check_in_location: { latitude: number; longitude: number } | null;
  check_out_location: { latitude: number; longitude: number } | null;
}

export default function HomePage() {
  const { user } = useAuth();
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
  } = useProfileData(user?.id || "", user?.user_metadata || null);
  const [loading, setLoading] = useState(false);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<TimeRecord | null>(null);
  const supabase = useMemo(() => createClientComponentClient(), []);

  const loadTimeRecords = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("time_records")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      setTimeRecords(data || []);
      const active = data?.find((record) => !record.check_out);
      setCurrentRecord(active || null);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
    } finally {
      setLoading(false);
    }
  }, [user?.id, supabase]);

  const handleCheckIn = useCallback(async (location: { latitude: number; longitude: number }) => {
    if (!user?.id) {
      toast.error("กรุณาเข้าสู่ระบบก่อนลงเวลาเข้างาน");
      return;
    }
  
    try {
      setLoading(true);
      console.log("Starting check-in with location:", location);
  
      const today = new Date().toISOString().split("T")[0];
      
      // Check for existing check-in today
      const { data: existingRecords, error: existingError } = await supabase
        .from("time_records")
        .select("*")
        .eq("user_id", user.id)
        .gte("check_in", today)
        .lt("check_in", today + "T23:59:59.999Z");

      if (existingError) {
        console.error("Existing records check error:", existingError);
        throw existingError;
      }

      if (existingRecords && existingRecords.length > 0) {
        toast.error("คุณได้ลงเวลาเข้างานวันนี้ไปแล้ว");
        return;
      }

      // Prepare check-in data
      const now = new Date().toISOString();
      const checkInData = {
        user_id: user.id,
        check_in: now,
        created_at: now,
        check_out: null,
        check_in_location: `(${location.longitude},${location.latitude})`,  // Format as PostgreSQL point
        check_out_location: null
      };
  
      console.log("Inserting data:", checkInData);

      const { data, error: insertError } = await supabase
        .from("time_records")
        .insert(checkInData)
        .select('*')
        .single();
  
      if (insertError) {
        console.error("Insert error details:", insertError);
        throw insertError;
      }
  
      if (!data) {
        throw new Error("No data returned after insert");
      }

      console.log("Successfully inserted record:", data);
      setCurrentRecord(data);
      await loadTimeRecords();
      toast.success("บันทึกเวลาเข้างานเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("ไม่สามารถบันทึกเวลาเข้างานได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
}, [user?.id, supabase, loadTimeRecords]);

  const handleCheckOut = useCallback(async (location: { latitude: number; longitude: number }) => {
    if (!currentRecord) {
      toast.error("ไม่พบรายการลงเวลาที่เปิดอยู่");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting checkout with location:", location);

      const { data, error } = await supabase
        .from("time_records")
        .update({
          check_out: new Date().toISOString(),
          check_out_location: `(${location.longitude},${location.latitude})`
        })
        .eq("id", currentRecord.id)
        .select()
        .single();
  
      if (error) {
        console.error("Checkout update error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned after update");
      }

      console.log("Successfully updated record:", data);
      setCurrentRecord(null);
      await loadTimeRecords();
      toast.success("บันทึกเวลาออกงานเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error checking out:", error);
      toast.error("ไม่สามารถบันทึกเวลาออกงานได้ กรุณาลองใหม่อีกครั้ง");
      throw error; // Propagate error to component
    } finally {
      setLoading(false);
    }
  }, [currentRecord, supabase, loadTimeRecords]);

  const handleUpdateTimeRecord = useCallback(async (id: string, data: Partial<TimeRecord>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("time_records")
        .update(data)
        .eq("id", id);

      if (error) throw error;

      await loadTimeRecords();
      toast.success("อัพเดทเวลาทำงานเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error updating time record:", error);
      toast.error("ไม่สามารถอัพเดทเวลาทำงานได้");
    } finally {
      setLoading(false);
    }
  }, [supabase, loadTimeRecords]);

  useEffect(() => {
    if (!user || profileLoading) return;
    loadTimeRecords();
  }, [user, profileLoading, loadTimeRecords]);

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Please login to continue</div>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner loading-md"></span>
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="text-red-500">
            Failed to load profile. Please try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-10">Please login to continue</div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <UserInfoCard user={user} />
          <CompanyInfoCard profile={profile} />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <TimeRecordCard
                currentRecord={currentRecord}
                loading={loading}
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <TimeHistoryCard 
                timeRecords={timeRecords} 
                onUpdateRecord={handleUpdateTimeRecord}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
