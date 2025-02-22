"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Printer, Save } from "lucide-react";
import { WorkLog } from "@/types/worklog";

const WorkLogApp = () => {
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [newLog, setNewLog] = useState<Omit<WorkLog, "id">>({
    date: new Date().toISOString().split("T")[0],
    startTime: "",
    endTime: "",
    task: "",
    description: "",
  });

  // สำหรับเก็บข้อมูลใน Local Storage ก่อน (ในที่นี้ยังไม่ได้เชื่อมต่อ Supabase)
  useEffect(() => {
    const savedLogs = localStorage.getItem("workLogs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewLog((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const logEntry = {
      id: Date.now(),
      ...newLog,
    };

    const updatedLogs = [...logs, logEntry];
    setLogs(updatedLogs);
    localStorage.setItem("workLogs", JSON.stringify(updatedLogs));

    // รีเซ็ตฟอร์ม แต่เก็บวันที่ปัจจุบันไว้
    setNewLog({
      date: new Date().toISOString().split("T")[0],
      startTime: "",
      endTime: "",
      task: "",
      description: "",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>บันทึกการทำงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">วันที่</Label>
                <div className="relative">
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={newLog.date}
                    onChange={handleInputChange}
                    required
                  />
                  <Calendar className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="startTime">เวลาเริ่ม</Label>
                  <div className="relative">
                    <Input
                      id="startTime"
                      name="startTime"
                      type="time"
                      value={newLog.startTime}
                      onChange={handleInputChange}
                      required
                    />
                    <Clock className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">เวลาสิ้นสุด</Label>
                  <div className="relative">
                    <Input
                      id="endTime"
                      name="endTime"
                      type="time"
                      value={newLog.endTime}
                      onChange={handleInputChange}
                      required
                    />
                    <Clock className="absolute right-2 top-2 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task">งาน</Label>
              <Input
                id="task"
                name="task"
                value={newLog.task}
                onChange={handleInputChange}
                required
                placeholder="ชื่องานหรือโปรเจค"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                name="description"
                value={newLog.description}
                onChange={handleInputChange}
                placeholder="รายละเอียดของงานที่ทำ"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="print:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between print:hidden">
          <CardTitle>ประวัติการทำงาน</CardTitle>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            พิมพ์
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="border-b pb-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                  <div>
                    <span className="font-medium">วันที่:</span> {log.date}
                  </div>
                  <div>
                    <span className="font-medium">เวลา:</span> {log.startTime} -{" "}
                    {log.endTime}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium">งาน:</span> {log.task}
                  </div>
                </div>
                {log.description && (
                  <div className="text-sm mt-2">
                    <span className="font-medium">รายละเอียด:</span>
                    <p className="mt-1 whitespace-pre-wrap">
                      {log.description}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkLogApp;
