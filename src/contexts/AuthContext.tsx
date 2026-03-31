import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { IS_LOVABLE } from "@/lib/environment";
import { supabaseDirect } from "@/integrations/supabase/client";
import { db } from "@/integrations/supabase/client";
import api from "@/lib/api";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: AdminUser; token: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const token = localStorage.getItem("admin_token");
      const savedUser = localStorage.getItem("admin_user");
      if (token && savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as AdminUser;

          if (IS_LOVABLE) {
            // Validate session via Supabase direct query
            const { data, error } = await db
              .from("admin_sessions")
              .select("id")
              .eq("session_token", token)
              .eq("status", "active")
              .maybeSingle();
            if (data && !error && mounted) {
              setUser(parsedUser);
            } else {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_user");
            }
          } else {
            try {
              const { data } = await api.get("/admin/me");
              if (data?.id && mounted) setUser(parsedUser);
              else {
                localStorage.removeItem("admin_token");
                localStorage.removeItem("admin_user");
              }
            } catch {
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_user");
            }
          }
        } catch {
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_user");
        }
      }
      if (mounted) setLoading(false);
    };

    initializeAuth();
    return () => { mounted = false; };
  }, []);

  const signIn = async (username: string, password: string) => {
    if (IS_LOVABLE) {
      // Use Supabase Edge Function for login
      const { data, error } = await supabaseDirect.functions.invoke("admin-login", {
        body: { username, password },
      });
      if (error) throw new Error(error.message || "Login failed");
      if (!data?.user || !data?.token) throw new Error(data?.error || "Login failed");
      const adminUser: AdminUser = data.user;
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(adminUser));
      setUser(adminUser);
      return { user: adminUser, token: data.token };
    } else {
      const { data } = await api.post("/admin/login", { email: username, password });
      if (!data?.user || !data?.token) throw new Error(data?.error || "Login failed");
      const adminUser: AdminUser = data.user;
      localStorage.setItem("admin_token", data.token);
      localStorage.setItem("admin_user", JSON.stringify(adminUser));
      setUser(adminUser);
      return { user: adminUser, token: data.token };
    }
  };

  const signOut = async () => {
    if (IS_LOVABLE) {
      const token = localStorage.getItem("admin_token");
      if (token) {
        try {
          await db
            .from("admin_sessions")
            .update({ status: "expired" })
            .eq("session_token", token);
        } catch {}
      }
    } else {
      try { await api.post("/admin/logout"); } catch {}
    }
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

const fallbackAuth: AuthContextType = {
  user: null,
  loading: true,
  signIn: async () => { throw new Error("AuthProvider not mounted"); },
  signOut: async () => {},
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context ?? fallbackAuth;
};
