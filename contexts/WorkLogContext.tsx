"use client";
import { createContext, useContext } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface WorkLog {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  task: string;
  description: string;
}

interface WorkLogContextType {
  createWorkLog: (workLog: Omit<WorkLog, "id">) => Promise<void>;
  getWorkLogs: () => Promise<WorkLog[]>;
}

const WorkLogContext = createContext<WorkLogContextType | undefined>(undefined);

export function WorkLogProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const { user } = useAuth();

  const createWorkLog = async (workLog: Omit<WorkLog, "id">) => {
    try {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase.from("work_logs").insert({
        ...workLog,
        user_id: user.id,
      });

      if (error) throw error;
      toast.success("Work log created successfully");
    } catch (error) {
      console.error("Error creating work log:", error);
      toast.error("Failed to create work log");
      throw error;
    }
  };

  const getWorkLogs = async () => {
    try {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("work_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching work logs:", error);
      toast.error("Failed to fetch work logs");
      return [];
    }
  };

  return (
    <WorkLogContext.Provider value={{ createWorkLog, getWorkLogs }}>
      {children}
    </WorkLogContext.Provider>
  );
}

export const useWorkLog = () => {
  const context = useContext(WorkLogContext);
  if (context === undefined) {
    throw new Error("useWorkLog must be used within a WorkLogProvider");
  }
  return context;
};