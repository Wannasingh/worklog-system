import { MapPin } from "lucide-react";
import { memo } from "react";

interface WorkStatusCardProps {
  isWithinWorkArea: boolean;
  showLocationStatus?: boolean;
}

export const WorkStatusCard = memo(function WorkStatusCard({ 
  isWithinWorkArea, 
  showLocationStatus = false
}: WorkStatusCardProps) {
  if (!showLocationStatus) {
    return null;
  }

  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        <span className="text-sm">
          {isWithinWorkArea 
            ? "คุณอยู่ในพื้นที่ทำงาน"
            : "คุณอยู่นอกพื้นที่ทำงาน"}
        </span>
      </div>
    </div>
  );
});