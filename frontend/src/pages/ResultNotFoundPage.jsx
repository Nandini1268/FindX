import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, UserX, ArrowRight, Zap, RefreshCw, Users, UserPlus } from 'lucide-react';
import { searchAPI } from '../api';

export default function ResultNotFoundPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [data, setData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) { navigate('/search'); return; }
    loadResult();
  }, [query]);

  const loadResult = async () => {
    setLoading(true);
    try {
      const [res, compRes] = await Promise.all([
        searchAPI.search(query),
        searchAPI.compare(query),
      ]);
      setData(res.data);
      setCompareData(compRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner spinner-purple" style={{ width: 40, height: 40, margin: '0 auto 1rem', borderWidth: 3 }} />
        <p style={{ color: 'var(--purple-600)', fontWeight: 600 }}>Checking hash table buckets…</p>
      </div>
    );
  }

  const trace = data?.search;
  const hashTrace = data?.hash_trace;
  const hashComps = compareData?.hash_comparisons || trace?.comparisons || 0;
  const linearComps = compareData?.linear_comparisons || compareData?.total_users || 0;

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - 70px)', padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Step progress */}
        <div className="step-progress">
          {['Search', 'Hash Calculation', 'Visualization', 'Result'].map((label, i) => (
            <React.Fragment key={label}>
              <div className="step-item">
                <div className={`step-circle done`}>✓</div>
                <div className={`step-label${i === 3 ? ' active' : ''}`}>{label}</div>
              </div>
              {i < 3 && <div className="step-connector done" />}
            </React.Fragment>
          ))}
        </div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}
        >
          {/* Red Search Icon */}
          <div className="result-icon failure">
            <UserX size={40} color="var(--red-500)" />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--red-500)', marginBottom: '0.5rem' }}>
            User Not Found
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', marginBottom: '2rem' }}>
            The username <strong style={{ color: 'var(--text-primary)' }}>"{query}"</strong> does not exist in our database.
          </p>

          {/* Details Table */}
          <div style={{ background: '#fafaf9', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1.5rem', maxWidth: 540, margin: '0 auto 2rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Search Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Username Searched</span>
                <span style={{ fontWeight: 700, color: 'var(--purple-700)' }}>{query}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Hash Value</span>
                <span style={{ fontWeight: 600 }}>{trace?.hash?.toLocaleString() || hashTrace?.final_hash?.toLocaleString() || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Bucket Index</span>
                <span style={{ fontWeight: 700, color: 'var(--purple-600)' }}>[{trace?.bucket_index ?? '—'}]</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Comparisons (Hash Table)</span>
                <span style={{ fontWeight: 700, color: 'var(--purple-700)' }}>{hashComps}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Comparisons (Linear Search)</span>
                <span style={{ fontWeight: 700, color: 'var(--orange-500)' }}>{linearComps}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Result</span>
                <span className="badge badge-pink" style={{ background: '#fef2f2', color: 'var(--red-500)', fontWeight: 700 }}>
                  Not Found
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/search" className="btn-primary" id="btn-try-another" style={{ padding: '0.875rem 2rem' }}>
              <Search size={16} /> Try Another Search
            </Link>
            <Link to={`/register?username=${encodeURIComponent(query)}`} className="btn-secondary" id="btn-register-name">
              <UserPlus size={16} /> Register as @{query}
            </Link>
          </div>
        </motion.div>

        {/* Explore Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--gradient-soft)', border: '1px solid var(--purple-200)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>💡 Looking for existing profiles?</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            Explore our community of developers, designers, creators, and students.
          </p>
          <Link to="/explore" className="btn-secondary" style={{ background: 'white' }}>
            <Users size={16} /> Explore All Registered Users <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
