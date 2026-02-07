'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'rectangular' | 'circular' | 'text';
}

function Skeleton({
    className,
    variant = 'rectangular',
    ...props
}: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse bg-muted',
                variant === 'rectangular' && 'rounded-radius-base',
                variant === 'circular' && 'rounded-radius-full',
                variant === 'text' && 'h-4 w-full rounded-radius-sm',
                className
            )}
            {...props}
        />
    );
}

export { Skeleton };
