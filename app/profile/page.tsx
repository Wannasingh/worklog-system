"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useRef } from "react";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User, Upload, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, Toaster } from "sonner";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfileData } from "@/hooks/useProfileData";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setIsProfileUpdating } = useAuth();
  const {
    profile,
    setProfile,
    avatarLoading,
    setAvatarLoading,
    avatarError,
    setAvatarError,
  } = useProfileData(user?.id, user?.user_metadata || null);

  const supabase = createClientComponentClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setIsProfileUpdating(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          ...profile,
        },
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user?.id,
        username: profile.username,
        title_prefix: profile.title_prefix,
        first_name: profile.first_name,
        last_name: profile.last_name,
        employee_id: profile.employee_id,
        position: profile.position,
        department: profile.department,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString(),
      });

      if (profileError) throw profileError;

      toast.success("โปรไฟล์ถูกอัพเดทเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("เกิดข้อผิดพลาดในการอัพเดทโปรไฟล์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
      setIsProfileUpdating(false);
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

  const handleCropComplete = async (croppedImage: Blob) => {
    setShowCropDialog(false);
    setUploading(true);
    setAvatarError(false);
    try {
      const folderPath = `${user?.id}/`;
      const fileName = `avatar-${Date.now()}.jpg`;
      const fullPath = folderPath + fileName;

      // Add retry mechanism for listing files
      const maxRetries = 3;
      let retryCount = 0;
      let existingFiles;

      while (retryCount < maxRetries) {
        try {
          const { data, error } = await supabase.storage
            .from("avatars")
            .list(folderPath);

          if (error) {
            if (error.message.includes("insufficient resources")) {
              retryCount++;
              if (retryCount === maxRetries) throw error;
              // Exponential backoff: 1s, 2s, 4s
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, retryCount) * 1000)
              );
              continue;
            }
            throw error;
          }

          existingFiles = data;
          break;
        } catch (e) {
          if (retryCount === maxRetries - 1) throw e;
          retryCount++;
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        }
      }

      // Remove old files with retry mechanism
      if (existingFiles && existingFiles.length > 0) {
        retryCount = 0;
        while (retryCount < maxRetries) {
          try {
            const { error } = await supabase.storage
              .from("avatars")
              .remove(existingFiles.map((file) => `${folderPath}${file.name}`));

            if (error) {
              if (error.message.includes("insufficient resources")) {
                retryCount++;
                if (retryCount === maxRetries) throw error;
                await new Promise((resolve) =>
                  setTimeout(resolve, Math.pow(2, retryCount) * 1000)
                );
                continue;
              }
              throw error;
            }
            break;
          } catch (e) {
            if (retryCount === maxRetries - 1) throw e;
            retryCount++;
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, retryCount) * 1000)
            );
          }
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fullPath, croppedImage, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Error uploading file: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fullPath);

      // Force browser to reload the image
      const cachedUrl = `${publicUrl}?t=${Date.now()}`;

      // Update auth user and profile
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

      // Update local state with cached URL
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal">ข้อมูลส่วนตัว</TabsTrigger>
              <TabsTrigger value="work">ข้อมูลการทำงาน</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <div className="flex flex-col items-center mb-6 space-y-2">
                <Avatar
                  className="h-24 w-24 cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading || avatarLoading ? (
                    <Skeleton className="h-24 w-24 rounded-md" />
                  ) : avatarError || !profile.avatar_url ? (
                    <AvatarFallback>
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  ) : (
                    <>
                      <AvatarImage
                        src={profile.avatar_url}
                        onError={() => setAvatarError(true)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="h-6 w-6 text-white" />
                      </div>
                    </>
                  )}
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {uploading && (
                  <p className="text-sm text-muted-foreground">
                    กำลังอัพโหลด...
                  </p>
                )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profile.username}
                    onChange={(e) =>
                      setProfile({ ...profile, username: e.target.value })
                    }
                    placeholder="Your username"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="work">
              <div className="flex justify-center mb-6">
                <div className="h-24 w-24 flex items-center justify-center rounded-full bg-muted">
                  <Briefcase className="h-12 w-12" />
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title_prefix">คำนำหน้านาม</Label>
                    <select
                      id="title_prefix"
                      value={profile.title_prefix}
                      onChange={(e) =>
                        setProfile({ ...profile, title_prefix: e.target.value })
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">เลือกคำนำหน้านาม</option>
                      <option value="นาย">นาย</option>
                      <option value="นาง">นาง</option>
                      <option value="นางสาว">นางสาว</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">ชื่อ</Label>
                      <Input
                        id="first_name"
                        value={profile.first_name}
                        onChange={(e) =>
                          setProfile({ ...profile, first_name: e.target.value })
                        }
                        placeholder="ชื่อ"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">นามสกุล</Label>
                      <Input
                        id="last_name"
                        value={profile.last_name}
                        onChange={(e) =>
                          setProfile({ ...profile, last_name: e.target.value })
                        }
                        placeholder="นามสกุล"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_id">รหัสพนักงาน</Label>
                  <Input
                    id="employee_id"
                    value={profile.employee_id}
                    onChange={(e) =>
                      setProfile({ ...profile, employee_id: e.target.value })
                    }
                    placeholder="EMP001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">ตำแหน่ง</Label>
                  <Input
                    id="position"
                    value={profile.position}
                    onChange={(e) =>
                      setProfile({ ...profile, position: e.target.value })
                    }
                    placeholder="Your position"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">แผนก/ฝ่าย</Label>
                  <Input
                    id="department"
                    value={profile.department}
                    onChange={(e) =>
                      setProfile({ ...profile, department: e.target.value })
                    }
                    placeholder="Your department"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      {showCropDialog && tempImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold">ปรับขนาดรูปโปรไฟล์</h3>
            </div>
            <div className="p-4">
              <div className="max-h-[60vh] overflow-hidden">
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  aspect={1}
                  className="max-w-full mx-auto rounded-md overflow-hidden"
                >
                  <Image
                    ref={imgRef}
                    src={tempImage}
                    alt="Crop preview"
                    width={400}
                    height={400}
                    className="max-w-full"
                    unoptimized // Add this since we're working with local blob data
                    onLoad={(e) => {
                      const img = e.currentTarget;
                      const size = Math.min(img.width, img.height, 400);
                      setCrop({
                        unit: "px",
                        width: size,
                        height: size,
                        x: (img.width - size) / 2,
                        y: (img.height - size) / 2,
                      });
                    }}
                  />
                </ReactCrop>
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCropDialog(false);
                  setTempImage(null);
                }}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={async () => {
                  if (!crop || !tempImage || !imgRef.current) return;

                  const canvas = document.createElement("canvas");
                  const ctx = canvas.getContext("2d");
                  if (!ctx) return;

                  const outputSize = 400;
                  canvas.width = outputSize;
                  canvas.height = outputSize;

                  // Use the actual displayed image for calculations
                  const image = imgRef.current;

                  // Calculate scaling based on displayed dimensions
                  const scale = image.naturalWidth / image.width;

                  // Draw the cropped area
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
                    (blob) => {
                      if (blob) handleCropComplete(blob);
                    },
                    "image/jpeg",
                    1
                  );
                }}
              >
                บันทึก
              </Button>
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
