"use client";

import React, { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   All styles inlined — no Tailwind, no CSS file
   Background is ALWAYS light (#F8FAFC) regardless of
   the host page's color scheme.
───────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;900&display=swap');

  /* Hard-reset: force light palette on the entire component */
  .qhero-shell,
  .qhero-shell *,
  .qhero-shell *::before,
  .qhero-shell *::after {
    box-sizing: border-box;
  }

  .qhero-shell {
    font-family: 'Space Grotesk', sans-serif;
    color-scheme: light;          /* tells the browser: render ME in light */
    background: #F8FAFC;
    color: #0f172a;
  }

  /* ── Navbar ── */
  .qhero-nav-wrap {
    position: fixed;
    top: 16px;
    left: 0;
    right: 0;
    z-index: 100;
    display: flex;
    justify-content: center;
    padding: 0 16px;
  }

  .qhero-nav-pill {
    width: 100%;
    max-width: 56rem;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(251,146,60,0.25);
    border-radius: 9999px;
    box-shadow: 0 8px 32px rgba(234,88,12,0.07);
    padding: 8px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 300ms;
  }

  /* Logo SVG */
  .qhero-logo-svg {
    width: 7rem;
    height: auto;
    flex-shrink: 0;
  }

  /* Desktop nav links */
  .qhero-nav-links {
    display: flex;
    align-items: center;
    gap: 2rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .qhero-nav-link {
    font-size: 1rem;
    font-weight: 600;
    color: #475569;
    text-decoration: none;
    transition: color 200ms, transform 200ms;
  }
  .qhero-nav-link:hover { color: #ea580c; transform: scale(1.08); }

  /* CTA button in navbar */
  .qhero-nav-cta {
    display: inline-flex;
    align-items: center;
    padding: 10px 24px;
    font-size: 0.875rem;
    font-weight: 700;
    color: #fff;
    background: #0f172a;
    border-radius: 9999px;
    text-decoration: none;
    transition: background 200ms, transform 200ms, box-shadow 200ms;
    box-shadow: 0 4px 14px rgba(15,23,42,0.15);
    white-space: nowrap;
  }
  .qhero-nav-cta:hover { background: #ea580c; transform: scale(1.05); box-shadow: 0 6px 18px rgba(234,88,12,0.3); }

  /* Mobile hamburger */
  .qhero-hamburger {
    display: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    color: #0f172a;
    flex-direction: column;
    gap: 5px;
    z-index: 110;
    position: relative;
  }
  .qhero-hamburger span {
    display: block;
    width: 22px;
    height: 2px;
    background: currentColor;
    border-radius: 2px;
    transition: transform 250ms, opacity 250ms;
  }

  /* Mobile overlay */
  .qhero-mobile-overlay {
    position: fixed;
    inset: 0;
    z-index: 90;
    background: rgba(255,255,255,0.97);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms;
  }
  .qhero-mobile-overlay.open {
    opacity: 1;
    pointer-events: auto;
  }
  .qhero-mobile-link {
    font-size: 1.75rem;
    font-weight: 700;
    color: #0f172a;
    text-decoration: none;
    transition: color 200ms;
  }
  .qhero-mobile-link:hover { color: #ea580c; }
  .qhero-mobile-cta {
    margin-top: 2rem;
    padding: 12px 32px;
    font-size: 1.125rem;
    font-weight: 700;
    color: #fff;
    background: #0f172a;
    border-radius: 9999px;
    text-decoration: none;
    transition: background 200ms;
  }
  .qhero-mobile-cta:hover { background: #ea580c; }

  @media (max-width: 767px) {
    .qhero-nav-links,
    .qhero-nav-cta { display: none; }
    .qhero-hamburger { display: flex; }
  }

  /* ── Hero ── */

  /* Glitch on "BUSINESS" */
  .qhero-glitch {
    position: relative;
    display: inline-block;
    font-weight: 900;
    color: #0f172a;                   /* start dark */
    animation: qhero-color-toggle 7s infinite step-end;
  }
  .qhero-glitch::before,
  .qhero-glitch::after {
    content: attr(data-text);
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 100%;
    opacity: 0;
    background: #F8FAFC;             /* match the white bg */
  }
  .qhero-glitch::before { animation: qhero-glitch-1 7s infinite linear; z-index: 2; }
  .qhero-glitch::after  { animation: qhero-glitch-2 7s infinite linear; z-index: 3; }

  @keyframes qhero-color-toggle {
    0%,  44%   { color: #0f172a; text-shadow: none; }
    42.1%, 44.9% { text-shadow: -2px 0 #00ffff, 2px 0 #ff00ff; }
    45%,  94%  { color: #f97316; text-shadow: none; }
    92.1%, 94.9% { text-shadow: -2px 0 #a3e635, 2px 0 #ef4444; }
    95%, 100%  { color: #0f172a; text-shadow: none; }
  }

  @keyframes qhero-glitch-1 {
    0%,   42%  { opacity: 0; transform: translate(0); }
    42.1%      { opacity: 1; color: #00ffff; clip-path: polygon(0 0,100% 0,100% 45%,0 45%); transform: translate(-10px,-5px) skew(20deg); }
    43%        { color: #ff00ff; transform: translate(10px,5px) skew(-20deg); clip-path: polygon(0 10%,100% 0,100% 30%,0 35%); }
    44%        { color: #f97316; transform: translate(-10px,5px); clip-path: polygon(0 40%,100% 50%,100% 80%,0 90%); }
    44.9%      { opacity: 1; }
    45%        { opacity: 0; }
    45.1%, 92% { opacity: 0; transform: translate(0); }
    92.1%      { opacity: 1; color: #00ffff; clip-path: polygon(0 60%,100% 55%,100% 100%,0 100%); transform: translate(10px,-5px) skew(10deg); }
    93%        { color: #ff00ff; transform: translate(-5px,5px) skew(-10deg); clip-path: polygon(0 20%,100% 20%,100% 100%,0 80%); }
    94.9%      { opacity: 1; }
    95%        { opacity: 0; }
  }
  @keyframes qhero-glitch-2 {
    0%,   42%  { opacity: 0; transform: translate(0); }
    42.1%      { opacity: 1; color: #a3e635; clip-path: polygon(0 55%,100% 55%,100% 100%,0 100%); transform: translate(10px,5px); }
    43%        { color: #ef4444; transform: translate(-10px,-5px) skew(10deg); clip-path: polygon(0 20%,100% 20%,100% 100%,0 80%); }
    45%        { opacity: 0; }
    45.1%, 92% { opacity: 0; transform: translate(0); }
    92.1%      { opacity: 1; color: #a3e635; clip-path: polygon(0 0,100% 0,100% 45%,0 45%); transform: translate(-10px,-5px); }
    93%        { color: #ef4444; transform: translate(10px,5px) skew(-20deg); clip-path: polygon(0 10%,100% 0,100% 30%,0 35%); }
    95%        { opacity: 0; }
  }

  /* Tagline pulse */
  @keyframes qhero-pulse {
    0%, 100% { opacity: 1; }
    50%      { opacity: 0.6; }
  }
  .qhero-tagline-pulse { animation: qhero-pulse 2s ease-in-out infinite; }

  /* Hero CTA button */
  .qhero-btn {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 20px 48px;
    border-radius: 9999px;
    background: #ea580c;
    color: #fff;
    font-weight: 700;
    font-size: 1.3rem;
    border: none;
    cursor: pointer;
    text-decoration: none;
    font-family: 'Space Grotesk', sans-serif;
    transition: background 200ms, transform 200ms, box-shadow 200ms;
    box-shadow: 0 10px 30px rgba(234,88,12,0.25);
    position: relative;
    z-index: 30;
  }
  .qhero-btn:hover { background: #c2410c; transform: scale(1.05); box-shadow: 0 14px 36px rgba(234,88,12,0.35); }
  .qhero-btn:active { transform: scale(0.96); }
  .qhero-btn svg { transition: transform 200ms; }
  .qhero-btn:hover svg { transform: translateX(4px); }
`;



/* ─────────────────────────────────────────────
   Navbar (self-contained, no Next.js deps)
───────────────────────────────────────────── */
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Freelancers", href: "/designers" },
  { label: "Projects", href: "/projects" },
];

function QuordixNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="qhero-nav-wrap">
        <div className="qhero-nav-pill">
          {/* Logo */}
          <a href="/" style={{ display: "block", textDecoration: "none" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: 800, background: "linear-gradient(to right, #ea580c, #f97316)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Lanzy
            </span>
          </a>

          {/* Desktop links */}
          <nav aria-label="Main Navigation">
            <ul className="qhero-nav-links">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="qhero-nav-link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop CTA + hamburger */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <a href="/projects" className="qhero-nav-cta">
              Explore Projects
            </a>
            <button
              className="qhero-hamburger"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span
                style={{
                  transform: open ? "rotate(45deg) translateY(7px)" : "none",
                }}
              />
              <span style={{ opacity: open ? 0 : 1 }} />
              <span
                style={{
                  transform: open ? "rotate(-45deg) translateY(-7px)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={`qhero-mobile-overlay${open ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
      >
        {NAV_LINKS.map((l) => (
          <a
            key={l.label}
            href={l.href}
            className="qhero-mobile-link"
            onClick={() => setOpen(false)}
          >
            {l.label}
          </a>
        ))}
        <a href="/projects" className="qhero-mobile-cta" onClick={() => setOpen(false)}>
          Explore Projects
        </a>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   Animated dot-grid + floating particle canvas
   Always white background, orange on hover
───────────────────────────────────────────── */
function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    let mouseX = -1000;
    let mouseY = -1000;
    let isMobile = false;

    const SPACING = 30;
    const BASE_R = 1.5;
    const HOVER_R = 100;
    const SCAN_DUR = 2500;
    const SCAN_PAUSE = 4000;
    const DEFAULT_COLOR = "rgba(148,163,184,0.4)";
    const ACTIVE_COLOR = "#ff5500";

    class Particle {
      x = 0; y = 0; vx = 0; vy = 0; size = 0;
      constructor(w: number, h: number) { this.reset(w, h); }
      reset(w: number, h: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = Math.random() * 2;
      }
      update(w: number, h: number) {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }
      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = "rgba(249,115,22,0.15)";
        c.fill();
      }
    }

    const particles: Particle[] = [];
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      isMobile = window.innerWidth < 768;
      particles.length = 0;
      const n = isMobile ? 12 : 40;
      for (let i = 0; i < n; i++) particles.push(new Particle(canvas.width, canvas.height));
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isMobile) return;
      const r = canvas.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    };
    const onMouseLeave = () => { mouseX = -1000; mouseY = -1000; };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(canvas.width, canvas.height); p.draw(ctx); });

      const loopTime = performance.now() % (SCAN_DUR + SCAN_PAUSE);
      const scanY = isMobile
        ? (Math.min(loopTime / SCAN_DUR, 1)) * (canvas.height + HOVER_R * 2) - HOVER_R
        : 0;

      for (let x = 0; x < canvas.width; x += SPACING) {
        for (let y = 0; y < canvas.height; y += SPACING) {
          const dx = x - mouseX, dy = y - mouseY;
          const dist = isMobile ? Math.abs(y - scanY) : Math.sqrt(dx * dx + dy * dy);

          if (dist < HOVER_R) {
            const scale = 1 - dist / HOVER_R;
            ctx.fillStyle = ACTIVE_COLOR;
            ctx.shadowBlur = isMobile ? 0 : 15;
            ctx.shadowColor = isMobile ? "transparent" : "rgba(255,85,0,0.4)";
            ctx.beginPath();
            ctx.arc(x, y, BASE_R + scale * (isMobile ? 2 : 3), 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = DEFAULT_COLOR;
            ctx.shadowBlur = 0;
            ctx.shadowColor = "transparent";
            ctx.beginPath();
            ctx.arc(x, y, BASE_R, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    resize();
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    /* Fixed layer — always #F8FAFC, never inherits dark-mode */
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        background: "#F8FAFC",   /* hardcoded light */
        colorScheme: "light",
      }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, display: "block" }} />

      {/* Soft slate glow — top-left */}
      <div style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: "50%", height: "50%",
        background: "rgba(203,213,225,0.4)",
        filter: "blur(120px)", borderRadius: "9999px",
      }} />
      {/* Soft slate glow — bottom-right */}
      <div style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: "40%", height: "40%",
        background: "rgba(203,213,225,0.4)",
        filter: "blur(120px)", borderRadius: "9999px",
      }} />

      {/* Giant < > brackets, barely visible */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none", userSelect: "none", opacity: 0.025,
      }}>
        <span style={{ fontSize: "40vw", fontWeight: 900, lineHeight: 1, color: "#000" }}>
          &lt;
        </span>
        <span style={{ width: "20vw" }} />
        <span style={{ fontSize: "40vw", fontWeight: 900, lineHeight: 1, color: "#000" }}>
          &gt;
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Root export
───────────────────────────────────────────── */
export default function QuordixHero() {
  return (
    <div
      className="qhero-shell"
      style={{
        position: "relative",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        /* Explicitly override any inherited dark bg */
        background: "#F8FAFC",
        colorScheme: "light" as React.CSSProperties["colorScheme"],
      }}
    >
      <style>{STYLES}</style>

      {/* Layer 0: dot-grid background */}
      <DotGridBackground />

      {/* Layer 1: Navbar */}
      <QuordixNavbar />

      {/* Layer 2: Hero content */}
      <main
        style={{
          position: "relative",
          zIndex: 20,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "8rem 1rem 4rem",
          width: "100%",
          maxWidth: "64rem",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
              userSelect: "none",
              margin: 0,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {/* Orange tagline */}
            <span
              className="qhero-tagline-pulse"
              style={{
                fontSize: "clamp(1.35rem, 3.5vw, 2.25rem)",
                fontWeight: 900,
                letterSpacing: "0.28em",
                color: "#ea580c",
                marginBottom: "1.5rem",
                display: "block",
              }}
            >
              CUSTOM FREELANCE MARKETPLACE
            </span>

            {/* Large split title */}
            <div
              style={{
                fontSize: "clamp(4.5rem, 12vw, 11rem)",
                fontWeight: 900,
                lineHeight: 0.9,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0,
              }}
            >
              <span style={{ color: "#0f172a", opacity: 0.9 }}>TALENT MEETS</span>
              <span className="qhero-glitch" data-text="OPPORTUNITY.">
                OPPORTUNITY.
              </span>
            </div>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "clamp(1.35rem, 2.8vw, 1.85rem)",
            fontWeight: 500,
            color: "#475569",
            maxWidth: "52rem",
            lineHeight: 1.7,
            margin: "0 0 2.5rem",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Lancy connects ambitious people with the talent and projects that turn ideas into real work.
        </p>

        {/* CTA Button */}
        <a href="/designers" className="qhero-btn" style={{ marginBottom: "2rem" }}>
          <span>Explore Talent</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </a>

        {/* Feature Badges Line */}
        <div
          style={{
            fontSize: "1.15rem",
            fontWeight: 600,
            color: "#64748b",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          <span>Open Source</span>
          <span style={{ color: "#ea580c" }}>•</span>
          <span>Freelancers</span>
          <span style={{ color: "#ea580c" }}>•</span>
          <span>Projects</span>
        </div>
      </main>
    </div>
  );
}
