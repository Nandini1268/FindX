import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { searchAPI } from '../api';
import { ArrowRight, Hash, Calculator } from 'lucide-react';

export default function HashCalcPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [animStep, setAnimStep] = useState(-1);

  useEffect(() => {
    if (!query) { navigate('/search'); return; }
    doSearch();
  }, [query]);

  const doSearch = async () => {
    setLoading(true);
    try {
      const res = await searchAPI.search(query);
      setData(res.data);
      setLoading(false);
      // animate char steps one by one
      animateSteps(res.data.hash_trace?.steps?.length || 0);
    } catch (err) {
      setError('Failed to compute hash. Please try again.');
      setLoading(false);
    }
  };

  const animateSteps = (len) => {
    let i = 0;
    const interval = setInterval(() => {
      setAnimStep(i);
      i++;
      if (i >= len) clearInterval(interval);
    }, 300);
  };

  const goVisualize = () => {
    navigate(`/visualization?q=${encodeURIComponent(query)}`);
  };

  if (!query) return null;

  const trace = data?.hash_trace;

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Step progress */}
        <div className="step-progress">
          {['Search', 'Hash Calculation', 'Visualization', 'Result'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="step-item">
                <div className={`step-circle${i === 0 ? ' done' : i === 1 ? ' active' : ''}`}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                <div className={`step-label${i === 1 ? ' active' : ''}`}>{label}</div>
              </div>
              {i < 3 && <div className={`step-connector${i === 0 ? ' done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Hash <span className="gradient-text">Calculation</span>
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Watching how <strong style={{ color: 'var(--purple-600)' }}>"{query}"</strong> is converted to a bucket index
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', background: 'white', padding: '1.5rem 2.5rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
              <div className="spinner spinner-purple" />
              <span style={{ fontWeight: 600, color: 'var(--purple-600)' }}>Computing hash…</span>
            </div>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--red-500)' }}>
            <p>{error}</p>
            <button onClick={() => navigate('/search')} className="btn-primary" style={{ marginTop: '1rem' }}>Go Back</button>
          </div>
        ) : trace ? (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {/* Summary box */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #fdf4ff, #ede9fe)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
                {[
                  { label: 'Search Key', value: `"${query}"`, color: 'var(--text-primary)' },
                  { label: 'Hash Function', value: 'DJB2 × 33', color: 'var(--purple-600)' },
                  { label: 'Final Hash Value', value: trace.final_hash?.toLocaleString(), color: 'var(--purple-700)' },
                  { label: 'Table Size', value: trace.table_size, color: 'var(--text-secondary)' },
                  { label: 'Bucket Index', value: trace.bucket_index, color: '#7c3aed', large: true },
                ].map(item => (
                  <div key={item.label}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{item.label}</div>
                    <div style={{ fontSize: item.large ? '2rem' : '1.1rem', fontWeight: item.large ? 900 : 700, color: item.color }}>
                      {item.value}
                    </div>
                    {item.label === 'Bucket Index' && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        = {trace.final_hash} mod {trace.table_size}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Formula */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calculator size={18} color="var(--purple-500)" /> Hash Function (DJB2)
              </h3>
              <div style={{ background: '#1e1b4b', borderRadius: 'var(--radius-sm)', padding: '1rem 1.25rem', fontFamily: 'monospace', fontSize: '0.875rem', color: '#c4b5fd', overflowX: 'auto' }}>
                <div style={{ color: '#6d28d9', marginBottom: '0.25rem' }}>// Initial hash seed</div>
                <div style={{ color: '#93c5fd' }}>hash = <span style={{ color: '#fbbf24' }}>5381</span></div>
                <div style={{ color: '#6d28d9', marginTop: '0.5rem', marginBottom: '0.25rem' }}>// For each character:</div>
                <div style={{ color: '#93c5fd' }}>hash = (hash &lt;&lt; <span style={{ color: '#fbbf24' }}>5</span>) + hash + char</div>
                <div style={{ color: '#86efac', marginTop: '0.25rem' }}>{'// = hash * 33 + char'}</div>
                <div style={{ color: '#6d28d9', marginTop: '0.5rem', marginBottom: '0.25rem' }}>// Bucket index:</div>
                <div style={{ color: '#93c5fd' }}>bucket = hash <span style={{ color: '#fbbf24' }}>%</span> {trace.table_size}</div>
              </div>
            </motion.div>

            {/* Character-by-character trace */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash size={18} color="var(--purple-500)" /> Character Processing
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {trace.steps?.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: animStep >= i ? 1 : 0.2, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      background: animStep >= i ? (i === trace.steps.length - 1 ? 'var(--purple-100)' : '#fafaf9') : '#f5f5f5',
                      border: `1px solid ${animStep >= i ? (i === trace.steps.length - 1 ? 'var(--purple-300, #c4b5fd)' : 'var(--border-light)') : 'transparent'}`,
                      transition: 'all 0.3s',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-sm)',
                      background: animStep >= i ? 'var(--purple-600)' : 'var(--purple-200)',
                      color: animStep >= i ? 'white' : 'var(--purple-400)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem',
                      flexShrink: 0,
                    }}>
                      {step.char}
                    </div>
                    <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      ASCII({step.char}) = {step.ascii}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'monospace', textAlign: 'right' }}>
                      {step.prev_hash?.toLocaleString()} × 33 + {step.ascii}
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--purple-700)', fontFamily: 'monospace', minWidth: 120, textAlign: 'right' }}>
                      = {step.new_hash?.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Final result row */}
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--purple-600)', borderRadius: 'var(--radius-sm)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Bucket Index = {trace.final_hash?.toLocaleString()} mod {trace.table_size}</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900 }}>= {trace.bucket_index}</span>
              </div>
            </motion.div>

            {/* Bucket visualization */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Numbered Buckets (0–{trace.table_size - 1})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                {Array.from({ length: trace.table_size }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={i === trace.bucket_index ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ delay: 0.5 + i * 0.05, duration: 0.4 }}
                    style={{
                      height: 44,
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      background: i === trace.bucket_index ? 'var(--purple-600)' : 'var(--purple-100)',
                      color: i === trace.bucket_index ? 'white' : 'var(--purple-700)',
                      border: i === trace.bucket_index ? '2px solid var(--purple-600)' : '2px solid var(--purple-200)',
                      boxShadow: i === trace.bucket_index ? '0 0 0 3px rgba(124,58,237,0.3)' : 'none',
                      transition: 'all 0.3s',
                    }}
                  >
                    {i}
                  </motion.div>
                ))}
              </div>
              <p style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Bucket <strong style={{ color: 'var(--purple-600)' }}>[{trace.bucket_index}]</strong> will be searched next
              </p>
            </motion.div>

            {/* Proceed button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} style={{ textAlign: 'center', paddingBottom: '2rem' }}>
              <button onClick={goVisualize} className="btn-primary" id="goto-viz-btn" style={{ padding: '1rem 2.5rem', fontSize: '1.05rem' }}>
                View Algorithm Visualization <ArrowRight size={18} />
              </button>
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
