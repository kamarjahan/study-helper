"use client";
import { useSettings } from "@/hooks/useSettings";
import { useForm } from "react-hook-form"; // npm install react-hook-form
import { useEffect } from "react";

export default function SettingsPage() {
  const { settings, updateSettings, loading } = useSettings();
  const { register, handleSubmit, reset } = useForm();

  // Reset form with data once loaded
  useEffect(() => {
    if (!loading) reset(settings);
  }, [loading, settings, reset]);

  const onSubmit = (data) => {
    // Convert strings to numbers where needed
    const cleaned = {
      ...data,
      focusDuration: parseInt(data.focusDuration),
      shortBreak: parseInt(data.shortBreak),
    };
    updateSettings(cleaned);
    alert("Configuration Saved.");
  };

  if (loading) return <div className="p-8 text-white">Loading config...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 text-white">
      <h1 className="text-3xl font-bold mb-8 border-b border-slate-700 pb-4">System Configuration</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Timer Config */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-cyan-400">Timer Protocols (Minutes)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Focus Session</label>
              <input 
                {...register("focusDuration")}
                type="number" 
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:border-cyan-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Short Break</label>
              <input 
                {...register("shortBreak")}
                type="number" 
                className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:border-cyan-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Safety Config */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-bold mb-4 text-red-400">Fail-Safe Protocol</h2>
          <p className="text-sm text-slate-400 mb-4">
            If the alarm is not dismissed within 5 minutes, an emergency alert will be sent to this email.
          </p>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Emergency Contact Email</label>
            <input 
              {...register("emergencyEmail")}
              type="email" 
              placeholder="parent@example.com"
              className="w-full bg-slate-900 border border-slate-600 rounded p-2 focus:border-red-500 outline-none"
            />
          </div>
        </section>

        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          SAVE CHANGES
        </button>
      </form>
    </div>
  );
}