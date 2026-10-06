import { FormEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { getApiErrorMessage } from "@/api/axios";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { IconEye, IconEyeOff } from "@/components/ui/icons";
import { useAuth } from "@/context/AuthContext";

// PLACEHOLDER demo values only - tell me the real gate username/password you want
// and I'll swap these in before this ships.
const GATE_USERNAME = "staffgate";
const GATE_PASSWORD = "letmein2026";

function LoginGate({ onPass }: { onPass: () => void }) {
  const navigate = useNavigate();
  const [gateUser, setGateUser] = useState("");
  const [gatePass, setGatePass] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (gateUser === GATE_USERNAME && gatePass === GATE_PASSWORD) {
      onPass();
    } else {
      navigate("/track", { replace: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-surface-dark-border dark:bg-surface-dark-subtle"
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Authentication Required</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter the staff access code to continue.</p>
        <div className="mt-4 space-y-3">
          <div>
            <Label>Username</Label>
            <Input value={gateUser} onChange={(e) => setGateUser(e.target.value)} autoFocus />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={gatePass} onChange={(e) => setGatePass(e.target.value)} />
          </div>
        </div>
        <Button type="submit" className="mt-4 w-full">
          OK
        </Button>
      </form>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [gatePassed, setGatePassed] = useState(false);
  const [email, setEmail] = useState(() => searchParams.get("email") || searchParams.get("username") || "");
  const [password, setPassword] = useState(() => searchParams.get("password") || "");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(loginEmail, loginPassword);
      navigate(user.role === "CUSTOMER" ? "/customer/orders" : "/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  // Auto sign-in when the URL already carries both ?email=...&password=... (or ?username=...),
  // e.g. a bookmarked link - runs once on mount only.
  const autoLoginAttempted = useRef(false);
  useEffect(() => {
    if (autoLoginAttempted.current) return;
    const urlEmail = searchParams.get("email") || searchParams.get("username");
    const urlPassword = searchParams.get("password");
    if (urlEmail && urlPassword) {
      autoLoginAttempted.current = true;
      doLogin(urlEmail, urlPassword);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!gatePassed) {
    return <LoginGate onPass={() => setGatePassed(true)} />;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card dark:border-surface-dark-border dark:bg-surface-dark-subtle dark:shadow-card-dark">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Sign in</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Access your admin or customer dashboard.</p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}
        <div>
          <Label>Email</Label>
          <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label>Password</Label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
