"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Link from "next/link";
import "./parallax-hero.css";

/** The six chairs in the Tank. Each one links to the Divisions section further down the page. */
const chairs = ["Tech", "Events", "PR", "Creatives", "Marketing", "Networking"];

function Arrow({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function TankBackdrop() {
  return (
    <div className="tank-backdrop">
      <div className="tank-led tank-led-left" />
      <div className="tank-led tank-led-center">
        <span>E-CELL</span>
        <small>VIT WADALA</small>
      </div>
      <div className="tank-led tank-led-right" />
      <div className="tank-beam tank-beam-one" />
      <div className="tank-beam tank-beam-two" />
      <div className="tank-beam tank-beam-three" />
      <div className="tank-chair-line">
        {chairs.map((label) => (
          <div className="tank-chair" key={label}>
            <span className="tank-chair-label">{label}</span>
            <span className="tank-chair-head" />
            <span className="tank-chair-back" />
            <span className="tank-chair-seat" />
            <Link href="/#divisions" className="tank-chair-link" aria-label={`View the ${label} team`}>
              <Arrow className="size-3.5" />
            </Link>
          </div>
        ))}
      </div>
      <div className="pitch-floor">
        <span className="pitch-floor-ring" />
        <span className="pitch-floor-core" />
      </div>
      <div className="audience audience-left">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className="audience audience-right">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Pinned scroll intro: corridor, doors open, then the Tank.
 * About 2 scrolls of travel, then the page continues as normal.
 * Drop-in replacement for <Hero /> (same props).
 */
export function ParallaxHero({ tagline }: { kicker?: string; tagline: string }) {
  const introRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const intro = introRef.current;
    if (!intro) return;
    const root = document.documentElement;

    const releaseNav = () => {
      delete root.dataset.heroNav;
      root.style.removeProperty("--hero-nav-opacity");
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return; // tank shows directly (CSS), navbar behaves as normal

    let target = 0;
    let current = 0;
    let frame = 0;
    let released = false;
    const clamp = (v: number) => Math.min(Math.max(v, 0), 1);

    const render = () => {
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.0005) current = target;

      const door = clamp((current - 0.65) / 0.2);
      const tankReveal = clamp((current - 0.62) / 0.23);
      const corridorFade = 1 - clamp((current - 0.85) / 0.15);
      const bloom = Math.max(1 - Math.abs(current - 0.78) / 0.12, 0);
      const pulse = Math.max(1 - Math.abs(current - 0.53) / 0.13, 0);
      const bob = Math.sin(current * Math.PI * 24) * 1.5 * (1 - door);
      const chairsIn = clamp((current - 0.85) / 0.15);
      const navbar = clamp((current - 0.9) / 0.08);

      intro.style.setProperty("--intro-progress", current.toString());
      intro.style.setProperty("--intro-travel", clamp(current / 0.65).toString());
      intro.style.setProperty("--intro-door", door.toString());
      intro.style.setProperty("--intro-tank-reveal", tankReveal.toString());
      intro.style.setProperty("--intro-corridor-opacity", corridorFade.toString());
      intro.style.setProperty("--intro-bloom", bloom.toString());
      intro.style.setProperty("--intro-pulse", pulse.toString());
      intro.style.setProperty("--intro-bob", `${bob}px`);
      intro.style.setProperty("--intro-chairs", chairsIn.toString());

      // Navbar: hidden until the doors have opened and the chairs are in, then handed back to the site's own behaviour.
      if (released) {
        releaseNav();
      } else {
        root.dataset.heroNav = navbar > 0.02 ? "show" : "hidden";
        root.style.setProperty("--hero-nav-opacity", navbar.toString());
      }

      progressRef.current?.style.setProperty("transform", `scaleY(${current})`);
      progressRef.current?.parentElement?.style.setProperty("opacity", (1 - current).toString());

      frame = current !== target ? window.requestAnimationFrame(render) : 0;
    };

    const readProgress = () => {
      const bounds = intro.getBoundingClientRect();
      const distance = Math.max(intro.offsetHeight - window.innerHeight, 1);
      target = clamp(-bounds.top / distance);
      released = bounds.bottom <= window.innerHeight + 1; // intro has unpinned: normal page scroll from here
      if (!frame) frame = window.requestAnimationFrame(render);
    };

    readProgress();
    window.addEventListener("scroll", readProgress, { passive: true });
    window.addEventListener("resize", readProgress);
    return () => {
      window.removeEventListener("scroll", readProgress);
      window.removeEventListener("resize", readProgress);
      if (frame) window.cancelAnimationFrame(frame);
      releaseNav();
    };
  }, []);

  const idx = (name: string, value: number | string) => ({ [name]: value }) as CSSProperties;

  return (
    <>
      <div className="intro-scroll-progress" aria-hidden="true">
        <div ref={progressRef} />
      </div>
      <section ref={introRef} className="tank-intro-scroll">
        <div className="tank-intro-sticky">
          <div className="intro-tank-layer">
            <TankBackdrop />
          </div>
          <div className="entrance-corridor">
            <div className="entrance-camera">
              <div className="entrance-haze" />
              <div className="entrance-green-dots" aria-hidden="true">
                {Array.from({ length: 18 }, (_, i) => (
                  <span
                    key={i}
                    style={
                      {
                        "--dot-x": `${(i * 37 + 11) % 96}%`,
                        "--dot-y": `${(i * 61 + 9) % 82}%`,
                        "--dot-size": `${3 + (i % 4)}px`,
                        "--dot-delay": `${(i % 7) * -0.8}s`,
                        "--dot-drift": `${12 + (i % 5) * 7}px`,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
              <div className="entrance-ceiling">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i} style={idx("--strip-index", i)} />
                ))}
              </div>
              <div className="entrance-wall entrance-wall-left">
                {Array.from({ length: 4 }, (_, i) => (
                  <span key={i} style={idx("--panel-index", i)} />
                ))}
              </div>
              <div className="entrance-wall entrance-wall-right">
                {Array.from({ length: 4 }, (_, i) => (
                  <span key={i} style={idx("--panel-index", i)} />
                ))}
              </div>
              <div className="entrance-floor">
                {Array.from({ length: 7 }, (_, i) => (
                  <span key={i} style={idx("--floor-index", i)} />
                ))}
              </div>
              <div className="entrance-door-frame" />
              <div className="entrance-door entrance-door-left">
                <span />
              </div>
              <div className="entrance-door entrance-door-right">
                <span />
              </div>
              <div className="entrance-seam" />
              <div className="entrance-logo-plaque">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/ecell-poster.jpg" alt="E-Cell VIT, The Scouts of VIT" />
              </div>
            </div>
            <div className="entrance-mainline">
              <span>CREATE.</span>
              <span>ENTREPRENEUR.</span>
              <span>INNOVATE.</span>
            </div>
            <div className="entrance-identity">
              <h1>E-CELL</h1>
              <p className="entrance-campus">VIT WADALA</p>
              <p className="entrance-tagline">{tagline}</p>
              <div className="entrance-scroll-hint">
                Scroll to enter
                <Arrow />
              </div>
            </div>
          </div>
          <div className="entrance-bloom" />
        </div>
      </section>
    </>
  );
}
