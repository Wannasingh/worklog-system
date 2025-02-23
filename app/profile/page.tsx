"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import "react-image-crop/dist/ReactCrop.css";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfileData } from "@/hooks/useProfileData";
import { useJsApiLoader } from "@react-google-maps/api";
import { PersonalInfoTab } from "./components/PersonalInfoTab";
import { WorkInfoTab } from "./components/WorkInfoTab";
import { LocationTab } from "./components/LocationTab";
import { ImageCropDialog } from "./components/ImageCropDialog";
import { Toaster } from "sonner";
import { Crop } from "react-image-crop";

export default function ProfilePage() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });
  const router = useRouter();
  const { user, setIsProfileUpdating } = useAuth();
  const {
    profile,
    setProfile,
    avatarLoading,
    setAvatarLoading,
    avatarError,
    setAvatarError,
  } = useProfileData(user?.id || "", user?.user_metadata || null);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.Autocomplete | null>(null);
  const supabase = createClientComponentClient();
  const imgRef = useRef<HTMLImageElement>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    width: 80,
    height: 80,
    x: 10,
    y: 10,
  });
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          company_name: profile.company_name,
          work_location: profile.work_location,
          work_latitude: profile.work_latitude,
          work_longitude: profile.work_longitude,
          work_radius: profile.work_radius,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id);

      if (error) throw error;
      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setTempImage(reader.result as string);
      setShowCropDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async () => {
    if (!imgRef.current || !crop) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const outputSize = 400;
    canvas.width = outputSize;
    canvas.height = outputSize;

    const image = imgRef.current;
    const scale = image.naturalWidth / image.width;

    ctx.drawImage(
      image,
      crop.x * scale,
      crop.y * scale,
      crop.width * scale,
      crop.height * scale,
      0,
      0,
      outputSize,
      outputSize
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        setShowCropDialog(false);
        setUploading(true);
        setAvatarError(false);

        try {
          const folderPath = `${user?.id}/`;
          const fileName = `avatar-${Date.now()}.jpg`;
          const fullPath = folderPath + fileName;

          // Remove old files
          const { data: existingFiles } = await supabase.storage
            .from("avatars")
            .list(folderPath);

          if (existingFiles && existingFiles.length > 0) {
            await supabase.storage
              .from("avatars")
              .remove(existingFiles.map((file) => `${folderPath}${file.name}`));
          }

          // Upload new avatar
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fullPath, blob, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(fullPath);

          const cachedUrl = `${publicUrl}?t=${Date.now()}`;

          await Promise.all([
            supabase.auth.updateUser({
              data: { avatar_url: cachedUrl },
            }),
            supabase.from("profiles").upsert({
              id: user?.id,
              avatar_url: cachedUrl,
              updated_at: new Date().toISOString(),
            }),
          ]);

          setProfile((prev) => ({ ...prev, avatar_url: cachedUrl }));
          setAvatarLoading(false);
          toast.success("อัพโหลดรูปโปรไฟล์เรียบร้อยแล้ว");
        } catch (error) {
          console.error("Error uploading avatar:", error);
          toast.error("เกิดข้อผิดพลาดในการอัพโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
          setAvatarError(true);
        } finally {
          setUploading(false);
          setTempImage(null);
          setIsProfileUpdating(false);
        }
      },
      "image/jpeg",
      1
    );
  };

  return (
    <div className="container mx-auto py-10">
      <Button
        variant="outline"
        className="mb-4 hover:bg-primary hover:text-primary-foreground transition-colors"
        onClick={() => router.back()}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        ย้อนกลับ
      </Button>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>แก้ไขโปรไฟล์</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">ข้อมูลส่วนตัว</TabsTrigger>
              <TabsTrigger value="work">ข้อมูลการทำงาน</TabsTrigger>
              <TabsTrigger value="location">พิกัดที่ทำงาน</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalInfoTab
                profile={profile}
                setProfile={setProfile}
                handleSubmit={handleSubmit}
                handleImageUpload={handleImageUpload}
                uploading={uploading}
                avatarLoading={avatarLoading}
                avatarError={avatarError}
                setAvatarError={setAvatarError}
                loading={loading}
                userEmail={user?.email}
              />
            </TabsContent>

            <TabsContent value="work">
              <WorkInfoTab
                profile={profile}
                setProfile={setProfile}
                handleSubmit={handleSubmit}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="location">
              <LocationTab
                profile={profile}
                setProfile={setProfile}
                handleSubmit={handleSubmit}
                loading={loading}
                isLoaded={isLoaded}
                searchBox={searchBox}
                setSearchBox={setSearchBox}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showCropDialog && tempImage && (
        <ImageCropDialog
          tempImage={tempImage}
          crop={crop}
          setCrop={setCrop}
          onCancel={() => {
            setShowCropDialog(false);
            setTempImage(null);
          }}
          onSave={handleCropComplete}
          imgRef={imgRef}
        />
      )}

      <Toaster />
    </div>
  );
}
