"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FaHome, FaClock, FaChartBar, FaListUl, FaBell, 
  FaCheckCircle, FaCog, FaBars, FaTimes 
} from "react-icons/fa";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const pathname = usePathname();

  const menuItems = [
    { name: "Home", href: "/", icon: <FaHome /> },
    { name: "Dashboard", href: "/dashboard", icon: <FaChartBar /> },
    { name: "Focus Timer", href: "/focus", icon: <FaClock /> },
    { name: "Planner", href: "/planner", icon: <FaListUl /> },
    { name: "Habits", href: "/habit", icon: <FaCheckCircle /> },
    { name: "Alarms", href: "/alarms", icon: <FaBell /> },
    { name: "Settings", href: "/settings", icon: <FaCog /> },
  ];

  return (
    <>
      {/* --- MOBILE TOGGLE BUTTON --- */}
      {/* Visible only on mobile (md:hidden) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-3 bg-slate-800 text-cyan-400 rounded-xl shadow-lg border border-slate-700 md:hidden hover:bg-slate-700 transition-colors"
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* --- MOBILE OVERLAY --- */}
      {/* Closes menu when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 z-50
          flex flex-col justify-between transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 
        `}
      >
        {/* 1. Logo Area */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              STUDY PRO
            </h1>
            <p className="text-xs text-slate-500 tracking-widest mt-1">V2.0 SYSTEM</p>
          </div>
          {/* Close button inside sidebar for convenience on mobile */}
          <button onClick={() => setIsOpen(false)} className="md:hidden text-slate-500">
            <FaTimes />
          </button>
        </div>

        {/* 2. Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsOpen(false)} // Close menu when link clicked (Mobile UX)
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-cyan-600/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className={`text-xl ${isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-white"}`}>
                  {item.icon}
                </span>
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* 3. Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white">
              U
            </div>
            <div className="flex-1">
              <p className="text-xs text-white font-bold">Student</p>
              <p className="text-[10px] text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}