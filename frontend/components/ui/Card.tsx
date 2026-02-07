'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'outline' | 'ghost';
    isHoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', isHoverable = false, children, ...props }, ref) => {

        const variants = {
            default: 'bg-card/40 backdrop-blur-xl border border-border shadow-lg shadow-black/5',
            glass: 'glass-dark border border-white/10 shadow-2xl shadow-black/40',
            outline: 'bg-transparent border border-border hover:border-primary/30 transition-colors',
            ghost: 'bg-transparent hover:bg-white/5 transition-colors',
        };

        return (
            <motion.div
                ref={ref}
                whileHover={isHoverable ? { y: -4, scale: 1.01, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' } : {}}
                className={cn(
                    'rounded-2xl overflow-hidden transition-all duration-300',
                    variants[variant],
                    className
                )}
                {...(props as any)}
            >
                {children}
            </motion.div>
        );
    }
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('p-6 space-y-1.5', className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn('text-xl font-bold text-text-primary leading-none tracking-tight', className)} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn('text-sm text-text-secondary', className)} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('p-6 pt-0', className)} {...props} />
);

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn('p-6 pt-0 flex items-center', className)} {...props} />
);

Card.displayName = 'Card';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
