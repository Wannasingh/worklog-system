"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";


export const AuthContext = createContext<{
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isProfileUpdating: boolean;
  setIsProfileUpdating: (state: boolean) => void;
}>({
  user: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isProfileUpdating: false,
  setIsProfileUpdating: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isProfileUpdating, setIsProfileUpdating] = useState(false);
  
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN") router.push("/");
      if (event === "SIGNED_OUT") router.push("/login");
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Google sign in error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      signInWithGoogle, 
      signOut, 
      isProfileUpdating, 
      setIsProfileUpdating 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
