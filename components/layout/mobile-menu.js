'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";

export default function MobileMenu({ menuItems, closeMenu, isScrolled }) {
  const { theme } = useTheme();

  const getBgColor = () => {
    if (isScrolled) {
      return theme === 'dark' ? 'bg-gray-900' : 'bg-white';
    }
    return 'bg-black bg-opacity-80';
  };

  const getTextColor = () => {
    if (isScrolled) {
      return theme === 'dark' ? 'text-white' : 'text-gray-800';
    }
    return 'text-white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed inset-0 z-50 ${getBgColor()} pt-16`}
    >
      <div className="container mx-auto px-4 py-4 flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={closeMenu}
          className={getTextColor()}
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="container mx-auto px-4 py-8 flex flex-col space-y-6">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`hover:text-primary transition-colors duration-300 text-xl ${getTextColor()}`}
            onClick={closeMenu}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </motion.div>
  );
}