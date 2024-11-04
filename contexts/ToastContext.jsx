"use client";

import React, { createContext, useContext } from "react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";

const ToastContext = createContext();

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const { toast } = useToast();

  const showToast = (message, type = "default", action) => {
    toast({
      variant: type === "error" ? "destructive" : "default",
      title: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      action: action ? (
        <ToastAction altText={action.label} onClick={action.onClick}>
          {action.label}
        </ToastAction>
      ) : undefined,
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};
