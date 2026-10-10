import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ArrowRight, CheckCircle2, Search, Hash, Cpu, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import FindXLogo from '../components/FindXLogo';

const STORY_STEPS = [
  {
    id: 1,
    title: '1. You Enter a Username',
    subtitle: 'The search starts with a simple username like "alex_dev".',
    desc: 'In a database of thousands of users, how do we find one specific profile instantly without scanning through every single account one by one?',
    icon: '👤',
    color: 'var(--blue-500)',
  },
  {
    id: 2,
    title: '2. Convert Name to a Unique Hash Code',
    subtitle: 'The algorithm transforms letters into a mathematical number.',
    desc: 'Each character in "alex_dev" (a, l, e, x...) is converted to its numerical value. The C algorithm computes a unique total number called the Hash Value.',
    icon: '⚡',
    color: 'var(--purple-600)',
  },
  {
    id: 3,
    title: '3. Jump Directly to the Target Bucket',
    subtitle: 'No scanning required — we jump straight to Bucket #13!',
    desc: 'By taking (Hash Value % 16 Buckets), the algorithm knows exactly which bucket holds the user. Instead of checking 100 users, we narrow it down to just 1 bucket in O(1) constant time!',
    icon: '🎯',
    color: 'var(--pink-500)',
  },
  {
    id: 4,
    title: '4. Walk the Linked List (Separate Chaining)',
    subtitle: 'If multiple profiles share a bucket, they form a simple chain.',
    desc: 'We follow the pointers node by node: alex_dev → neha123 → tom_07. We compare the target username with each node along the chain.',
    icon: '🔗',
    color: 'var(--orange-500)',
  },
  {
    id: 5,
    title: '5. Match Found Instantly!',
    subtitle: 'Search complete in just 1 comparison!',
    desc: 'The profile for @alex_dev is retrieved and presented to you with all posts, bio, and stats intact.',
    icon: '🎉',
    color: 'var(--green-500)',
  },
];

