import { TimeRecord } from "@/types/time";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { format } from "date-fns";

interface TimeEditFormProps {
  record: TimeRecord;
  onSubmit: (data: Partial<TimeRecord>) => Promise<void>;
}

export function TimeEditForm({ record, onSubmit }: TimeEditFormProps) {
  const [checkIn, setCheckIn] = useState(
    format(new Date(record.check_in), "yyyy-MM-dd'T'HH:mm")
  );
  const [checkOut, setCheckOut] = useState(
    record.check_out
      ? format(new Date(record.check_out), "yyyy-MM-dd'T'HH:mm")
      : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        check_in: new Date(checkIn).toISOString(),
        check_out: checkOut ? new Date(checkOut).toISOString() : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">เวลาเข้างาน</label>
        <Input
          type="datetime-local"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">เวลาออกงาน</label>
        <Input
          type="datetime-local"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
      </Button>
    </form>
  );
}