"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PieChart, User, Settings, LogOut, Newspaper, TrendingUp, BookOpen, MessageCircle, DollarSign, BarChart2, Bitcoin } from "lucide-react";
import { Pacifico } from "next/font/google";
import { useEffect, useState } from "react";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

export default function Sidebar() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
    } else {
      const decodedUser = JSON.parse(atob(token.split(".")[1]));
      setUser(decodedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const navItems = [
    { href: "/portfolio", icon: <PieChart size={20} className="text-blue-600" />, text: "Portfolio" },
    { href: "/dashboard", icon: <User size={20} className="text-blue-600" />, text: "Profile" },
    { href: "/news", icon: <Newspaper size={20} className="text-blue-600" />, text: "News" },
    { href: "/financialpathflow", icon: <TrendingUp size={20} className="text-blue-600" />, text: "Financial Path" },
    { href: "/mutual-funds", icon: <DollarSign size={20} className="text-blue-600" />, text: "Mutual Funds" },
    { href: "/stock", icon: <BarChart2 size={20} className="text-blue-600" />, text: "Stocks" },
    { href: "/crypto", icon: <Bitcoin size={20} className="text-blue-600" />, text: "Crypto" },
    { href: "/learning", icon: <BookOpen size={20} className="text-blue-600" />, text: "Learning" },
    { href: "/chat-help", icon: <MessageCircle size={20} className="text-blue-600" />, text: "Chat Help" },
    { href: "/settings", icon: <Settings size={20} className="text-blue-600" />, text: "Settings" },
  ];

  return (
    <motion.aside 
      className="w-64 overflow-scroll fixed h-screen bg-white border-r border-blue-200 p-6 flex flex-col justify-between"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div>
        <motion.h1 
          className={cn(
            "text-2xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400",
            pacifico.className
          )}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          FinFlow
        </motion.h1>

        <nav className="space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link
                href={item.href}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-100 transition-all group"
              >
                {item.icon}
                <span className="text-gray-700 group-hover:text-blue-800">{item.text}</span>
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>

      <div>
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center space-x-3 p-3 mt-4 rounded-lg bg-blue-100"
          >
            <User size={24} className="text-indigo-600" />
            <span className="text-gray-800 text-[1.2rem]">{user.name}</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="border-t border-blue-200 pt-4 mt-4"
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-100 text-red-600 hover:text-red-800 transition-all group"
          >
            <LogOut className="group-hover:scale-110 transition-transform" />
            <span>Logout</span>
          </button>
        </motion.div>
      </div>
    </motion.aside>
  );
}