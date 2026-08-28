import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminLogin } from "@/lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin(email.trim(), password);
      localStorage.setItem("pmun_admin_token", res.token);
      toast.success("Welcome back");
      navigate("/admin");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
        <div className="h-12 w-12 rounded-xl bg-[#1A1710] border border-brass/50 flex items-center justify-center shadow-[0_0_15px_rgba(199,163,90,0.2)]">
          <Lock className="text-brass" size={20} />
        </div>
        <div className="mono-label text-brass mt-5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brass" />
          Organizing Committee
        </div>
        <h1 className="font-display text-3xl text-foreground mt-1">Admin sign in</h1>
        <p className="text-sm text-muted-foreground mt-2">Manage registrations, committees and referral codes.</p>

        <form data-testid="admin-login-form" onSubmit={submit} className="mt-6 space-y-4">
          <div className="flex flex-col gap-2">
            <Label className="mono-label text-muted-foreground">Email</Label>
            <Input data-testid="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/[0.02] border-border text-foreground focus-visible:ring-brass h-11" placeholder="you@paramountmun.com" required />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="mono-label text-muted-foreground">Password</Label>
            <div className="relative">
              <Input data-testid="admin-password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/[0.02] border-border text-foreground focus-visible:ring-brass h-11 pr-11" placeholder="••••••••" required />
              <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brass transition-colors">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <button data-testid="admin-login-submit-button" disabled={loading} className="btn-luxury w-full h-11 rounded-lg bg-brass text-sm font-semibold text-[#070A0F] hover:bg-brass-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(199,163,90,0.3)]">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in…</> : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
