import Link from "next/link";
import { FaClock, FaChartBar, FaListUl, FaBell, FaCog, FaCalculator } from "react-icons/fa";

export default function Home() {
  const menuItems = [
    { title: "Focus Timer", icon: <FaClock size={32} />, href: "/focus", color: "text-pink-400", desc: "Pomodoro & Mind Dump" },
    { title: "Analytics", icon: <FaChartBar size={32} />, href: "/dashboard", color: "text-purple-400", desc: "Stats & Heatmaps" },
    { title: "Mission Control", icon: <FaListUl size={32} />, href: "/planner", color: "text-blue-400", desc: "Kanban Board" },
    { title: "Habit Protocol", icon: <FaBell size={32} />, href: "/habit", color: "text-green-400", desc: "Daily Trackers" },
    { title: "Smart Alarm", icon: <FaBell size={32} />, href: "/alarms", color: "text-red-400", desc: "Math Wake-up" },
    { title: "System Config", icon: <FaCog size={32} />, href: "/settings", color: "text-gray-400", desc: "Settings" },
  ];

  return (
    <main className="min-h-screen p-8 flex flex-col items-center justify-center">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 mb-4">
          STUDY PRO
        </h1>
        <p className="text-slate-400 text-lg">Advanced Productivity Architecture</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
        {menuItems.map((item, index) => (
          <Link href={item.href} key={index} className="group">
            <div className="glass-card p-8 rounded-2xl hover:bg-slate-800/80 transition-all duration-300 hover:-translate-y-2 cursor-pointer h-full border border-slate-700 hover:border-cyan-500/50">
              <div className={`mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h2 className="text-2xl font-bold mb-2 text-white">{item.title}</h2>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}