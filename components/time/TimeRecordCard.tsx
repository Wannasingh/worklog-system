import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, LogIn, LogOut } from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { th } from "date-fns/locale";
import { TimeRecord } from "@/types/time";
import { useState, useEffect, useCallback } from "react";

interface TimeRecordCardProps {
  currentRecord: TimeRecord | null;
  loading: boolean;
  onCheckIn: (location: { latitude: number; longitude: number }) => Promise<void>;
  onCheckOut: (location: { latitude: number; longitude: number }) => Promise<void>;
}

// Add these new imports
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TimeRecordCard({
  currentRecord,
  loading,
  onCheckIn,
  onCheckOut,
}: TimeRecordCardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEarlyCheckoutDialog, setShowEarlyCheckoutDialog] = useState(false);

  const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isEarlyCheckout = useCallback(() => {
    if (!currentRecord) return false;
    const workingHours = differenceInHours(new Date(), new Date(currentRecord.check_in));
    return workingHours < 8; // minimum 8 hours working time
  }, [currentRecord]);

  const handleEarlyCheckout = useCallback(async () => {
    if (!currentRecord) {
      console.error('No current record found for checkout');
      return false;
    }

    try {
      setIsProcessing(true);
      const position = await getCurrentPosition();
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      console.log('Processing early checkout with location:', location);
      await onCheckOut(location);
      console.log('Early checkout successful');
      
      return true;
    } catch (error) {
      console.error('Early checkout error:', error);
      return false;
    } finally {
      setIsProcessing(false);
      setShowEarlyCheckoutDialog(false);
    }
  }, [getCurrentPosition, onCheckOut, currentRecord]);

  const handleTimeRecord = useCallback(async (isCheckOut: boolean = false) => {
    if (isProcessing || loading) {
      console.log('Already processing, skipping...');
      return false;
    }

    if (isCheckOut) {
      if (!currentRecord) {
        console.error('No current record found for checkout');
        return false;
      }
      if (isEarlyCheckout()) {
        setShowEarlyCheckoutDialog(true);
        return false;
      }
    }
  
    try {
      setIsProcessing(true);
      
      const position = await getCurrentPosition();
      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      if (isCheckOut) {
        await onCheckOut(location);
      } else {
        if (currentRecord) {
          console.error('Already checked in');
          return false;
        }
        await onCheckIn(location);
      }
      return true;
    } catch (error) {
      console.error('Time record error:', error);
      throw error; // Propagate error for better handling
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, loading, currentRecord, onCheckIn, onCheckOut, isEarlyCheckout, getCurrentPosition]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            การลงเวลาวันนี้
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-2xl font-bold">
              {format(currentTime, "HH:mm:ss", { locale: th })}
            </div>

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
                  onClick={async () => {
                    if (isProcessing || loading) return;
                    const success = await handleTimeRecord(true);
                    if (!success) {
                    }
                  }}
                  disabled={loading || isProcessing}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {loading || isProcessing ? "กำลังบันทึก..." : "ลงเวลาออกงาน"}
                </Button>
              </>
            ) : (
              <Button
                className="w-full"
                onClick={async () => {
                  if (isProcessing || loading) return;
                  try {
                    const success = await handleTimeRecord(false);
                    if (!success) {
                      console.error('Failed to check in');
                    }
                  } catch (error) {
                    console.error('Check-in error:', error);
                  }
                }}
                disabled={loading || isProcessing}
              >
                <LogIn className="mr-2 h-4 w-4" />
                {loading || isProcessing ? "กำลังบันทึก..." : "ลงเวลาเข้างาน"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showEarlyCheckoutDialog} onOpenChange={setShowEarlyCheckoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลงเวลาออกก่อนเวลา</AlertDialogTitle>
            <AlertDialogDescription>
              คุณกำลังจะลงเวลาออกก่อนครบ 8 ชั่วโมง ต้องการดำเนินการต่อหรือไม่?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              disabled={isProcessing}
              onClick={async () => {
                try {
                  const success = await handleEarlyCheckout();
                  if (!success) {
                    console.error('Early checkout operation failed');
                  }
                } catch (error) {
                  console.error('Early checkout error:', error);
                }
              }}
            >
              {isProcessing ? "กำลังบันทึก..." : "ยืนยัน"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
