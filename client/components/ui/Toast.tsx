"use client";

import React from "react";
import { motion } from "framer-motion";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
}

export function Toast({ message, type = "success" }: ToastProps) {
  const styles = {
    success: "border-[#B8FF3C]/30 bg-slate-950/90 text-[#B8FF3C]",
    error: "border-red-500/50 bg-red-950/90 text-red-300",
    info: "border-blue-500/30 bg-slate-950/90 text-blue-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-[110px] sm:bottom-10 left-6 right-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 px-5 py-3.5 sm:px-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl text-xs sm:text-sm font-black z-[300] border transition-all sm:w-auto text-center sm:text-left ${styles[type]}`}
    >
      <div className="flex items-center justify-center sm:justify-start gap-3">
        {type === "success" && <span className="w-2 h-2 rounded-full bg-[#B8FF3C] animate-pulse shrink-0" />}
        {type === "error" && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />}
        {type === "info" && <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />}
        <span className="whitespace-normal leading-tight">{message}</span>
      </div>
    </motion.div>
  );
}
