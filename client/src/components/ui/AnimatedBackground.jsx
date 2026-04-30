import { motion } from "framer-motion";

const orbConfigs = {
  hero: [
    { size: "w-[500px] h-[500px]", color: "orb-primary", position: "top-[-10%] right-[-5%]", animation: "animate-blob" },
    { size: "w-[400px] h-[400px]", color: "orb-secondary", position: "bottom-[-15%] left-[-10%]", animation: "animate-blob-delayed" },
    { size: "w-[300px] h-[300px]", color: "orb-accent", position: "top-[40%] left-[30%]", animation: "animate-blob-slow" },
    { size: "w-[200px] h-[200px]", color: "orb-primary", position: "top-[20%] right-[25%]", animation: "animate-float" },
  ],
  mesh: [
    { size: "w-[350px] h-[350px]", color: "orb-primary", position: "top-[10%] right-[10%]", animation: "animate-blob" },
    { size: "w-[250px] h-[250px]", color: "orb-secondary", position: "bottom-[10%] left-[15%]", animation: "animate-blob-delayed" },
  ],
  particles: [
    { size: "w-[300px] h-[300px]", color: "orb-primary", position: "top-[5%] right-[5%]", animation: "animate-blob-slow" },
    { size: "w-[200px] h-[200px]", color: "orb-secondary", position: "bottom-[20%] left-[10%]", animation: "animate-blob" },
  ],
  auth: [
    { size: "w-[400px] h-[400px]", color: "orb-primary", position: "top-[-20%] left-[-10%]", animation: "animate-blob" },
    { size: "w-[350px] h-[350px]", color: "orb-secondary", position: "bottom-[-10%] right-[-15%]", animation: "animate-blob-delayed" },
    { size: "w-[250px] h-[250px]", color: "orb-accent", position: "top-[50%] left-[40%]", animation: "animate-blob-slow" },
  ],
  minimal: [
    { size: "w-[250px] h-[250px]", color: "orb-primary", position: "top-[10%] right-[10%]", animation: "animate-float" },
    { size: "w-[200px] h-[200px]", color: "orb-secondary", position: "bottom-[15%] left-[5%]", animation: "animate-float-delayed" },
  ],
};

const particleDots = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  x: Math.random() * 100,
  y: Math.random() * 100,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 5,
}));

export default function AnimatedBackground({ variant = "hero", className = "", showMesh = false, showParticles = false }) {
  const orbs = orbConfigs[variant] || orbConfigs.hero;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Gradient orbs */}
      {orbs.map((orb, index) => (
        <div
          key={index}
          className={`orb ${orb.size} ${orb.color} ${orb.position} ${orb.animation}`}
        />
      ))}

      {/* Mesh grid overlay */}
      {showMesh && (
        <div className="absolute inset-0 mesh-grid opacity-60" />
      )}

      {/* Floating particle dots */}
      {showParticles && (
        <div className="particle-field">
          {particleDots.map((dot) => (
            <motion.div
              key={dot.id}
              className="particle"
              style={{
                width: dot.size,
                height: dot.size,
                left: `${dot.x}%`,
                top: `${dot.y}%`,
              }}
              animate={{
                y: [0, -30, 10, -20, 0],
                x: [0, 15, -10, 5, 0],
                opacity: [0.2, 0.5, 0.3, 0.6, 0.2],
              }}
              transition={{
                duration: dot.duration,
                delay: dot.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
