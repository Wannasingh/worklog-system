"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import Link from "next/link";

const RegisterPage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (userData.password !== userData.confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน");
      return;
    }
    // TODO: Implement actual registration logic here
    console.log("Register attempt with:", userData);
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">สมัครสมาชิก</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">อีเมล</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="your@email.com"
                value={userData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={userData.password}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={userData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>

            <Button type="submit" className="w-full">
              <UserPlus className="w-4 h-4 mr-2" />
              สมัครสมาชิก
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterPage;