'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';

type AnimateInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  offset?: number;
  once?: boolean;
  type?: 'spring' | 'tween';
};

export function AnimateIn({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 0.5,
  offset = 20,
  once = true,
  type = 'spring',
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.1 });

  const directionToVariant = (): Variants => {
    const base = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          type,
          duration,
          delay,
        },
      },
    };

    switch (direction) {
      case 'up':
        return {
          ...base,
          hidden: { ...base.hidden, y: offset },
          visible: { ...base.visible, y: 0 },
        };
      case 'down':
        return {
          ...base,
          hidden: { ...base.hidden, y: -offset },
          visible: { ...base.visible, y: 0 },
        };
      case 'left':
        return {
          ...base,
          hidden: { ...base.hidden, x: offset },
          visible: { ...base.visible, x: 0 },
        };
      case 'right':
        return {
          ...base,
          hidden: { ...base.hidden, x: -offset },
          visible: { ...base.visible, x: 0 },
        };
      default:
        return base;
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={directionToVariant()}
    >
      {children}
    </motion.div>
  );
}
