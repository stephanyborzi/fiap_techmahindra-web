'use client';

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function ThemeToggle({ isScrolled }) {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={`${isScrolled ? theme === "light" ? "text-gray-800" : "text-white" : theme === "light" ? "text-white" : "text-white"}`}
        >
          <Sun className={`h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all ${theme === 'dark' ? 'hidden' : ''}`} />
          <Moon className={`h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all ${theme === 'dark' ? '' : 'hidden'}`} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`${isScrolled ? theme === "light" ? "text-gray-800" : "text-white" : theme === "light" ? "text-white" : "text-white"}`} align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}