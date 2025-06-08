import Lenis from "@/components/wrappers/lenis";
import dynamic from "next/dynamic";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { IconHome } from "@tabler/icons-react";
import {  FaFlag, FaLock, FaUserGroup } from "react-icons/fa6";

import Herotwo from "@/components/ui/herotwo";
import ScrollUp from "@/components/custom/ScrollUp";
import Features from "@/components/custom/Features";
import Hero from "@/components/custom/Hero";
import Pricing from "@/components/custom/Pricing";
import About from "@/components/custom/About";
import Contact from "@/components/custom/Contact";
import CallToAction from "@/components/custom/CallToAction";



;
export default function Home() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <IconHome className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    
    {
      name: "Login",
      link: "/login",
      icon: <FaLock className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Register",
      link: "/signup",
      icon: <FaFlag className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Dashboard",
      link: "/dashboard",
      icon: <FaFlag className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
    {
      name: "Feedback",
      link: "/feedback",
      icon: <FaFlag className="h-4 w-4 text-neutral-500 dark:text-white" />,
    },
  ];
  return (
    <main>
      <FloatingNav navItems={navItems} />
      <ScrollUp />
      <Hero />
      <Features />
      <About />
      <CallToAction />
      <Pricing />
      <Contact />
    </main>

  );
}