export default function HowItWorksPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [customUser, setCustomUser] = useState('alex_dev');
  const timerRef = useRef(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= STORY_STEPS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2500);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying]);

  const togglePlay = () => {
    if (activeStep >= STORY_STEPS.length - 1) {
      setActiveStep(0);
    }
    setIsPlaying(p => !p);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setActiveStep(0);
  };

  const current = STORY_STEPS[activeStep];

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '2.5rem 0', background: 'var(--bg-primary)' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--purple-100)', color: 'var(--purple-700)', padding: '0.35rem 1.25rem', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem' }}>
            <Sparkles size={16} /> Interactive Algorithm Story
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            How <span className="gradient-text">FindX</span> Finds People
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: 620, margin: '0 auto' }}>
            Experience how our C-powered hash table locates any profile in milliseconds.
          </p>
        </div>

        {/* Story Controls & Progress Bar */}
        <div className="card" style={{ padding: '1.5rem 2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={togglePlay}
                className="btn-primary"
                id="story-play-btn"
                style={{ padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
              >
                {isPlaying ? <><Pause size={18} /> Pause Story</> : <><Play size={18} /> {activeStep >= STORY_STEPS.length - 1 ? 'Replay Story' : 'Play Interactive Story'}</>}
              </button>
              <button
                onClick={handleRestart}
                className="btn-ghost"
                id="story-restart-btn"
                style={{ padding: '0.65rem 1rem' }}
                title="Restart Story"
              >
                <RotateCcw size={16} /> Restart
              </button>
            </div>

            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--purple-700)' }}>
              Step {activeStep + 1} of {STORY_STEPS.length}: {current.title}
            </div>
          </div>

          {/* Interactive Step Circles */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {STORY_STEPS.map((step, idx) => {
              const isDone = idx < activeStep;
              const isActive = idx === activeStep;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => { setIsPlaying(false); setActiveStep(idx); }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      border: 'none',
                      background: isActive ? 'var(--gradient-btn)' : isDone ? 'var(--green-500)' : 'var(--purple-100)',
                      color: isActive || isDone ? 'white' : 'var(--purple-700)',
                      fontWeight: 800,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      boxShadow: isActive ? '0 0 0 4px rgba(139, 92, 246, 0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'center',
                    }}
                    title={step.title}
                  >
                    {isDone ? '✓' : step.id}
                  </button>
                  {idx < STORY_STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 4,
                        background: idx < activeStep ? 'var(--green-500)' : 'var(--border-light)',
                        transition: 'background 0.4s ease',
                        margin: '0 4px',
                        zIndex: 1,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Animated Story Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="card"
            style={{ padding: '2.5rem', marginBottom: '2.5rem', borderLeft: `6px solid ${current.color}` }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
              {/* Text explanation */}
              <div>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{current.icon}</div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  {current.title}
                </h2>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--purple-600)', marginBottom: '1rem' }}>
                  {current.subtitle}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                  {current.desc}
                </p>

                {activeStep === 0 && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ paddingLeft: '1rem', width: 220 }}
                      value={customUser}
                      onChange={e => setCustomUser(e.target.value)}
                    />
                    <button onClick={() => setActiveStep(1)} className="btn-primary" style={{ padding: '0.6rem 1.25rem' }}>
                      Try This Name <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>

              {/* Visual Graphic Area */}
              <div style={{ background: 'var(--gradient-soft)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--purple-200)', textAlign: 'center', minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {activeStep === 0 && (
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <div style={{ background: 'white', padding: '1rem 2rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-md)', border: '2px solid var(--purple-400)', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Search size={22} color="var(--purple-600)" />
                      <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)' }}>@{customUser}</span>
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <div>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '1rem' }}>
                      {customUser.split('').map((char, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--purple-600)', color: 'white', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}
                        >
                          {char}
                        </motion.div>
                      ))}
                    </div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--purple-700)' }}>
                      Hash Code = 1,853,941,645
                    </motion.div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>16 Hash Buckets</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '4px', maxWidth: 320, margin: '0 auto 1rem' }}>
                      {Array.from({ length: 16 }).map((_, bIdx) => (
                        <div
                          key={bIdx}
                          style={{
                            height: 34,
                            borderRadius: 6,
                            background: bIdx === 13 ? 'var(--pink-500)' : 'white',
                            color: bIdx === 13 ? 'white' : 'var(--text-muted)',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            border: bIdx === 13 ? '2px solid var(--pink-600)' : '1px solid var(--border-light)',
                            boxShadow: bIdx === 13 ? '0 0 0 3px rgba(236,72,153,0.3)' : 'none',
                          }}
                        >
                          {bIdx}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--pink-600)', fontSize: '0.95rem' }}>
                      1,853,941,645 % 16 = Bucket [13] 🎯
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div style={{ width: '100%' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem' }}>Bucket [13] Linked List Chain</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1, repeat: Infinity }} style={{ padding: '0.5rem 1rem', background: '#f0fdf4', border: '2px solid var(--green-500)', borderRadius: 8, fontWeight: 700, color: 'var(--green-600)', fontSize: '0.85rem' }}>
                        alex_dev ✓
                      </motion.div>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <div style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: 8, fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        neha123
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>→</span>
                      <div style={{ padding: '0.5rem 1rem', background: 'white', border: '1px solid var(--border-light)', borderRadius: 8, fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        tom_07
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 4 && (
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', border: '3px solid var(--green-500)', color: 'var(--green-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <CheckCircle2 size={36} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--green-600)' }}>
                      Match Found in 1 Comparison!
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      O(1) Constant Time Lookup
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Optional Advanced Technical Details Toggle */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
          <button
            onClick={() => setShowTechDetails(s => !s)}
            style={{ width: '100%', background: 'none', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}
            id="toggle-tech-details"
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={18} color="var(--purple-600)" /> Advanced Technical Specs & C Code (Optional)
            </span>
            {showTechDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {showTechDetails && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                FindX compiles a high-performance C binary (<code>hash_search.c</code>) implementing DJB2 hashing and separate chaining:
              </p>
              <div style={{ background: '#1e1b4b', borderRadius: 'var(--radius-md)', padding: '1.25rem', fontFamily: 'monospace', fontSize: '0.85rem', color: '#c4b5fd', overflowX: 'auto' }}>
                <div style={{ color: '#86efac' }}>// DJB2 Hash function in C (hash_search.c)</div>
                <div>unsigned int hash_username(const char *username) {'{'}</div>
                <div>&nbsp;&nbsp;unsigned int hash = 5381;</div>
                <div>&nbsp;&nbsp;int c;</div>
                <div>&nbsp;&nbsp;while ((c = (unsigned char)*username++) != '\0') {'{'}</div>
                <div>&nbsp;&nbsp;&nbsp;&nbsp;hash = ((hash &lt;&lt; 5) + hash) + tolower(c); <span style={{ color: '#fbbf24' }}>// hash * 33 + c</span></div>
                <div>&nbsp;&nbsp;{'}'}</div>
                <div>&nbsp;&nbsp;return hash % TABLE_SIZE; <span style={{ color: '#fbbf24' }}>// TABLE_SIZE = 16</span></div>
                <div>{'}'}</div>
              </div>
            </motion.div>
          )}
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link to="/search" className="btn-primary" id="how-works-search-btn" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
            <Search size={18} /> Try Search with the Real C Engine <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
