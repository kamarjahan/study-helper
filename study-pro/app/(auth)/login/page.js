"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaGoogle, FaEnvelope, FaLock } from "react-icons/fa";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // 1. Google Sign-In Strategy
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/dashboard"); // Redirect on success
    } catch (err) {
      setError(err.message);
    }
  };

  // 2. Email/Password Strategy
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      // Clean up error messages for better UX
      const msg = err.message.replace("Firebase: ", "").replace("auth/", "");
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/bg-abstract.jpg')] bg-cover bg-center">
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md p-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-2">
          {isLogin ? "Welcome Back" : "Join the Elite"}
        </h2>
        <p className="text-slate-400 text-center mb-8">
          {isLogin ? "Continue your productivity streak" : "Start your journey today"}
        </p>

        {/* Google Button */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all mb-6"
        >
          <FaGoogle />
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-slate-800 text-slate-500">Or continue with email</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3.5 text-slate-500" />
            <input 
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3.5 text-slate-500" />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-600 text-white pl-10 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none transition-all"
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded">
              {error}
            </p>
          )}

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-cyan-400 hover:underline font-bold"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}