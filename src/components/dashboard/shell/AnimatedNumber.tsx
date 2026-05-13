'use client';

import CountUp from 'react-countup';
import { cn } from '@/lib/utils';

type AnimatedNumberProps = {
    value: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
    /** Re-run animation when key changes */
    animateKey?: string | number;
};

export function AnimatedNumber({
    value,
    duration = 1.15,
    decimals = 0,
    prefix,
    suffix,
    className,
    animateKey,
}: AnimatedNumberProps) {
    return (
        <span className={cn('tabular-nums tracking-tight', className)}>
            <CountUp
                key={animateKey ?? value}
                end={value}
                duration={duration}
                decimals={decimals}
                prefix={prefix}
                suffix={suffix}
                preserveValue
                separator=","
                decimal="."
            />
        </span>
    );
}
