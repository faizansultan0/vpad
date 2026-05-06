import { create } from "zustand";
import { persist } from "zustand/middleware";

const applyThemeClass = (resolved) => {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
  }
};

const getSystemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

let mediaQueryCleanup = null;

const useThemeStore = create(
  persist(
    (set, get) => ({
      preference: "dark",
      resolved: "dark",

      setPreference: (value) => {
        const resolved =
          value === "system" ? getSystemTheme() : value;

        // Clean up any existing system listener
        if (mediaQueryCleanup) {
          mediaQueryCleanup();
          mediaQueryCleanup = null;
        }

        // If system, attach listener
        if (value === "system") {
          const mq = window.matchMedia("(prefers-color-scheme: dark)");
          const handler = (e) => {
            const newResolved = e.matches ? "dark" : "light";
            set({ resolved: newResolved });
            applyThemeClass(newResolved);
          };
          mq.addEventListener("change", handler);
          mediaQueryCleanup = () => mq.removeEventListener("change", handler);
        }

        set({ preference: value, resolved });
        applyThemeClass(resolved);
      },

      init: () => {
        const { preference } = get();
        const resolved =
          preference === "system" ? getSystemTheme() : preference;

        // Clean up any existing listener
        if (mediaQueryCleanup) {
          mediaQueryCleanup();
          mediaQueryCleanup = null;
        }

        // If system, attach listener
        if (preference === "system") {
          const mq = window.matchMedia("(prefers-color-scheme: dark)");
          const handler = (e) => {
            const newResolved = e.matches ? "dark" : "light";
            set({ resolved: newResolved });
            applyThemeClass(newResolved);
          };
          mq.addEventListener("change", handler);
          mediaQueryCleanup = () => mq.removeEventListener("change", handler);
        }

        set({ resolved });
        applyThemeClass(resolved);
      },

      /** Force a specific resolved theme without changing preference (used by PublicLayout). */
      forceResolved: (value) => {
        applyThemeClass(value);
      },

      /** Re-apply the store's actual resolved theme (called when leaving PublicLayout). */
      restoreResolved: () => {
        const { resolved } = get();
        applyThemeClass(resolved);
      },
    }),
    {
      name: "vpad-theme",
      partialize: (state) => ({ preference: state.preference }),
    },
  ),
);

export default useThemeStore;
