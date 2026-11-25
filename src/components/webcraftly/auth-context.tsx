import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { toast } from "sonner";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin" | string;
  phone?: string;
  businessName?: string;
}

interface OpenModalOptions {
  mode?: "signin" | "signup";
  role?: "customer" | "admin";
  onLoginSuccess?: (user: UserSession) => void;
}

interface AuthContextType {
  sessionUser: UserSession | null;
  authLoading: boolean;
  isModalOpen: boolean;
  modalMode: "signin" | "signup";
  modalRole: "customer" | "admin";
  setModalMode: (mode: "signin" | "signup") => void;
  setModalRole: (role: "customer" | "admin") => void;
  openLoginModal: (options?: OpenModalOptions) => void;
  closeLoginModal: () => void;
  refreshSession: () => Promise<UserSession | null>;
  signOut: () => Promise<void>;
  successCallback?: ((user: UserSession) => void) | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionUser, setSessionUser] = useState<UserSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signin" | "signup">("signin");
  const [modalRole, setModalRole] = useState<"customer" | "admin">("customer");
  const [successCallback, setSuccessCallback] = useState<((user: UserSession) => void) | null>(null);

  const refreshSession = useCallback(async (): Promise<UserSession | null> => {
    try {
      setAuthLoading(true);
      const res = await fetch("/api/auth/get-session", {
        headers: { "Cache-Control": "no-cache" },
        credentials: "include",
      });
      if (!res.ok) {
        setSessionUser(null);
        return null;
      }
      const data = await res.json();
      if (data?.user) {
        setSessionUser(data.user);
        return data.user as UserSession;
      } else {
        setSessionUser(null);
        return null;
      }
    } catch {
      setSessionUser(null);
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession().then((user) => {
      // Automatically show login popup when customer opens website if not authenticated
      if (!user && typeof window !== "undefined") {
        const path = window.location.pathname;
        if (!path.startsWith("/admin")) {
          setIsModalOpen(true);
        }
      }
    });
  }, [refreshSession]);

  const openLoginModal = useCallback((options?: OpenModalOptions) => {
    if (options?.mode) setModalMode(options.mode);
    if (options?.role) setModalRole(options.role);
    if (options?.onLoginSuccess) {
      setSuccessCallback(() => options.onLoginSuccess!);
    } else {
      setSuccessCallback(null);
    }
    setIsModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setIsModalOpen(false);
    setSuccessCallback(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      setSessionUser(null);
      toast.success("Signed out successfully.");
    } catch {
      toast.error("Failed to sign out.");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        sessionUser,
        authLoading,
        isModalOpen,
        modalMode,
        modalRole,
        setModalMode,
        setModalRole,
        openLoginModal,
        closeLoginModal,
        refreshSession,
        signOut,
        successCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthModal must be used within an AuthProvider");
  }
  return context;
}
