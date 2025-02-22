"use client";
import { createContext, useContext } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "./AuthContext";

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
    if (!user) throw new Error("User not authenticated");
    
    await supabase.from("work_logs").insert({
      ...workLog,
      user_id: user.id,
    });
  };

  const getWorkLogs = async () => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("work_logs")
      .select("*")
      .order("date", { ascending: false });

    if (error) throw error;
    return data;
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