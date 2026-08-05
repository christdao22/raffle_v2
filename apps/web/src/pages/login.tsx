import { Button, Card, Input, Label } from "@raffle_v2/ui";
import { ArrowRight, Award, Eye, EyeOff, Lock, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { signIn } from "../lib/auth-client";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await signIn.email({ email, password });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message ?? "Could not sign in");
      return;
    }

    navigate("/", { replace: true });
  }

  return (
    <div className="min-h-screen w-full bg-surface text-on-surface flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Top Left Logo Brand */}
      <header className="flex items-center gap-2.5 z-10">
        <div className="w-15 flex items-center justify-center text-on-primary-container ">
          <img src="/deped-logo-philippines.png" alt="DepEd logo" className="w-auto h-auto" />
        </div>
        <span className="font-sans font-bold text-sm tracking-wider text-primary">
          RAFFLE SYSTEM
        </span>
      </header>

      {/* Login Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10">
        <div className="bg-surface-container/80 backdrop-blur-md rounded-xl p-8 shadow-2xl relative">
          {/* Header Badge & Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-full border border-primary-container/40 bg-surface-container-lowest flex items-center justify-center text-primary-container mb-4 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h1 className="font-sans font-extrabold text-2xl text-primary tracking-wide uppercase leading-tight mb-2">
              Administrator
              <br />
              Access
            </h1>
            <p className="font-sans text-xs text-on-surface-variant font-medium">
              Secure entry for live event management.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Email
              </Label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                <Input
                  type="text"
                  id="email"
                  value={email}
                  autoComplete="email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-md py-3 pl-10 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="block font-label text-[10px] font-bold text-on-surface-variant uppercase tracking-wider"
              >
                Password
              </Label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 pointer-events-none" />
                <Input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-md py-3 pl-10 pr-10 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-secondary transition-all"
                  placeholder="Enter password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            {error && <p className="text-sm text-destructive text-center mt-2">{error}</p>}
            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-md bg-primary-container text-on-primary-container font-sans font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,215,0,0.25)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign in</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <a
              href="#forgot-password"
              className="font-label text-xs text-on-surface-variant hover:text-primary transition-colors inline-block"
            >
              Forgot Password?
            </a>
          </div>
        </div>
      </div>

      {/* Spacer for bottom balance */}
      <footer className="h-8" />
    </div>
  );
}
