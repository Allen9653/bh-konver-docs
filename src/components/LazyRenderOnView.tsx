import { useEffect, useRef, useState, type ReactNode } from "react";

interface LazyRenderOnViewProps {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
}

export const LazyRenderOnView = ({
  children,
  fallback = null,
  rootMargin = "300px 0px",
}: LazyRenderOnViewProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || isVisible) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return <div ref={containerRef}>{isVisible ? children : fallback}</div>;
};