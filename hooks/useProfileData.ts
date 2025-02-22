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
}

interface Profile {
  username: string;
  avatar_url: string;
  position: string;
  department: string;
  employee_id: string;
  title_prefix: string;
  first_name: string;
  last_name: string;
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
    username: userMetadata?.username || "",
    avatar_url: userMetadata?.avatar_url || "",
    position: userMetadata?.position || "",
    department: userMetadata?.department || "",
    employee_id: userMetadata?.employee_id || "",
    title_prefix: userMetadata?.title_prefix || "",
    first_name: userMetadata?.first_name || "",
    last_name: userMetadata?.last_name || "",
  });
  const [avatarLoading, setAvatarLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const maxRetries = 3;
      let retryCount = 0;

      while (retryCount < maxRetries) {
        try {
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );

          const { data, error } = await supabase
            .from("profiles")
            .select(
              "avatar_url, username, first_name, last_name, position, department, employee_id, title_prefix"
            )
            .eq("id", userId)
            .single();

          if (error) {
            if (error.message.includes("insufficient resources")) {
              retryCount++;
              if (retryCount === maxRetries) throw error;
              continue;
            }
            throw error;
          }

          if (data) {
            handleProfileData(data);
            return;
          }
        } catch (error) {
          if (retryCount === maxRetries - 1) {
            console.error("Error loading profile:", error);
            setAvatarLoading(false);
            toast.error("ไม่สามารถโหลดข้อมูลโปรไฟล์ได้ กรุณาลองใหม่อีกครั้ง");
            return;
          }
          retryCount++;
        }
      }
    }

    function handleProfileData(profileData: ProfileData) {
      setProfile({
        username: userMetadata?.username || "",
        avatar_url: profileData.avatar_url || "",
        position: profileData.position || "",
        department: profileData.department || "",
        employee_id: profileData.employee_id || "",
        title_prefix: profileData.title_prefix || "",
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
      });

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

    if (userId) {
      loadProfile();
    }
  }, [userId, userMetadata, supabase]);

  return {
    profile,
    setProfile,
    avatarLoading,
    setAvatarLoading,
    avatarError,
    setAvatarError,
  };
}
