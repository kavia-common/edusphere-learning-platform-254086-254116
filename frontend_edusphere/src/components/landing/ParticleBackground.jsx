import React from 'react';

/**
 * PUBLIC_INTERFACE
 * ParticleBackground renders a lightweight animated particle field using canvas.
 * Optimized for performance via requestAnimationFrame and offscreen calculations.
 *
 * Usage:
 * <ParticleBackground density={0.00012} color="rgba(37,99,235,0.35)" />
 */
export function ParticleBackground({
  density = 0.00012,
  color = 'rgba(37,99,235,0.35)',
  lineColor = 'rgba(37,99,235,0.18)',
  speed = 0.3,
  className = '',
}) {
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(0);
  const particlesRef = React.useRef([]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const createParticles = () => {
      const count = Math.max(24, Math.floor(width * height * density));
      const pts = [];
      for (let i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          r: Math.random() * 1.6 + 0.6,
        });
      }
      particlesRef.current = pts;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const pts = particlesRef.current;
      // draw points
      ctx.fillStyle = color;
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -5) p.x = width + 5;
        if (p.x > width + 5) p.x = -5;
        if (p.y < -5) p.y = height + 5;
        if (p.y > height + 5) p.y = -5;
      }
      // draw proximity lines (sparse)
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      const maxDist = Math.min(140, Math.max(80, Math.min(width, height) * 0.18));
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxDist * maxDist) {
            const alpha = 1 - Math.sqrt(d2) / maxDist;
            ctx.globalAlpha = alpha * 0.8;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      rafRef.current = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
      createParticles();
    };

    createParticles();
    draw();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [color, lineColor, density, speed]);

  return (
    <div className={`particle-wrapper ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="particle-canvas" />
      <style>{`
        .particle-wrapper { position: absolute; inset: 0; overflow: hidden; }
        .particle-canvas { width: 100%; height: 100%; display: block; }
      `}</style>
    </div>
  );
}

export default ParticleBackground;
