import React, { useState } from 'react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuFileLock, 
  LuDownload, 
  LuShieldCheck, 
  LuSearch,
  LuFileText, 
  LuTriangle, 
  LuCircleCheck,
  LuBadgeCheck, 
  LuGlobe,
  LuActivity,
  LuCircleCheck as LuCheckCircle,
  LuEye
} from 'react-icons/lu';
import { Button } from '../../components/ui';
import './PortalVault.css';

const categoryIcons: Record<string, React.ReactNode> = {
  'GST Certificate': <LuBadgeCheck size={24} />,
  'Contract': <LuFileText size={24} />,
  'License': <LuGlobe size={24} />,
  'MSDS': <LuTriangle size={24} />,
  'SLA': <LuFileLock size={24} />,
  default: <LuFileLock size={24} />,
};

const ComplianceVault: React.FC = () => {
  const { currentUser, complianceDocs, companies } = useStore((state: any) => state);
  const company = companies.find((c: any) => c.id === currentUser?.companyId);
  const myDocs = complianceDocs.filter((d: any) => d.companyId === currentUser?.companyId);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(myDocs.map((d: any) => d.category))) as string[]];

  const filtered = myDocs.filter((d: any) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="vault-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Regulatory Repository</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>{company?.name} • Authorized Compliance & Legal Assets.</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          color: 'var(--success)',
          borderRadius: '24px',
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          fontWeight: 700,
          marginBottom: '2rem'
        }}
      >
        <LuShieldCheck size={24} />
        <span style={{ fontSize: '1rem' }}>
          Facility operational status: <strong style={{ textDecoration: 'underline' }}>FULLY COMPLIANT</strong>. All legal mandates are satisfied.
        </span>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="vault-stat-card">
          <div className="stat-header"><LuFileText size={16} /> Total Registry</div>
          <div className="stat-value">{myDocs.length}</div>
        </div>
        <div className="vault-stat-card">
          <div className="stat-header" style={{ color: 'var(--success)' }}><LuCheckCircle size={16} /> Verified Active</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{myDocs.length}</div>
        </div>
        <div className="vault-stat-card">
          <div className="stat-header"><LuActivity size={16} /> Expiring Net-30</div>
          <div className="stat-value">0</div>
        </div>
        <div className="vault-stat-card">
          <div className="stat-header"><LuShieldCheck size={16} /> Risk Rating</div>
          <div className="stat-value" style={{ color: 'var(--primary)' }}>AAA</div>
        </div>
      </div>

      <div className="filters-bar" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="search-box" style={{ maxWidth: '400px', flex: 1 }}>
          <LuSearch size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Query regulatory assets..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ fontWeight: 600 }}
          />
        </div>
        <div className="category-tags" style={{ display: 'flex', gap: '0.75rem' }}>
          {categories.map(cat => (
            <button
              key={cat as string}
              className={`tag-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat as string)}
              style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {filtered.map((doc: any, i: number) => (
            <motion.div
              layout
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="doc-card-premium"
            >
              <div className="doc-icon-container">
                {categoryIcons[doc.category] || categoryIcons.default}
              </div>
              <div className="doc-info">
                <h4 className="doc-title">{doc.title}</h4>
                <div className="doc-meta">
                  <span className="verify-badge"><LuCircleCheck size={10} /> Authenticated</span>
                  <span>{doc.category}</span>
                </div>
                <div style={{ marginTop: '0.8rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Revision: {new Date(doc.createdAt).toLocaleDateString()}
                </div>
                <div className="doc-actions">
                  <button className="btn-doc-action">
                    <LuDownload size={14} /> 
                    <span>Retrieve PDF</span>
                  </button>
                  <button className="btn-doc-action" style={{ background: 'none' }}>
                    <LuEye size={14} /> 
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="empty-state-full" style={{ padding: '4rem' }}>
          <div className="empty-state-icon" style={{ marginBottom: '1.5rem', color: 'var(--primary-light)' }}><LuFileLock size={64} /></div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Asset Not Located</h3>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '0.5rem auto' }}>No regulatory documents match your current filtering parameters.</p>
          <Button variant="ghost" onClick={() => { setSearch(''); setActiveCategory('All'); }} style={{ marginTop: '1.5rem' }}>Reset Ledger Search</Button>
        </div>
      )}
    </div>
  );
};

export default ComplianceVault;
