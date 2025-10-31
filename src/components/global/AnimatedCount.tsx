"use client";

import { useCountUp } from "react-countup";
import { useRef } from "react";

export default function AnimatedCount({
  end,
  suffix,
}: {
  end: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLElement>(null!);

  useCountUp({
    ref,
    start: 0,
    end,
    duration: 2.5,
    separator: ",",
    enableScrollSpy: true,
    scrollSpyOnce: true,
  });

  return (
    <span aria-hidden="false">
      <span ref={ref as React.RefObject<HTMLSpanElement>} />
      {suffix && (
        <span className="ml-0.5 inline-block opacity-90">{suffix}</span>
      )}
    </span>
  );
}
