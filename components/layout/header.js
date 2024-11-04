"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import MobileMenu from "@/components/layout/mobile-menu";
import { Button } from "@/components/ui/button";
import ThemeToggle from '@/components/layout/theme-toggle';
import FormulaELogo from '@/public/images/formula-e-logo.png';
const menuItems = [
  { name: "Início", href: "#home" },
  { name: "Recursos", href: "#features" },
  { name: "Tecnologia", href: "#technology" },
  { name: "Como Funciona", href: "#how-it-works" },
  { name: "Estatísticas", href: "#stats" },
];
import { useTheme } from "next-themes";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme()

  const headerVariants = {
    top: { backgroundColor: theme === "light" ? "rgba(0, 0, 0, 0)" : "rgba(255, 255, 255, 0)", height: "80px" },
    scrolled: { backgroundColor: theme === "light" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0 )", height: "60px" },
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        initial="top"
        animate={isScrolled ? "scrolled" : "top"}
        variants={headerVariants}
      >
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src={FormulaELogo}
              alt="Logo da Fórmula E"
              width={240}
              height={80}
              className={isScrolled ? "" : "filter brightness-0 invert"}
            />
          </Link>
          <nav className="hidden md:flex space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`hover:text-primary transition-colors duration-300 ${
                  isScrolled ? theme === "light" ? "text-gray-800" : "text-white" : theme === "light" ? "text-white" : "text-white"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <ThemeToggle isScrolled={isScrolled} />
            <Button
              className="md:hidden"
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className={`h-6 w-6 ${isScrolled ? theme === "light" ? "text-gray-800" : "text-white" : theme === "light" ? "text-white" : "text-white"}`} />
            </Button>
          </div>
        </div>
      </motion.header>
      {isMobileMenuOpen && (
        <MobileMenu
          menuItems={menuItems}
          closeMenu={() => setIsMobileMenuOpen(false)}
          isScrolled={isScrolled}
        />
      )}
    </>
  );
}
