import { useState } from 'react';
import { toast } from 'sonner';

interface Location {
  latitude: number;
  longitude: number;
  radius: number;
}

export function useAutoTimeRecord(companyLocation: Location, onCheckIn: () => Promise<void>) {
  const [isInWorkArea, setIsInWorkArea] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

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

  const checkLocation = async (): Promise<boolean> => {
    const maxRetries = 2;
    const attemptLocation = async (retryCount: number): Promise<boolean> => {
      return new Promise((resolve, reject) => { // Add reject to handle errors properly
        if (!navigator.geolocation) {
          toast.error("ไม่รองรับการระบุตำแหน่ง");
          reject(new Error("Geolocation not supported"));
          return;
        }

        if (retryCount === 0) {
          toast.info("กำลังระบุตำแหน่ง...", { duration: 10000 });
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const distance = calculateDistance(
              position.coords.latitude,
              position.coords.longitude,
              companyLocation.latitude,
              companyLocation.longitude
            );

            const isInArea = distance <= companyLocation.radius;
            setIsInWorkArea(isInArea);
            resolve(isInArea);
          },
          async (error) => {
            console.error("Location error:", error);
            if (error.code === GeolocationPositionError.TIMEOUT && retryCount < maxRetries) {
              toast.info(`กำลังพยายามระบุตำแหน่งอีกครั้ง (${retryCount + 1}/${maxRetries})...`);
              try {
                const result = await attemptLocation(retryCount + 1);
                resolve(result);
              } catch (retryError) {
                reject(retryError);
              }
              return;
            }
            reject(error);
          },
          {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 60000,
          }
        );
      });
    };

    try {
      return await attemptLocation(0);
    } catch (error: unknown) {
      console.error("Location check failed:", error);
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case GeolocationPositionError.TIMEOUT:
            toast.error("หมดเวลาในการระบุตำแหน่ง กรุณาลองใหม่อีกครั้ง");
            break;
          case GeolocationPositionError.PERMISSION_DENIED:
            toast.error("กรุณาอนุญาตการเข้าถึงตำแหน่ง");
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            toast.error("ไม่สามารถระบุตำแหน่งได้ในขณะนี้");
            break;
          default:
            toast.error("ไม่สามารถระบุตำแหน่งได้");
        }
      } else {
        toast.error("ไม่สามารถระบุตำแหน่งได้");
      }
      return false;
    }
  };

  const handleAutoCheckIn = async () => {
    if (isChecking) return;
    
    try {
      setIsChecking(true);
      const isInArea = await checkLocation();
      
      if (!isInArea) {
        toast.error('คุณอยู่นอกพื้นที่ที่กำหนด');
        return;
      }

      await onCheckIn();
      toast.success('ลงเวลาทำงานสำเร็จ');
      
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error('ไม่สามารถลงเวลาทำงานได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isInWorkArea,
    isChecking,
    checkLocation,
    handleAutoCheckIn,
  };
}