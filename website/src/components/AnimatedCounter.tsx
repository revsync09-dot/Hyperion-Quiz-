"use client";
import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface CounterProps {
  target: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export default function AnimatedCounter({ target, duration = 2, suffix = "", prefix = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !ref.current) return;

    let start = 0;
    const step = target / (duration * 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        start = target;
        clearInterval(timer);
      }
      if (ref.current) {
        ref.current.textContent = prefix + Math.floor(start).toLocaleString() + suffix;
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [inView, target, duration, prefix, suffix]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-[#6c63ff] to-[#9d4edd] bg-clip-text text-transparent"
    >
      {prefix}0{suffix}
    </motion.span>
  );
}
