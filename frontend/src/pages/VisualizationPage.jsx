import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, RefreshCw, FastForward, ChevronRight } from 'lucide-react';
import { searchAPI, getPhotoUrl, getInitials } from '../api';

const SPEED_OPTIONS = [
  { label: '0.5×', ms: 2000 },
  { label: '1×', ms: 1000 },
  { label: '2×', ms: 500 },
  { label: '3×', ms: 250 },
];

export default function VisualizationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [log, setLog] = useState([]);
  const intervalRef = useRef(null);
  const logRef = useRef(null);

  useEffect(() => {
    if (!query) { navigate('/search'); return; }
    doSearch();
  }, [query]);

  const doSearch = async () => {
    setLoading(true);
    try {
      const res = await searchAPI.search(query);
      setData(res.data);
      setCurrentStep(0);
      setLog([]);
    } catch {
      setError('Failed to run search visualization.');
    } finally {
      setLoading(false);
    }
  };

  const steps = data?.search?.steps || [];
  const totalSteps = steps.length;
  const currentStepData = steps[currentStep] || null;

  // Auto-play
  useEffect(() => {
    if (playing && currentStep < totalSteps - 1) {
      intervalRef.current = setTimeout(() => {
        setCurrentStep(s => s + 1);
      }, SPEED_OPTIONS[speedIdx].ms);
    } else if (playing && currentStep >= totalSteps - 1) {
      setPlaying(false);
    }
    return () => clearTimeout(intervalRef.current);
  }, [playing, currentStep, speedIdx, totalSteps]);

  // Update log
  useEffect(() => {
    if (currentStepData) {
      setLog(prev => {
        const exists = prev.find(l => l.step === currentStepData.step);
        if (exists) return prev;
        return [...prev, { step: currentStepData.step, message: currentStepData.message, type: currentStepData.type }];
      });
      // Scroll log to bottom
      setTimeout(() => {
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
      }, 50);
    }
  }, [currentStep, currentStepData]);

  const play = () => setPlaying(true);
  const pause = () => { setPlaying(false); clearTimeout(intervalRef.current); };
  const restart = () => { setPlaying(false); clearTimeout(intervalRef.current); setCurrentStep(0); setLog([]); };
  const prev = () => { if (currentStep > 0) setCurrentStep(s => s - 1); };
  const next = () => { if (currentStep < totalSteps - 1) setCurrentStep(s => s + 1); };

  const getNodeStyle = (nodeUsername, stepData) => {
    if (!stepData) return {};
    if (stepData.type === 'compare' && stepData.node?.username === nodeUsername) {
      return stepData.match ? 'matched' : 'comparing';
    }
    if (stepData.type === 'found' && stepData.node?.username === nodeUsername) return 'matched';
    return '';
  };

  const getStepColor = (type) => {
    switch (type) {
      case 'begin': return 'var(--blue-400)';
      case 'hash_calculated': return 'var(--purple-500)';
      case 'bucket_selected': return 'var(--purple-600)';
      case 'compare': return 'var(--orange-500)';
      case 'found': return 'var(--green-500)';
      case 'not_found': return 'var(--red-500)';
      case 'bucket_empty': return 'var(--red-500)';
      default: return 'var(--text-muted)';
    }
  };

  const getStepIcon = (type) => {
    switch (type) {
      case 'begin': return '🚀';
      case 'hash_calculated': return '#️⃣';
      case 'bucket_selected': return '🎯';
      case 'compare': return '🔍';
      case 'found': return '✅';
      case 'not_found': return '❌';
      case 'bucket_empty': return '⬜';
      default: return '•';
    }
  };

  const activeBucket = currentStepData?.bucket_index;
  const bucketSnapshot = data?.bucket_snapshot || [];

  const goResult = () => {
    const result = data?.search?.result;
    if (result === 'found') navigate(`/result/found?q=${encodeURIComponent(query)}`);
    else navigate(`/result/not-found?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '1.5rem 0' }}>
      <div className="container" style={{ maxWidth: 1100 }}>
        {/* Step progress */}
        <div className="step-progress">
          {['Search', 'Hash Calculation', 'Visualization', 'Result'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="step-item">
                <div className={`step-circle${i < 2 ? ' done' : i === 2 ? ' active' : ''}`}>
                  {i < 2 ? '✓' : i + 1}
                </div>
                <div className={`step-label${i === 2 ? ' active' : ''}`}>{label}</div>
              </div>
              {i < 3 && <div className={`step-connector${i < 2 ? ' done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div className="spinner spinner-purple" style={{ width: 40, height: 40, margin: '0 auto 1rem', borderWidth: 3 }} />
            <p style={{ color: 'var(--purple-600)', fontWeight: 600 }}>Loading visualization…</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--red-500)' }}>
            <p>{error}</p>
            <button onClick={() => navigate('/search')} className="btn-primary" style={{ marginTop: '1rem' }}>Back to Search</button>
          </div>
        ) : data ? (
          <>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                Algorithm <span className="gradient-text">Visualization</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Searching for <strong style={{ color: 'var(--purple-600)' }}>"{query}"</strong> in bucket <strong style={{ color: 'var(--purple-600)' }}>[{data.search?.bucket_index}]</strong>
              </p>
            </div>

            {/* Playback Controls */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={restart} className="btn-ghost" style={{ padding: '0.5rem' }} title="Restart" id="ctrl-restart">
                    <RefreshCw size={16} />
                  </button>
                  <button onClick={prev} className="btn-ghost" style={{ padding: '0.5rem' }} disabled={currentStep === 0} title="Previous" id="ctrl-prev">
                    <SkipBack size={16} />
                  </button>
                  <button
                    onClick={playing ? pause : play}
                    className="btn-primary"
                    style={{ padding: '0.6rem 1.25rem' }}
                    disabled={currentStep >= totalSteps - 1}
                    id="ctrl-play"
                  >
                    {playing ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Play</>}
                  </button>
                  <button onClick={next} className="btn-ghost" style={{ padding: '0.5rem' }} disabled={currentStep >= totalSteps - 1} title="Next Step" id="ctrl-next">
                    <SkipForward size={16} />
                  </button>
                </div>

                {/* Progress */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    <span>Step {currentStep + 1} of {totalSteps}</span>
                    <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
                  </div>
                  <div className="perf-bar">
                    <div className="perf-bar-fill hash" style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }} />
                  </div>
                </div>

                {/* Speed */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FastForward size={14} style={{ color: 'var(--text-muted)' }} />
                  {SPEED_OPTIONS.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setSpeedIdx(i)}
                      style={{
                        padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        background: speedIdx === i ? 'var(--purple-600)' : 'var(--purple-100)',
                        color: speedIdx === i ? 'white' : 'var(--purple-700)',
                        border: 'none', cursor: 'pointer',
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current step description */}
              <AnimatePresence mode="wait">
                {currentStepData && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    style={{
                      marginTop: '0.75rem',
                      padding: '0.75rem 1rem',
                      background: `${getStepColor(currentStepData.type)}18`,
                      borderLeft: `3px solid ${getStepColor(currentStepData.type)}`,
                      borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {getStepIcon(currentStepData.type)} {currentStepData.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Main visualization area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
              {/* Hash table visualization */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  Hash Table (16 Buckets · Separate Chaining)
                </h3>
                <div className="hash-table">
                  {bucketSnapshot.map((bucket) => {
                    const isActive = activeBucket === bucket.index &&
                      (currentStepData?.type === 'bucket_selected' ||
                       currentStepData?.type === 'compare' ||
                       currentStepData?.type === 'found' ||
                       currentStepData?.type === 'not_found' ||
                       currentStepData?.type === 'bucket_empty');

                    return (
                      <div key={bucket.index} className={`bucket-row${isActive ? ' active' : ''}`}>
                        <motion.div
                          className={`bucket-index${isActive ? ' active' : ''}`}
                          animate={isActive ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {bucket.index}
                        </motion.div>

                        <div className="bucket-chain">
                          {bucket.nodes.length === 0 ? (
                            <span className="node-null" style={{ color: 'var(--text-muted)', fontStyle: 'italic', opacity: 0.6 }}>∅ empty</span>
                          ) : (
                            <>
                              {bucket.nodes.map((node, ni) => {
                                const nodeClass = getNodeStyle(node.username, currentStepData);
                                return (
                                  <React.Fragment key={node.username}>
                                    <motion.div
                                      className={`node-box ${nodeClass}`}
                                      animate={nodeClass === 'comparing' ? { scale: [1, 1.05, 1] } : nodeClass === 'matched' ? { scale: [1, 1.08, 1] } : {}}
                                      transition={{ duration: 0.3 }}
                                    >
                                      {node.username}
                                      {nodeClass === 'comparing' && <span style={{ color: 'var(--orange-500)', fontWeight: 800 }}>?</span>}
                                      {nodeClass === 'matched' && <span style={{ color: 'var(--green-500)', fontWeight: 800 }}>✓</span>}
                                    </motion.div>
                                    {ni < bucket.nodes.length - 1 && <span className="node-arrow">→</span>}
                                  </React.Fragment>
                                );
                              })}
                              <span className="node-arrow">→</span>
                              <span className="node-null">null</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                  {[
                    { color: 'var(--purple-600)', label: 'Active Bucket' },
                    { color: 'var(--orange-500)', label: 'Comparing' },
                    { color: 'var(--green-500)', label: 'Match Found' },
                  ].map(l => (
                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color }} />
                      {l.label}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Sidebar: step log + result preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Trace log */}
                <div className="card" style={{ padding: '1rem', flex: 1 }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                    📋 Execution Trace
                  </h4>
                  <div ref={logRef} style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {log.map((entry, i) => (
                      <motion.div
                        key={entry.step}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          display: 'flex', gap: '0.5rem', fontSize: '0.78rem',
                          padding: '0.4rem 0.5rem', borderRadius: 'var(--radius-sm)',
                          background: i === log.length - 1 ? `${getStepColor(entry.type)}12` : '#f9f9ff',
                          borderLeft: i === log.length - 1 ? `2px solid ${getStepColor(entry.type)}` : '2px solid transparent',
                        }}
                      >
                        <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>S{entry.step + 1}</span>
                        <span style={{ color: 'var(--text-primary)' }}>{entry.message}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Stats panel */}
                {currentStep > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '1rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>📊 Stats</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                      {[
                        { label: 'Bucket Index', value: `[${data.search?.bucket_index}]` },
                        { label: 'Comparisons', value: data.search?.comparisons ?? '—' },
                        { label: 'Hash Value', value: data.search?.hash?.toLocaleString() },
                        { label: 'Total Users', value: data.bucket_snapshot?.reduce((a, b) => a + b.nodes.length, 0) || 0 },
                      ].map(s => (
                        <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                          <strong style={{ color: 'var(--purple-700)' }}>{s.value}</strong>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Go to result button */}
                {(currentStep >= totalSteps - 1) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={goResult}
                    className="btn-primary"
                    id="goto-result-btn"
                    style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '0.95rem' }}
                  >
                    View Result <ChevronRight size={16} />
                  </motion.button>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
