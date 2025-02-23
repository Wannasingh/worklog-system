"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { LogOut, User, Settings } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

interface Profile {
  username?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
}

export function Navbar() {
  const { user, signOut, isProfileUpdating } = useAuth();
  const supabase = createClientComponentClient();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    username: user?.user_metadata?.username || "",
    avatar_url: user?.user_metadata?.avatar_url || "",
    first_name: user?.user_metadata?.first_name || "",
    last_name: user?.user_metadata?.last_name || "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function getProfile() {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url, first_name, last_name")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }

        if (data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    }

    if (user?.id) {
      getProfile();
    }
  }, [user?.id, supabase]);

  if (!mounted) {
    return null;
  }

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">WorkLog System</h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-10 w-10 rounded-md transition-all hover:scale-105 hover:ring-2 hover:ring-primary hover:ring-offset-2"
                      >
                        <Avatar className="h-10 w-10">
                          {isProfileUpdating ? (
                            <AvatarFallback className="animate-pulse bg-muted">
                              {(
                                profile?.username?.[0] ||
                                user?.email?.[0] ||
                                ""
                              ).toUpperCase()}
                            </AvatarFallback>
                          ) : (
                            <>
                              <AvatarImage
                                src={profile.avatar_url}
                                alt={profile.username || user?.email || ""}
                              />
                              <AvatarFallback>
                                {(
                                  profile.username?.[0] ||
                                  user?.email?.[0] ||
                                  ""
                                ).toUpperCase()}
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profile?.username ||
                              (profile?.first_name && profile?.last_name
                                ? `${profile.first_name} ${profile.last_name}`
                                : user.email)}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4" />
                            โปรไฟล์
                          </div>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        ตั้งค่า
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={signOut}
                        className="text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        ออกจากระบบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent>
                  <p>คลิกเพื่อจัดการโปรไฟล์</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </nav>
  );
}
