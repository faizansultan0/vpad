import { useCallback } from "react";
import Particles from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles-bg"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        fpsLimit: 60,
        particles: {
          number: {
            value: 60,
            density: { enable: true, area: 1000 },
          },
          color: { value: ["#8b5cf6", "#667eea", "#a78bfa", "#6366f1"] },
          shape: { type: "circle" },
          opacity: {
            value: { min: 0.15, max: 0.45 },
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.05,
              sync: false,
            },
          },
          size: {
            value: { min: 1, max: 3 },
            animation: {
              enable: true,
              speed: 1,
              minimumValue: 0.5,
              sync: false,
            },
          },
          move: {
            enable: true,
            speed: 0.4,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" },
          },
          links: {
            enable: true,
            distance: 150,
            color: "#8b5cf6",
            opacity: 0.15,
            width: 1,
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "grab" },
            resize: { enable: true },
          },
          modes: {
            grab: {
              distance: 120,
              links: {
                opacity: 0.15,
                color: "#8b5cf6",
              },
            },
          },
        },
        detectRetina: true,
        background: { color: "transparent" },
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
