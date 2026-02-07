'use client';

import * as React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

        const variants = {
            primary: 'bg-primary text-white shadow-lg shadow-primary/25 hover:brightness-110 active:scale-95 border border-primary/20 backdrop-blur-md transition-all',
            secondary: 'bg-secondary text-white shadow-lg shadow-secondary/25 hover:brightness-110 active:scale-95 border border-secondary/20 backdrop-blur-md transition-all',
            outline: 'border border-border bg-card/40 hover:bg-muted hover:border-border text-foreground backdrop-blur-md transition-all duration-300',
            ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-colors',
            danger: 'bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 active:bg-destructive/30 backdrop-blur-md',
            accent: 'bg-accent text-accent-foreground shadow-lg shadow-accent/25 hover:brightness-110 active:scale-95 border border-accent/20 backdrop-blur-md transition-all',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-xs rounded-lg',
            md: 'px-5 py-2 text-sm font-semibold rounded-xl',
            lg: 'px-8 py-3 text-base font-bold rounded-2xl',
            icon: 'p-2 rounded-xl',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={!disabled && !isLoading ? { scale: 1.02, y: -1, boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)' } : {}}
                whileTap={!disabled && !isLoading ? { scale: 0.98 } : {}}
                disabled={disabled || isLoading}
                className={cn(
                    'inline-flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 disabled:opacity-50 disabled:pointer-events-none',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...(props as any)}
            >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
                {!isLoading && leftIcon && <span className="flex-shrink-0 opacity-80 group-hover:opacity-100">{leftIcon}</span>}
                <span className={cn(isLoading && 'opacity-0', 'relative z-10')}>{children}</span>
                {!isLoading && rightIcon && <span className="flex-shrink-0 opacity-80 group-hover:opacity-100">{rightIcon}</span>}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
