import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";


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

// Remove unused UserMetadata interface
export function useProfileData(userId: string, userMetadata: UserMetadata | null) {
  const [profile, setProfile] = useState<Profile>(() => {
    // Only access sessionStorage on the client side
    if (typeof window !== 'undefined') {
      const cachedProfile = sessionStorage.getItem(`profile_${userId}`);
      if (cachedProfile) {
        return JSON.parse(cachedProfile);
      }
    }
    return {
      id: userId,
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
      company_name: "",
      updated_at: new Date().toISOString(),
    };
  });

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const supabase = createClientComponentClient();

    async function loadProfile() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (supabaseError) throw supabaseError;

        if (data && isSubscribed) {
          const newProfile: Profile = {
            id: userId,
            username: data.username || userMetadata?.username || "",
            avatar_url: data.avatar_url || userMetadata?.avatar_url || "",
            position: data.position || userMetadata?.position || "",
            department: data.department || userMetadata?.department || "",
            employee_id: data.employee_id || userMetadata?.employee_id || "",
            title_prefix: data.title_prefix || userMetadata?.title_prefix || "",
            first_name: data.first_name || userMetadata?.first_name || "",
            last_name: data.last_name || userMetadata?.last_name || "",
            work_location: data.work_location || "",
            work_latitude: data.work_latitude || undefined,
            work_longitude: data.work_longitude || undefined,
            work_radius: data.work_radius || 100,
            company_name: data.company_name || "",
            work_start_time: data.work_start_time || "09:00",
            work_end_time: data.work_end_time || "18:00",
            updated_at: new Date().toISOString(),
          };

          setProfile(newProfile);
          sessionStorage.setItem(`profile_${userId}`, JSON.stringify(newProfile));
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        if (isSubscribed) {
          setError(err instanceof Error ? err : new Error('Failed to load profile'));
          toast.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isSubscribed = false;
    };
  }, [userId, userMetadata]);

  return {
    profile,
    setProfile,
    avatarLoading,
    setAvatarLoading,
    avatarError,
    setAvatarError,
    isLoading,
    error
  };
}
