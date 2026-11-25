import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuthModal } from "./auth-context";
import { Mail, Lock, UserRound } from "lucide-react";
import { toast } from "sonner";

export function AuthModal() {
  const {
    isModalOpen,
    closeLoginModal,
    modalMode,
    setModalMode,
    refreshSession,
    successCallback,
  } = useAuthModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset all form inputs to 100% EMPTY every time modal opens, closes, or changes tab
  useEffect(() => {
    setEmail("");
    setPassword("");
    setName("");
    setIsSubmitting(false);
  }, [isModalOpen, modalMode]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Attempt standard customer sign-in
      const res = await fetch("/api/auth/sign-in/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        toast.success(`Welcome back, ${data.user.name || "Client"}!`);
        const refreshed = await refreshSession();
        const activeUser = refreshed || data.user;
        closeLoginModal();
        if (successCallback) {
          successCallback(activeUser);
        }
        return;
      }

      // 2. Seamless registration fallback: if user account does not exist yet,
      // create it automatically with the password they entered so they are never locked out
      if (password.length >= 6) {
        try {
          const signUpRes = await fetch("/api/auth/sign-up/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: (cleanEmail.split("@")[0] || "Client").replace(/[._-]/g, " "),
              email: cleanEmail,
              password,
            }),
          });
          const signUpData = await signUpRes.json();
          if (signUpRes.ok && signUpData.user) {
            toast.success(`Welcome to WebCraftly, ${signUpData.user.name || "Client"}! Your account is ready.`);
            const refreshed = await refreshSession();
            const activeUser = refreshed || signUpData.user;
            closeLoginModal();
            if (successCallback) {
              successCallback(activeUser);
            }
            return;
          }
        } catch {
          // fallback failed, continue to display sign in error
        }
      }

      throw new Error(data.message || data.error || "Invalid email or password.");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Sign in failed. Please verify your email and password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!cleanEmail) {
      toast.error("Please enter your email address.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/sign-up/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: cleanEmail,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.user) {
        throw new Error(data.message || data.error || "Registration failed.");
      }

      toast.success("Account created successfully! Welcome to WebCraftly.");

      const refreshed = await refreshSession();
      const activeUser = refreshed || data.user;

      closeLoginModal();

      if (successCallback) {
        successCallback(activeUser);
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Registration failed. Email may already be in use.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeLoginModal()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0 shadow-2xl rounded-3xl bg-white">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#071C55] via-[#0866D9] to-[#248BEE] p-6 text-white text-center relative">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 mb-3">
            <UserRound className="size-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-extrabold tracking-tight text-white">
            {modalMode === "signup" ? "Create Your Client Account" : "Sign In to WebCraftly"}
          </DialogTitle>
          <DialogDescription className="text-blue-100 text-xs mt-1 max-w-xs mx-auto">
            Track development orders, review deliverables, and approve project milestones.
          </DialogDescription>
        </div>

        <div className="p-6">
          {/* Mode Switcher Tabs: ONLY Customer and Register */}
          <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[#F4F8FC] p-1 mb-5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setModalMode("signin")}
              className={`rounded-xl py-2 px-3 text-center transition-all ${
                modalMode === "signin"
                  ? "bg-white text-[#0866D9] shadow-xs"
                  : "text-[#667085] hover:text-[#071C55]"
              }`}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setModalMode("signup")}
              className={`rounded-xl py-2 px-3 text-center transition-all ${
                modalMode === "signup"
                  ? "bg-white text-[#0866D9] shadow-xs"
                  : "text-[#667085] hover:text-[#071C55]"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          {modalMode === "signin" ? (
            <form onSubmit={handleSignIn} autoComplete="off" className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] py-2.5 pl-10 pr-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
                  <input
                    type="password"
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] py-2.5 pl-10 pr-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-full bg-[#0866D9] hover:bg-[#071C55] py-2.5 text-xs font-bold text-white shadow-md transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-[#667085] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} autoComplete="off" className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] py-2.5 pl-10 pr-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] py-2.5 pl-10 pr-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#071C55] uppercase tracking-wider mb-1">
                  Password * (Min 6 Characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#667085]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-xl border border-gray-200 bg-[#F4F8FC] py-2.5 pl-10 pr-3 text-xs text-[#071C55] focus:border-[#0866D9] focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-full bg-[#0866D9] py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#071C55] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Creating Account..." : "Create Client Account"}
                </button>
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-[#667085] hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 text-center text-[11px] text-[#667085]">
            <span>
              Assisted onboarding available on WhatsApp:{" "}
              <a
                href="https://wa.me/919618805557"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[#0866D9] hover:underline"
              >
                +91 96188 05557
              </a>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
