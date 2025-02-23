import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { TimeRecord } from "@/types/time";
import { useState } from "react";

interface TimeRecordCardProps {
  currentRecord: TimeRecord | null;
  loading: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  companyLocation: {
    latitude: number;
    longitude: number;
    radius: number; // meters
  };
}

export function TimeRecordCard({
  currentRecord,
  loading,
  onCheckIn,
  onCheckOut,
  companyLocation,
}: TimeRecordCardProps) {
  const [locationError, setLocationError] = useState<string>("");

  const checkLocation = async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const distance = calculateDistance(
        position.coords.latitude,
        position.coords.longitude,
        companyLocation.latitude,
        companyLocation.longitude
      );

      if (distance <= companyLocation.radius) {
        onCheckIn();
      } else {
        setLocationError("คุณอยู่นอกพื้นที่บริษัท กรุณาเช็คอินเมื่ออยู่ในบริเวณบริษัท");
      }
    } catch (error: unknown) {
      console.error('Geolocation error:', error);
      setLocationError("ไม่สามารถระบุตำแหน่งได้ กรุณาเปิดการใช้งาน GPS");
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          การลงเวลาวันนี้
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {locationError && (
            <div className="text-sm text-red-500">{locationError}</div>
          )}
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
                onClick={onCheckOut}
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {loading ? "กำลังบันทึก..." : "ลงเวลาออกงาน"}
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={checkLocation}
              disabled={loading}
            >
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "กำลังบันทึก..." : "ลงเวลาเข้างาน"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}