import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

interface ProfileData {
  avatar_url: string | null;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  position: string | null;
  department: string | null;
  employee_id: string | null;
  title_prefix: string | null;
  work_location: string | null;
  work_latitude: number | null;
  work_longitude: number | null;
  work_radius: number | null;
  company_name: string | null;
  work_start_time: string | null;
  work_end_time: string | null;
}

export interface Profile {
  id: string;
  username?: string;
  title_prefix?: string;
  first_name?: string;
  last_name?: string;
  employee_id?: string;
  position?: string;
  department?: string;
  work_location?: string;
  work_latitude?: number;
  work_longitude?: number;
  work_radius?: number;
  avatar_url?: string;
  updated_at?: string;
  email?: string;
  company_name?: string;
  work_start_time?: string;
  work_end_time?: string;
}

interface UserMetadata {
  username?: string;
  avatar_url?: string;
  position?: string;
  department?: string;
  employee_id?: string;
  title_prefix?: string;
  first_name?: string;
  last_name?: string;
}

export function useProfileData(
  userId: string | undefined,
  userMetadata: UserMetadata | null
) {
  const supabase = createClientComponentClient();
  const [profile, setProfile] = useState<Profile>({
    id: userId || "",
    username: userMetadata?.username || "",
    avatar_url: userMetadata?.avatar_url || "",
    position: userMetadata?.position || "",
    department: userMetadata?.department || "",
    employee_id: userMetadata?.employee_id || "",
    title_prefix: userMetadata?.title_prefix || "",
    first_name: userMetadata?.first_name || "",
    last_name: userMetadata?.last_name || "",
    work_location: "",
    work_latitude: undefined,
    work_longitude: undefined,
    work_radius: 100,
    company_name: "", // เพิ่ม initial state
    updated_at: new Date().toISOString(),
  });

  const [avatarLoading, setAvatarLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    let isSubscribed = true;

    async function loadProfile() {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(
            "avatar_url, username, first_name, last_name, position, department, employee_id, title_prefix, work_location, work_latitude, work_longitude, work_radius, company_name, work_start_time, work_end_time"
          )
          .eq("id", userId)
          .single();

        if (error) throw error;

        if (data && isSubscribed) {
          handleProfileData(data);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        if (isSubscribed) {
          setAvatarLoading(false);
          toast.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
        }
      }
    }

    loadProfile();

    return () => {
      isSubscribed = false;
    };
  }, [userId, supabase]);

  function handleProfileData(profileData: ProfileData) {
    setProfile((prev) => ({
      ...prev,
      username: userMetadata?.username || "",
      avatar_url: profileData.avatar_url || "",
      position: profileData.position || "",
      department: profileData.department || "",
      employee_id: profileData.employee_id || "",
      title_prefix: profileData.title_prefix || "",
      first_name: profileData.first_name || "",
      last_name: profileData.last_name || "",
      work_location: profileData.work_location || "",
      work_latitude: profileData.work_latitude || undefined,
      work_longitude: profileData.work_longitude || undefined,
      work_radius: profileData.work_radius || 100,
      company_name: profileData.company_name || "",
      work_start_time: profileData.work_start_time || "09:00",
      work_end_time: profileData.work_end_time || "18:00",
      updated_at: new Date().toISOString(),
    }));

    if (profileData.avatar_url) {
      const img = new Image();
      img.src = profileData.avatar_url;
      img.onload = () => setAvatarLoading(false);
      img.onerror = () => {
        setAvatarLoading(false);
        setAvatarError(true);
      };
    } else {
      setAvatarLoading(false);
    }
  }

  return {
    profile,
    setProfile,
    avatarLoading,
    setAvatarLoading,
    avatarError,
    setAvatarError,
  };
}
