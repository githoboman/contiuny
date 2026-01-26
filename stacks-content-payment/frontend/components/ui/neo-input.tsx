'use client';

import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, HTMLMotionProps } from "framer-motion";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Wrapping input in motion not strictly necessary for simple inputs but good for consistency
// Using a regular input here for better compatibility, wrapping in a div for effects if needed
// Or just applying classes directly.

export interface NeoInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

export const NeoInput = React.forwardRef<HTMLInputElement, NeoInputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-12 w-full border-4 border-black bg-white px-3 py-2 text-lg font-bold ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50",
                    "focus:outline-none focus:shadow-[4px_4px_0px_0px_#000000] focus:border-[#FF6B00] transition-all duration-200",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
NeoInput.displayName = "NeoInput";
