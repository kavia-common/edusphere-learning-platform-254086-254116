import React from 'react';
import { getLogger } from '../shared/utils/logger';
import ParticleBackground from '../components/landing/ParticleBackground';
import LiveMetrics from '../components/landing/LiveMetrics';
import CoursePreviewGrid from '../components/landing/CoursePreviewGrid';

const logger = getLogger('Home');

/**
 * PUBLIC_INTERFACE
 * Home page showcasing immersive hero, live metrics, and interactive feature cards.
 */
export function Home() {
  React.useEffect(() => {
    logger.info('Home mounted');
  }, []);

  // Typing animation for headline
  const [typed, setTyped] = React.useState('');
  React.useEffect(() => {
    const full = 'Immersive Learning. Real-time Collaboration.';
    let i = 0;
    const id = setInterval(() => {
      setTyped(full.slice(0, i));
      i++;
      if (i > full.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, []);

  // Scroll reveal
  React.useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
        }
      });
    }, { threshold: 0.15 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const handlePrimaryCTA = () => {
    // Navigate to catalog
    window.location.href = '/catalog';
  };
  const handleSecondaryCTA = () => {
    window.location.href = '/about';
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero app-surface">
        <ParticleBackground />
        <div className="hero-inner">
          <div className="hero-badge">Ocean Professional</div>
          <h1 className="hero-title">
            {typed}<span className="cursor" aria-hidden="true">|</span>
          </h1>
          <p className="hero-subtitle">
            EduSphere blends stunning glassmorphism design with AI-powered features,
            live collaboration, and analytics to elevate online education.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary" onClick={handlePrimaryCTA}>Browse Courses</button>
            <button className="btn btn-ghost" onClick={handleSecondaryCTA}>Learn More</button>
          </div>
          <div className="hero-metrics reveal">
            <LiveMetrics />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="feature-grid">
          {[
            { title: 'Real-time Sessions', desc: 'Host live classes with presence, chat, and whiteboards.', icon: '🧑‍🏫' },
            { title: 'AI Assistance', desc: 'Smart recommendations and study aids to boost outcomes.', icon: '🤖' },
            { title: 'Advanced Analytics', desc: 'Track engagement, mastery, and outcomes: actionable insights.', icon: '📈' },
            { title: 'Seamless Catalog', desc: 'Search, filter, and enroll with a delightful experience.', icon: '🧭' },
          ].map((f, idx) => (
            <div key={idx} className="feature-card app-surface reveal">
              <div className="feature-icon" aria-hidden="true">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
              <div className="feature-shimmer" aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>

      {/* Course previews */}
      <section className="previews reveal">
        <h2 className="section-title">Popular right now</h2>
        <CoursePreviewGrid />
      </section>

      <style>{`
        .home-page { display: grid; gap: 1.25rem; }
        .hero {
          position: relative;
          overflow: hidden;
          border-radius: 18px;
          padding: 2.2rem 1.2rem;
          background: radial-gradient(1200px 600px at 10% -10%, rgba(37,99,235,0.15), transparent 60%),
                      radial-gradient(900px 500px at 90% 10%, rgba(245,158,11,0.12), transparent 60%),
                      linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.35));
          border: 1px solid rgba(37,99,235,0.12);
        }
        [data-theme="dark"] .hero {
          background: radial-gradient(1000px 500px at 10% -10%, rgba(37,99,235,0.22), transparent 60%),
                      radial-gradient(800px 400px at 90% 10%, rgba(245,158,11,0.18), transparent 60%),
                      linear-gradient(135deg, rgba(16,24,40,0.7), rgba(16,24,40,0.45));
          border-color: rgba(59,130,246,0.2);
        }
        .hero-inner { position: relative; display: grid; gap: .8rem; max-width: 980px; margin: 0 auto; text-align: center; }
        .hero-badge {
          display: inline-block; margin: 0 auto; font-size: 12px; padding: .35rem .6rem;
          border-radius: 999px; border: 1px solid rgba(37,99,235,0.25);
          background: rgba(37,99,235,0.08);
        }
        .hero-title { margin: 0; font-size: clamp(1.6rem, 4.5vw, 3rem); line-height: 1.1; font-weight: 900; letter-spacing: .2px; }
        .cursor { display: inline-block; width: 1ch; color: var(--color-primary); animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        .hero-subtitle { margin: 0 auto; max-width: 700px; opacity: .85; }
        .hero-ctas { display: flex; gap: .6rem; align-items: center; justify-content: center; margin-top: .4rem; flex-wrap: wrap; }
        .hero-metrics { margin-top: .9rem; }

        .features { }
        .feature-grid {
          display: grid; gap: .75rem;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        @media (max-width: 1100px) { .feature-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 560px) { .feature-grid { grid-template-columns: 1fr; } }

        .feature-card {
          position: relative;
          padding: 1rem;
          border-radius: 14px;
          border: 1px solid rgba(37,99,235,0.12);
          background: linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.45));
          box-shadow: 0 10px 30px rgba(37,99,235,0.08);
          transform: translateY(6px);
          opacity: 0;
          transition: transform .22s ease, box-shadow .22s ease, opacity .3s ease;
          overflow: hidden;
        }
        [data-theme="dark"] .feature-card {
          background: linear-gradient(180deg, rgba(16,24,40,0.65), rgba(16,24,40,0.45));
          border-color: rgba(59,130,246,0.2);
        }
        .feature-card:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(37,99,235,0.16); }
        .feature-icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; background: rgba(37,99,235,0.12); margin-bottom: .4rem; }
        .feature-title { font-weight: 800; }
        .feature-desc { opacity: .8; font-size: .95rem; }
        .feature-shimmer {
          position: absolute; inset: 0; background: linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.6) 50%, transparent 65%);
          transform: translateX(-100%); pointer-events: none; opacity: .0;
        }
        .feature-card:hover .feature-shimmer { animation: shimmer 1.6s; opacity: .6; }
        @keyframes shimmer { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} }

        .previews .section-title { margin: 0 0 .5rem 0; font-size: 1.4rem; font-weight: 800; }

        .reveal.in { transform: translateY(0); opacity: 1; }
        .reveal { transform: translateY(10px); opacity: 0; transition: transform .35s ease, opacity .35s ease; }
      `}</style>
    </div>
  );
}
