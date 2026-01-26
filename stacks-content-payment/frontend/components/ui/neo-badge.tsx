'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NeoBadgeProps extends HTMLMotionProps<"span"> {
    variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
    animatePulse?: boolean;
}

export function NeoBadge({
    className,
    variant = 'primary',
    animatePulse = false,
    children,
    ...props
}: NeoBadgeProps) {

    const variants = {
        primary: "bg-[#FF6B00] text-black border-black",
        secondary: "bg-black text-white border-black",
        outline: "bg-transparent text-black border-black",
        success: "bg-[#00FF00] text-black border-black",
        warning: "bg-[#FFD23F] text-black border-black",
        error: "bg-[#FF0000] text-white border-black"
    };

    return (
        <motion.span
            className={cn(
                "inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wide border-2",
                variants[variant],
                className
            )}
            animate={animatePulse ? { scale: [1, 1.05, 1] } : undefined}
            transition={animatePulse ? { repeat: Infinity, duration: 2 } : undefined}
            {...props}
        >
            {children}
        </motion.span>
    );
}
