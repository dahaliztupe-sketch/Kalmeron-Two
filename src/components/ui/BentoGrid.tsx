'use client';
// @ts-nocheck
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { staggerContainer, fadeInUp } from '@/src/lib/motion-presets';

export function BentoGrid({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <motion.div 
      variants={staggerContainer} 
      initial="initial" 
      animate="animate"
      className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min ${className || ''}`}
    >
      {children}
    </motion.div>
  );
}

export function BentoCard({ children, span = 1, className }: { 
  children: React.ReactNode, 
  span?: 1 | 2 | 3 | 4, 
  className?: string 
}) {
  const spanClasses = {
    1: "md:col-span-1 md:row-span-1",
    2: "md:col-span-2 md:row-span-1",
    3: "md:col-span-3 md:row-span-1",
    4: "md:col-span-4 md:row-span-1",
  };
  return (
    <motion.div variants={fadeInUp} className="h-full">
      <GlassCard className={`${spanClasses[span]} ${className || ''} h-full`}>
        {children}
      </GlassCard>
    </motion.div>
  );
}
