import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

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

export default function AnimatedBackground({ variant = "hero", className = "", showMesh = false, showParticles = false }) {
  const orbs = orbConfigs[variant] || orbConfigs.hero;
  const [init, setInit] = useState(false);

  // Force showParticles for auth and minimal variants to ensure they get the live background
  const shouldShowParticles = showParticles || variant === "auth" || variant === "minimal";

  useEffect(() => {
    if (shouldShowParticles && !init) {
      initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      }).then(() => {
        setInit(true);
      });
    }
  }, [shouldShowParticles, init]);

  const particlesOptions = {
    background: {
      color: { value: "transparent" },
    },
    fpsLimit: 60,
    particles: {
      color: { value: ["#8b5cf6", "#a855f7", "#ec4899"] },
      links: {
        color: "#8b5cf6",
        distance: 150,
        enable: true,
        opacity: 0.2,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: true,
        speed: 1,
        straight: false,
      },
      number: { density: { enable: true, area: 800 }, value: 40 },
      opacity: { value: 0.3 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  };

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

      {/* Floating live particle dots */}
      {shouldShowParticles && init && (
        <Particles
          id={`tsparticles-${variant}`}
          options={particlesOptions}
          className="absolute inset-0 z-0 opacity-60"
        />
      )}
    </div>
  );
}
