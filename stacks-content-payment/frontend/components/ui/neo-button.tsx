'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NeoButtonProps extends HTMLMotionProps<"button"> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    neoSize?: 'sm' | 'md' | 'lg';
}

export function NeoButton({
    className,
    variant = 'primary',
    neoSize = 'md',
    children,
    ...props
}: NeoButtonProps) {

    const variants = {
        primary: "bg-[#FF6B00] text-black border-black hover:bg-[#FF8533]",
        secondary: "bg-white text-black border-black hover:bg-gray-50",
        danger: "bg-black text-[#FF6B00] border-[#FF6B00]",
        ghost: "bg-transparent text-black border-transparent shadow-none hover:bg-gray-100 border-0"
    };

    const sizes = {
        sm: "px-4 py-2 text-sm",
        md: "px-6 py-3 text-base",
        lg: "px-8 py-4 text-lg"
    };

    const isGhost = variant === 'ghost';
    const borderClass = isGhost ? '' : 'border-4';
    const shadowClass = isGhost ? '' : 'shadow-[4px_4px_0px_0px_#000000]';
    const hoverShadowClass = isGhost ? '' : 'hover:shadow-[8px_8px_0px_0px_#000000]';

    return (
        <motion.button
            className={cn(
                "font-black uppercase tracking-wider transition-colors",
                borderClass,
                shadowClass,
                // hoverShadowClass is handled by variants or direct classes? 
                // Using framer motion for hover lift, but shadow change via class
                variants[variant],
                sizes[neoSize],
                className
            )}
            whileHover={!isGhost ? { y: -4, boxShadow: "8px 8px 0px 0px #000000" } : { scale: 1.05 }}
            whileTap={{ scale: 0.95, y: 0, boxShadow: !isGhost ? "2px 2px 0px 0px #000000" : "none" }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            {...props}
        >
            {children}
        </motion.button>
    );
}
