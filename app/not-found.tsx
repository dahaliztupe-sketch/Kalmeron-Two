"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveRight, Ghost } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0F] text-white p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-lg"
      >
        <div className="relative inline-block">
            <Ghost className="w-24 h-24 text-neutral-800" />
            <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
            >
                <span className="text-6xl font-black text-[rgb(var(--gold))]">404</span>
            </motion.div>
        </div>
        
        <div className="space-y-2">
            <h1 className="text-3xl font-bold">عذراً.. يبدو أنك ضللت الطريق!</h1>
            <p className="text-neutral-400 text-lg leading-relaxed">
              هذه الصفحة غير موجودة في متحفنا أو لوحة تحكمنا. ربما تم نقلها أو حذفها، لكن لا تقلق.. الطريق للنجاح دائماً ما يتطلب بعض التغيير في المسار.
            </p>
        </div>

        <Link href="/dashboard" passHref>
          <Button className="bg-[rgb(var(--gold))] text-black hover:bg-[#d9a31a] font-bold h-14 px-8 rounded-2xl text-lg group">
            العودة للوحة التحكم <MoveRight className="mr-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
