import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

export default function GlassCard({
  children,
  className = "",
  tilt = true,
  glowOnHover = true,
  onClick,
  as: Component = "div",
  ...props
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState("");
  const [glowPos, setGlowPos] = useState({ x: "50%", y: "50%" });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e) => {
      if (!tilt || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      setTransform(
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
      );
      setGlowPos({
        x: `${(x / rect.width) * 100}%`,
        y: `${(y / rect.height) * 100}%`,
      });
    },
    [tilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("");
    setIsHovered(false);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  return (
    <motion.div
      ref={cardRef}
      className={`glass-card-glow cursor-glow ${className}`}
      style={{
        transform: isHovered ? transform : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)",
        transition: "transform 0.2s ease-out",
        "--mouse-x": glowPos.x,
        "--mouse-y": glowPos.y,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      {...props}
    >
      {/* Inner glow that follows cursor */}
      {glowOnHover && isHovered && (
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: 120,
            height: 120,
            left: glowPos.x,
            top: glowPos.y,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 60%)",
            zIndex: 0,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
