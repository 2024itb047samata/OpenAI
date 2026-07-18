import React, { useState } from "react";
import { motion } from "motion/react";
import { useAuth } from "../lib/auth";
import { Clock, Eye, EyeOff, Loader2, Github, Mail, ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";

interface LoginPageProps {
  onBackToLanding: () => void;
  onLoginSuccess: () => void;
  initialMode?: "login" | "signup" | "forgot";
}

export default function LoginPage({ onBackToLanding, onLoginSuccess, initialMode = "login" }: LoginPageProps) {
  const { login, signup, forgotPassword } = useAuth();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(initialMode);
  
  // Form states
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Submission & Validation states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successState, setSuccessState] = useState(false);

  const validateEmail = (val: string) => {
    return val.includes("@") && val.includes(".");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address (e.g., user@example.com).");
      return;
    }
    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      setSuccessState(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 1500); // Allow success animation to complete
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage("Email address is required.");
      return;
    }
    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Full name is required.");
      return;
    }
    if (!password) {
      setErrorMessage("Password is required.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email, name, password);
      setSuccessState(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Account creation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setSuccessState(true);
      setTimeout(() => {
        setSuccessState(false);
        setMode("login");
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process password reset request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Social Login Placeholders
  const handleSocialLogin = (provider: "GitHub" | "Google") => {
    console.log(`TODO: Integrate ${provider} OAuth authentication handshake gateway here.`);
    alert(`${provider} connection initiated! This is currently a high-fidelity placeholder indicating where production OAuth configurations will hook into.`);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden" id="auth-entry-flow-page">
      {/* Absolute Header with back button */}
      <div className="absolute top-6 left-6 z-30">
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-slate-800/80 hover:border-slate-700 text-xs font-mono font-medium transition-all cursor-pointer backdrop-blur-md"
        >
          <ArrowLeft size={14} />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="w-full max-w-[440px] z-20">
        {/* Upper Brand Section */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2.5">
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-2xl font-black font-display tracking-tight text-white uppercase">
              CodeStory
            </span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-[0.25em] block">
            Every Commit Has a Story.
          </span>
          <p className="text-slate-400 text-xs leading-relaxed max-w-[340px] mx-auto pt-2">
            Understand the story behind every engineering decision using AI-powered repository intelligence.
          </p>
        </div>

        {/* Dynamic Card Container */}
        <motion.div
          layout
          className="bg-slate-950/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative overflow-hidden"
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
        >
          {/* Subtle light leak effects inside the glassmorphism card */}
          <div className="absolute -top-[40%] -left-[40%] w-[80%] h-[80%] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-[40%] -right-[40%] w-[80%] h-[80%] bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

          {/* SUCCESS ANIMATION STATE OVERLAY */}
          {successState && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-950/90 z-40 flex flex-col items-center justify-center text-center p-6"
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4"
              >
                <CheckCircle2 size={24} />
              </motion.div>
              <h3 className="text-base font-sans font-bold text-slate-100">
                {mode === "login" && "Welcome back!"}
                {mode === "signup" && "Account created successfully!"}
                {mode === "forgot" && "Reset link dispatched!"}
              </h3>
              <p className="text-[11px] font-mono text-slate-400 mt-1.5 max-w-[250px]">
                {mode === "forgot"
                  ? `Please verify your inbox at ${email} for further instructions.`
                  : "Establishing secure cryptographic sandbox workspace state..."}
              </p>
            </motion.div>
          )}

          {/* Form Mode Toggles / Headers */}
          <div className="mb-6">
            <h2 className="text-sm font-sans font-medium text-slate-200">
              {mode === "login" && "Sign in to continue"}
              {mode === "signup" && "Create your CodeStory account"}
              {mode === "forgot" && "Reset your password"}
            </h2>
            <div className="h-[1px] bg-gradient-to-r from-indigo-500/25 via-slate-800 to-transparent mt-2" />
          </div>

          {/* Dynamic Error Messaging */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-xs text-red-400 text-left"
            >
              <ShieldAlert size={14} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {/* 1. LOGIN MODE FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wide block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wide block">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="text-[9.5px] font-mono text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-3.5 pr-10 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-xs font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Signing in securely...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}

          {/* 2. SIGNUP MODE FORM */}
          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wide block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sam Atabagh"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wide block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wide block">
                  Password (6+ characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-3.5 pr-10 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-xs font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Constructing credentials...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD MODE FORM */}
          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4 text-left">
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Enter your registered email address below. We'll send a cryptographic secure link to bypass/reset your active password array.
              </p>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wide block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-lg px-3.5 py-2 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg py-2.5 text-xs font-sans font-medium transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:scale-[1.01]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Dispatching reset array...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full border border-slate-800 hover:border-slate-700 bg-slate-900/20 hover:bg-slate-900 text-slate-300 rounded-lg py-2 text-xs font-sans font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={11} />
                <span>Return to Sign In</span>
              </button>
            </form>
          )}

          {/* SOCIAL LOGIN / ALTERNATIVES (ONLY FOR LOGIN & SIGNUP) */}
          {mode !== "forgot" && (
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-3">
                <div className="h-[1px] bg-slate-800/80 flex-1" />
                <span className="text-[8.5px] font-mono text-slate-600 uppercase tracking-widest font-bold whitespace-nowrap">
                  Or Continue With
                </span>
                <div className="h-[1px] bg-slate-800/80 flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin("GitHub")}
                  className="bg-slate-900/40 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors py-2 rounded-lg text-[11px] font-sans font-medium flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Github size={13} className="text-slate-400" />
                  <span>GitHub</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin("Google")}
                  className="bg-slate-900/40 hover:bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors py-2 rounded-lg text-[11px] font-sans font-medium flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Mail size={13} className="text-indigo-400" />
                  <span>Google</span>
                </button>
              </div>
            </div>
          )}

          {/* BOTTOM REDIRECT TOGGLES */}
          <div className="mt-6 border-t border-slate-850 pt-4 text-center">
            {mode === "login" ? (
              <p className="text-slate-500 text-[11px] font-sans">
                Don't have an account?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="text-indigo-400 font-medium hover:underline transition-all cursor-pointer"
                >
                  Create Account
                </button>
              </p>
            ) : mode === "signup" ? (
              <p className="text-slate-500 text-[11px] font-sans">
                Already have an account?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="text-indigo-400 font-medium hover:underline transition-all cursor-pointer"
                >
                  Sign In
                </button>
              </p>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
