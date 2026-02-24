"use client";

import { useState, useEffect } from "react";

export default function useResizeObserver(ref: React.RefObject<HTMLElement | SVGElement | null>) {
  const [dimensions, setDimensions] = useState({ w: 900, h: 620 });

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ w: width, h: height });
    });

    ro.observe(el);

    return () => ro.disconnect();
  }, [ref]);

  return dimensions;
}
