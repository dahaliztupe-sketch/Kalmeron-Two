"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Footer } from "./Footer";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" className="min-h-screen bg-[#05070D] text-white flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#05070D]/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <BrandLogo size={36} />
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white px-3 py-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 icon-flip" />
            الرئيسية
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
