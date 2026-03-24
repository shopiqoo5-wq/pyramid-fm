import React, { useState } from 'react';
import { useStore } from '../../store';
import { motion } from 'framer-motion';
import {
  LuFileLock, LuUpload, LuDownload, LuTrash2,
  LuSearch, LuShieldCheck, LuPlus, LuBadgeCheck,
  LuFileText, LuGlobe
} from 'react-icons/lu';
import { Button, Modal, Input } from '../../components/ui';
import './Compliance.css';

const catIcon: Record<string, React.ReactNode> = {
  'GST Certificate': <LuBadgeCheck size={22} />,
  'Contract': <LuFileText size={22} />,
  'License': <LuGlobe size={22} />,
  default: <LuFileLock size={22} />,
};

const Compliance: React.FC = () => {
  const { complianceDocs, companies, deleteComplianceDoc, addComplianceDoc, addNotification, currentUser } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'Contract', companyId: '' });

  const allCategories = ['All', ...Array.from(new Set(complianceDocs.map(d => d.category)))];
  const totalDocs = complianceDocs.length;
  const compliantCompanies = companies.filter(c => complianceDocs.some(d => d.companyId === c.id)).length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '1.85rem' }}>Compliance & Regulatory Vault</h2>
          <p className="text-muted">Manage GST certificates, contracts, and legal documents for all clients</p>
        </div>
        <Button variant="primary" className="lift" onClick={() => setIsUploadModalOpen(true)}>
          <LuUpload size={16} /> Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Documents', value: totalDocs, color: 'var(--primary)' },
          { label: 'Compliant Clients', value: compliantCompanies, color: 'var(--success)' },
          { label: 'Total Clients', value: companies.length, color: 'var(--text-sub)' },
        ].map((s, i) => (
          <div key={i} className="quick-stat lift">
            <span className="quick-stat-label">{s.label}</span>
            <span className="quick-stat-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar" style={{ padding: 0 }}>
        <div className="search-box" style={{ maxWidth: '360px' }}>
          <LuSearch size={15} className="search-icon" />
          <input type="text" placeholder="Search by client or document type..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="category-tags">
          {allCategories.map(cat => (
            <button key={cat} className={`tag-btn ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Company Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {companies.map(company => {
          let companyDocs = complianceDocs.filter(d => d.companyId === company.id);
          if (activeCategory !== 'All') companyDocs = companyDocs.filter(d => d.category === activeCategory);
          if (searchTerm && !company.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !companyDocs.some(d => d.title.toLowerCase().includes(searchTerm.toLowerCase()))) return null;

          const isExpanded = expandedCompany === company.id;

          return (
            <motion.div key={company.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}
            >
              {/* Company Header */}
              <button
                onClick={() => setExpandedCompany(isExpanded ? null : company.id)}
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '1.1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-lg)', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700, flexShrink: 0, fontSize: '0.9rem' }}>
                  {company.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{company.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{companyDocs.length} documents</div>
                </div>
                {companyDocs.length > 0 && (
                  <span className="status-badge success" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <LuShieldCheck size={11} /> Compliant
                  </span>
                )}
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>›</span>
              </button>

              {/* Documents */}
              {isExpanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
                >
                  {companyDocs.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No documents uploaded yet.</p>
                  ) : companyDocs.map(doc => (
                    <div key={doc.id} style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {catIcon[doc.category] || catIcon.default}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{doc.category} • {new Date(doc.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="icon-btn" 
                          title="Download" 
                          onClick={() => addNotification({ userId: currentUser!.id, title: 'Download Started', message: `Downloading ${doc.title}...`, type: 'info' })}
                        >
                          <LuDownload size={16} />
                        </button>
                        <button className="icon-btn danger" title="Delete" onClick={() => deleteComplianceDoc(doc.id)}>
                          <LuTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    className="tag-btn" 
                    onClick={() => { setNewDoc({ ...newDoc, companyId: company.id }); setIsUploadModalOpen(true); }}
                    style={{ alignSelf: 'flex-start', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}
                  >
                    <LuPlus size={13} /> Upload for {company.name}
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Compliance Document" className="glass-surface">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Document Title</label>
            <Input value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} placeholder="e.g. Q3 SLA Agreement" />
          </div>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Category</label>
            <select className="input" value={newDoc.category} onChange={e => setNewDoc({...newDoc, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
              <option value="Contract">Contract</option>
              <option value="GST Certificate">GST Certificate</option>
              <option value="License">License</option>
              <option value="NDA">NDA</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Relevant Client</label>
            <select className="input" value={newDoc.companyId} onChange={e => setNewDoc({...newDoc, companyId: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
              <option value="">Select a Corporate Client...</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <Button variant="primary" onClick={() => {
            if (!newDoc.title || !newDoc.companyId) return alert('Please enter a title and select a client.');
            addComplianceDoc({ 
              ...newDoc, 
              category: newDoc.category as any, 
              fileUrl: '#', 
              uploadedBy: currentUser!.id, 
              type: 'Other' 
            });
            addNotification({ userId: currentUser!.id, title: 'Document Verified', message: `${newDoc.title} was synchronized into the compliance vault.`, type: 'success' });
            setIsUploadModalOpen(false);
            setNewDoc({ title: '', category: 'Contract', companyId: '' });
          }} style={{ marginTop: '0.5rem' }} className="lift">
            Secure Upload
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Compliance;
