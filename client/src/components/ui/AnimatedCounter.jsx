import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

export default function AnimatedCounter({
  value,
  duration = 2,
  suffix = "",
  prefix = "",
  className = "",
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    // Parse numeric value (handles "10,000+", "500+", etc.)
    const numericStr = String(value).replace(/[^0-9.]/g, "");
    const target = parseFloat(numericStr) || 0;

    if (target === 0) {
      setDisplayValue(0);
      return;
    }

    const startTime = Date.now();
    const durationMs = duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  // Reconstruct formatted value
  const formatValue = () => {
    const originalStr = String(value);
    const hasSuffix = originalStr.match(/[^0-9,.]+(.*)/);
    const extraSuffix = hasSuffix ? hasSuffix[0] : "";
    const hasCommas = originalStr.includes(",");

    let formatted = hasCommas
      ? displayValue.toLocaleString()
      : String(displayValue);

    return `${prefix}${formatted}${extraSuffix}${suffix}`;
  };

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4 }}
    >
      {formatValue()}
    </motion.span>
  );
}
