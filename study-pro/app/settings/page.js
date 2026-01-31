"use client";
import { useState, useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";
import { useForm } from "react-hook-form";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { signOut, updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FaUser, FaLock, FaSignOutAlt, FaSave, FaEdit, FaEnvelope } from "react-icons/fa";

export default function SettingsPage() {
  // Auth State
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  
  // App Settings State
  const { settings, updateSettings, loading: configLoading } = useSettings();
  const { register, handleSubmit, reset } = useForm();

  // Local UI State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState("");

  // Sync Settings form when data loads
  useEffect(() => {
    if (!configLoading && settings) {
      reset(settings);
    }
  }, [configLoading, settings, reset]);

  // Sync Name State
  useEffect(() => {
    if (user?.displayName) setNewName(user.displayName);
  }, [user]);

  // --- ACTIONS ---

  const onConfigSubmit = (data) => {
    const cleaned = {
      ...data,
      focusDuration: parseInt(data.focusDuration),
      shortBreak: parseInt(data.shortBreak),
    };
    updateSettings(cleaned);
    alert("System Configuration Saved.");
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login"); // Redirect to your existing auth page
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: newName });
      setIsEditingProfile(false);
      alert("Profile Updated!");
    } catch (error) {
      console.error(error);
      alert("Error updating profile.");
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      alert(`Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error(error);
      alert("Error sending reset email. Try again later.");
    }
  };

  if (authLoading || configLoading) return <div className="p-10 text-center text-slate-500">Loading System...</div>;

  // --- LOGGED OUT VIEW ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 text-white">
        <div className="glass-card p-8 rounded-xl text-center max-w-md w-full">
          <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
          <p className="text-slate-400 mb-6">Please log in to configure your Study Helper.</p>
          <button 
            onClick={() => router.push("/login")}
            className="w-full bg-cyan-600 hover:bg-cyan-500 py-3 rounded-lg font-bold transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // --- LOGGED IN VIEW ---
  return (
    <div className="max-w-3xl mx-auto p-6 text-white pb-20">
      <h1 className="text-3xl font-bold mb-8 border-b border-slate-700 pb-4 flex items-center gap-3">
        <FaUser className="text-cyan-400" /> Account & Settings
      </h1>
      
      {/* 1. USER PROFILE SECTION */}
      <section className="glass-card p-6 rounded-xl border border-slate-700 mb-8">
        <h2 className="text-xl font-bold mb-6 text-slate-200">User Profile</h2>
        
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar Placeholder */}
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
            {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
          </div>

          <div className="flex-1 w-full space-y-4">
            {/* Name Field */}
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Display Name</label>
              <div className="flex gap-2 mt-1">
                {isEditingProfile ? (
                  <input 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-2 outline-none focus:border-cyan-500"
                  />
                ) : (
                  <div className="flex-1 py-2 text-lg font-medium">{user.displayName || "No Name Set"}</div>
                )}
                
                {isEditingProfile ? (
                  <button onClick={handleUpdateProfile} className="bg-green-600 px-4 rounded hover:bg-green-500"><FaSave /></button>
                ) : (
                  <button onClick={() => setIsEditingProfile(true)} className="text-slate-400 hover:text-cyan-400 px-2"><FaEdit /></button>
                )}
              </div>
            </div>

            {/* Email Field (Read Only) */}
            <div>
              <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email Address</label>
              <div className="flex items-center gap-2 mt-1 text-slate-300">
                <FaEnvelope className="text-slate-500" />
                {user.email}
              </div>
            </div>

            {/* Password Reset */}
            <div className="pt-2">
              <button 
                onClick={handlePasswordReset}
                className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
              >
                <FaLock size={12} /> Send Password Reset Email
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. APP CONFIGURATION (Timers) */}
      <form onSubmit={handleSubmit(onConfigSubmit)} className="space-y-8">
        <section className="glass-card p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-slate-200">Timer Protocols (Minutes)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Focus Session</label>
              <input 
                {...register("focusDuration")}
                type="number" 
                className="w-full bg-slate-900 border border-slate-600 rounded p-3 focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Short Break</label>
              <input 
                {...register("shortBreak")}
                type="number" 
                className="w-full bg-slate-900 border border-slate-600 rounded p-3 focus:border-cyan-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Safety Config */}
        <section className="glass-card p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-red-400">Fail-Safe Protocol</h2>
          <p className="text-sm text-slate-400 mb-4">
            If an alarm is ignored for 5 minutes, an alert will be sent here.
          </p>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Emergency Contact Email</label>
            <input 
              {...register("emergencyEmail")}
              type="email" 
              placeholder="parent@example.com"
              className="w-full bg-slate-900 border border-slate-600 rounded p-3 focus:border-red-500 outline-none"
            />
          </div>
        </section>

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-3 rounded-xl font-bold hover:shadow-lg transition-all shadow-cyan-900/20"
        >
          SAVE CONFIGURATION
        </button>
      </form>

      {/* 3. DANGER ZONE (Logout) */}
      <div className="mt-12 pt-8 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 hover:text-red-400 font-bold transition-colors"
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </div>
  );
}