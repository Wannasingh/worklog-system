export interface TimeRecord {
  id: string;
  user_id: string;
  check_in: string;
  check_out: string | null;
  created_at: string;
}