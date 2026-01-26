'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NeoCardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'highlight' | 'dark';
}

export function NeoCard({
    className,
    variant = 'default',
    children,
    ...props
}: NeoCardProps) {

    const variants = {
        default: "bg-white text-black border-black border-4 shadow-[8px_8px_0px_0px_#000000]",
        highlight: "bg-[#FF6B00] text-black border-black border-4 shadow-[12px_12px_0px_0px_#000000]",
        dark: "bg-black text-[#FF6B00] border-[#FF6B00] border-4 shadow-[8px_8px_0px_0px_#FF6B00]"
    };

    return (
        <motion.div
            className={cn(
                "p-6",
                variants[variant],
                className
            )}
            whileHover={variant !== 'dark' ? {
                y: -6,
                boxShadow: variant === 'highlight'
                    ? "16px 16px 0px 0px #000000"
                    : "12px 12px 0px 0px #000000"
            } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            {...props}
        >
            {children}
        </motion.div>
    );
}
