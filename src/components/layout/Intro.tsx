"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "ecell-intro-seen"; // also read by the pre-paint script in app/layout.tsx
const ease = [0.76, 0, 0.24, 1] as const;
const soft = [0.22, 1, 0.36, 1] as const;

// public/brand/logo.webp: the emblem sits in the top 57%, the wordmark + tagline below it.
const LOGO = "/brand/logo.webp";
const LOGO_RATIO = 1091 / 1074;
const SPLIT = "57%";

/**
 * First-visit intro: the E-Cell logo resolves (emblem first, then the wordmark), a gold shine sweeps
 * across it, then the two "gates" split open onto the site. Click or press any key to skip.
 */
export function Intro() {
  const [phase, setPhase] = useState<"play" | "gates" | "done">("play");
  const [ready, setReady] = useState(false); // logo image decoded, so the reveal never starts on an empty frame

  useEffect(() => {
    // Already seen / reduced motion: the pre-paint script flagged it and CSS keeps the overlay hidden.
    if (document.documentElement.dataset.intro === "seen") return;
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    document.documentElement.style.overflow = "hidden";
    const skip = () => setPhase((p) => (p === "play" ? "gates" : p));
    addEventListener("keydown", skip);
    addEventListener("pointerdown", skip);
    const img = new Image();
    img.onload = img.onerror = () => setReady(true);
    img.src = LOGO;
    return () => {
      removeEventListener("keydown", skip);
      removeEventListener("pointerdown", skip);
    };
  }, []);

  // The logo plays for 2.9s once it is on screen, then the gates open.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => setPhase((p) => (p === "play" ? "gates" : p)), 2900);
    return () => clearTimeout(t);
  }, [ready]);

  useEffect(() => {
    if (phase !== "gates") return;
    const t = setTimeout(() => {
      setPhase("done");
      document.documentElement.style.overflow = "";
    }, 1300);
    return () => clearTimeout(t);
  }, [phase]);

  const size = {
    width: `min(86vw, calc(64svh * ${LOGO_RATIO}), 528px)`,
    aspectRatio: String(LOGO_RATIO),
  };
  const layer = "absolute inset-0 h-full w-full select-none";

  return (
    <>
      <AnimatePresence>
        {phase !== "done" && (
          <div
            className="intro-overlay fixed inset-0 z-[100] overflow-hidden"
            role="status"
            aria-label="Loading E-Cell VIT"
          >
            {/* the two gates */}
            {[-1, 1].map((dir) => (
              <motion.div
                key={dir}
                className={`absolute inset-y-0 w-1/2 bg-[#070806] ${dir < 0 ? "left-0" : "right-0"}`}
                animate={phase === "gates" ? { x: `${dir * 100}%` } : { x: 0 }}
                transition={{ duration: 1.1, ease, delay: 0.15 }}
              >
                <div className="bg-grid absolute inset-0 opacity-30" />
              </motion.div>
            ))}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: phase === "gates" ? 0 : 1, scale: phase === "gates" ? 1.08 : 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* soft gold glow behind the logo */}
              <motion.div
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(199,165,79,0.16),transparent_55%)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: ready ? 1 : 0 }}
                transition={{ duration: 1.4, ease: soft }}
              />
              {ready && (
                <div className="absolute inset-0 grid place-items-center">
                  <div className="relative" style={size}>
                    {/* emblem: fades up out of a blur */}
                    <motion.img
                      src={LOGO}
                      alt=""
                      draggable={false}
                      className={layer}
                      style={{ clipPath: `inset(0 0 calc(100% - ${SPLIT}) 0)` }}
                      initial={{ opacity: 0, scale: 0.9, filter: "blur(14px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      transition={{ duration: 1.2, ease: soft }}
                    />
                    {/* wordmark + tagline: wipes out from the centre */}
                    <motion.img
                      src={LOGO}
                      alt=""
                      draggable={false}
                      className={layer}
                      initial={{ clipPath: `inset(${SPLIT} 50% 0% 50%)`, opacity: 0 }}
                      animate={{ clipPath: `inset(${SPLIT} 0% 0% 0%)`, opacity: 1 }}
                      transition={{
                        clipPath: { delay: 0.8, duration: 1, ease: soft },
                        opacity: { delay: 0.8, duration: 0.3 },
                      }}
                    />
                    {/* shine: a gold highlight that only lights up the logo's own shapes */}
                    <motion.div
                      aria-hidden
                      className="pointer-events-none absolute inset-0"
                      style={{
                        backgroundImage:
                          "linear-gradient(105deg, transparent 42%, rgba(255,246,214,0.85) 50%, transparent 58%)",
                        backgroundSize: "250% 100%",
                        backgroundRepeat: "no-repeat",
                        WebkitMaskImage: `url(${LOGO})`,
                        maskImage: `url(${LOGO})`,
                        WebkitMaskSize: "100% 100%",
                        maskSize: "100% 100%",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                      }}
                      initial={{ backgroundPosition: "100% 0%" }}
                      animate={{ backgroundPosition: "0% 0%" }}
                      transition={{ delay: 1.7, duration: 1, ease: "easeInOut" }}
                    />
                  </div>
                </div>
              )}
              <motion.div className="absolute bottom-8 left-1/2 h-px w-40 -translate-x-1/2 bg-line">
                <motion.div
                  className="h-full origin-left bg-gold"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: ready ? 1 : 0 }}
                  transition={{ duration: 2.8, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
