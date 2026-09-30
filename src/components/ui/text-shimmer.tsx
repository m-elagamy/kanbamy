/* eslint-disable react-hooks/static-components */
'use client';
import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export type TextShimmerProps = {
  children: string;
  as?: React.ElementType;
  className?: string;
  duration?: number;
  spread?: number;
};

function TextShimmerComponent({
  children,
  as: Component = 'p',
  className,
  duration = 2,
  spread = 2,
}: TextShimmerProps) {
  const MotionComponent = useMemo(() => motion.create(Component), [Component]);

  const dynamicSpread = useMemo(() => {
    return children.length * spread;
  }, [children, spread]);

  return (
    <MotionComponent
      className={cn(
        'relative inline-block text-transparent',
        className
      )}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={
        {
          color: 'transparent',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          backgroundImage: `linear-gradient(90deg, transparent calc(50% - ${dynamicSpread}px), var(--primary), transparent calc(50% + ${dynamicSpread}px)), linear-gradient(color-mix(in oklab, var(--muted-foreground) 12%, var(--foreground) 88%), color-mix(in oklab, var(--muted-foreground) 12%, var(--foreground) 88%))`,
          backgroundSize: '250% 100%, auto',
          backgroundRepeat: 'no-repeat, padding-box',
        } as React.CSSProperties
      }
    >
      {children}
    </MotionComponent>
  );
}

export const TextShimmer = React.memo(TextShimmerComponent);
