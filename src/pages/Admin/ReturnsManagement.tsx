import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { Card, Table, Button, Modal, Badge } from '../../components/ui';
import { 
  LuCheck, 
  LuX, 
  LuRotateCcw, 
  LuSearch, 
  LuImage, 
  LuCircleCheck, 
  LuCircleAlert,
  LuClock,
  LuChevronRight,
  LuPackageCheck,
  LuRotateCcw as LuUndo2
} from 'react-icons/lu';

const ReturnsManagement: React.FC = () => {
  const { returnRequests, updateReturnStatus, products, companies, orders, settings, addAlert } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');
  
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedReturnIds, setSelectedReturnIds] = useState<string[]>([]);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Stats
  const pendingCount = returnRequests.filter(r => r.status === 'pending').length;
  const approvedCount = returnRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = returnRequests.filter(r => r.status === 'rejected').length;

  const filteredReturns = returnRequests.filter(r => {
    const company = companies.find(c => c.id === r.companyId);
    const matchesSearch = 
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': return <Badge variant="warning">PENDING</Badge>;
      case 'approved': return <Badge variant="success">APPROVED</Badge>;
      case 'rejected': return <Badge variant="danger">REJECTED</Badge>;
      case 'completed': return <Badge variant="info">COMPLETED</Badge>;
      default: return <Badge>{status.toUpperCase()}</Badge>;
    }
  };

  const handleApprove = () => {
    if (selectedReturn) {
      updateReturnStatus(selectedReturn.id, 'approved');
      setIsReviewOpen(false);
      setSelectedReturn(null);
    }
  };

  const handleReject = () => {
    if (selectedReturn) {
      updateReturnStatus(selectedReturn.id, 'rejected');
      setIsReviewOpen(false);
      setSelectedReturn(null);
    }
  };

  const handleBatchProcess = (action: 'approve' | 'reject') => {
    selectedReturnIds.forEach(id => {
      updateReturnStatus(id, action === 'approve' ? 'approved' : 'rejected');
    });
    addAlert({ message: `Successfully ${action}d ${selectedReturnIds.length} return requests.`, type: 'success' });
    setSelectedReturnIds([]);
    setIsBatchModalOpen(false);
  };

  const handleDownloadCreditNote = async (ret: any) => {
    const { generateCreditNotePDF } = await import('../../lib/pdfGenerator');
    const company = companies.find(c => c.id === ret.companyId);
    generateCreditNotePDF(ret, company, settings);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header sticky-header no-print">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>Reverse Logistics</h2>
          <p className="text-muted">Orchestrate product returns, quality checks, and client credits.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {selectedReturnIds.length > 0 && (
            <Button 
              variant="primary" 
              onClick={() => setIsBatchModalOpen(true)}
              className="lift glow"
              style={{ background: 'var(--primary)', boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.3)' }}
            >
              <LuPackageCheck size={18} style={{ marginRight: '8px' }} />
              Batch Process ({selectedReturnIds.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Pending Review', value: pendingCount, color: 'var(--warning)', icon: <LuClock size={20} />, bg: 'var(--warning-bg)' },
          { label: 'Approved Returns', value: approvedCount, color: 'var(--success)', icon: <LuCircleCheck size={20} />, bg: 'var(--success-bg)' },
          { label: 'Rejected / Void', value: rejectedCount, color: 'var(--danger)', icon: <LuCircleAlert size={20} />, bg: 'var(--danger-bg)' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="quick-stat glass-card lift"
            style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}
          >
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '16px', 
              background: stat.bg, color: stat.color, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `inset 0 0 12px ${stat.bg}`
            }}>
              {stat.icon}
            </div>
            <div>
              <div className="quick-stat-label" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{stat.label}</div>
              <div className="quick-stat-value" style={{ color: stat.color, fontSize: '1.75rem', fontWeight: 800 }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <Card className="glass-surface overflow-hidden no-print" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
            <LuSearch size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search ID, Order, or Client Account..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          
          <div className="tabs-row" style={{ borderBottom: 'none', gap: '0.5rem', margin: 0 }}>
            {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
              <button 
                key={f}
                className={`tab-btn ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
                style={{ fontSize: '0.85rem', padding: '0.6rem 1.25rem', borderRadius: '12px' }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <Table 
            columns={[
              {
                key: 'select',
                header: (
                  <input 
                    type="checkbox" 
                    onChange={(e) => {
                      if (e.target.checked) setSelectedReturnIds(filteredReturns.map(r => r.id));
                      else setSelectedReturnIds([]);
                    }}
                    checked={selectedReturnIds.length === filteredReturns.length && filteredReturns.length > 0}
                  />
                ),
                render: (r: any) => (
                  <input 
                    type="checkbox" 
                    checked={selectedReturnIds.includes(r.id)}
                    onChange={() => {
                      if (selectedReturnIds.includes(r.id)) setSelectedReturnIds(prev => prev.filter(id => id !== r.id));
                      else setSelectedReturnIds(prev => [...prev, r.id]);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )
              },
              { 
                key: 'id', 
                header: 'Return ID', 
                render: (r: any) => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>{r.id}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>REQ: {new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                )
              },
              { 
                key: 'orderId', 
                header: 'Order Ref',
                render: (r: any) => <span className="text-gradient" style={{ fontWeight: 700 }}>{r.orderId}</span>
              },
              { 
                key: 'company', 
                header: 'Client Account', 
                render: (r: any) => {
                  const company = companies.find(c => c.id === r.companyId);
                  return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800 }}>
                        {company?.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{company?.name || 'Unknown'}</span>
                    </div>
                  );
                }
              },
              { key: 'reason', header: 'Return Reason', render: (r: any) => <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>{r.reason}</span> },
              { key: 'status', header: 'Status', render: (r: any) => getStatusBadge(r.status) },
              { 
                key: 'actions', 
                header: '', 
                render: (r: any) => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {r.status === 'approved' && (
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadCreditNote(r)} title="Download Credit Note">
                        <LuUndo2 size={16} />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setSelectedReturn(r); setIsReviewOpen(true); }}
                      className="lift"
                      style={{ border: '1px solid var(--border)', borderRadius: '10px' }}
                    >
                      Inspect <LuChevronRight size={14} style={{ marginLeft: '4px' }} />
                    </Button>
                  </div>
                ) 
              }
            ]}
            data={filteredReturns}
          />
        </div>

        {filteredReturns.length === 0 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <LuRotateCcw size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>No returns found</h3>
            <p className="text-muted" style={{ margin: 0 }}>Try adjusting your search or filters.</p>
          </div>
        )}
      </Card>

      {/* Batch Action Modal */}
      <AnimatePresence>
        {isBatchModalOpen && (
          <Modal
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            title="Batch Fulfillment: Returns"
            className="glass-surface"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', background: 'var(--primary-bg)', borderRadius: '16px', border: '1px solid var(--primary-light)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>Selected Cohort</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                  You have selected <strong>{selectedReturnIds.length}</strong> return requests for bulk processing.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Button 
                  variant="ghost" 
                  onClick={() => handleBatchProcess('reject')}
                  style={{ height: '100px', flexDirection: 'column', gap: '0.5rem', color: 'var(--danger)', border: '1px solid var(--danger-light)' }}
                >
                  <LuX size={24} />
                  <div style={{ fontWeight: 700 }}>Reject Selected</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Mark as Void/Rejected</div>
                </Button>

                <Button 
                  variant="primary" 
                  onClick={() => handleBatchProcess('approve')}
                  style={{ height: '100px', flexDirection: 'column', gap: '0.5rem', background: 'var(--success)', border: 'none' }}
                >
                  <LuCheck size={24} />
                  <div style={{ fontWeight: 700 }}>Approve & Credit</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>Issue Refunds & Restock</div>
                </Button>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                Note: Approving will automatically restock non-damaged items to inventory.
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewOpen && selectedReturn && (
          <Modal 
            isOpen={isReviewOpen} 
            onClose={() => setIsReviewOpen(false)} 
            title="Return Request Details"
            className="glass-surface"
            style={{ maxWidth: '700px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Info Header */}
              <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.5rem', 
                background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' 
              }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Reference</div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedReturn.id}</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Order</div>
                  <div className="text-primary" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{selectedReturn.orderId}</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Client</div>
                  <div style={{ fontWeight: 700 }}>{companies.find(c => c.id === selectedReturn.companyId)?.name || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Status</div>
                  {getStatusBadge(selectedReturn.status)}
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LuCircleCheck size={18} className="text-success" /> Claims Items
                </h4>
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead style={{ background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left' }}>Product</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReturn.items.map((item: any) => {
                        const product = products.find(p => p.id === item.productId);
                        const order = orders.find((o: any) => o.customId === selectedReturn.orderId);
                        const unitPrice = order?.items.find((oi: any) => oi.productId === item.productId)?.unitPrice || product?.basePrice || 0;
                        const lineTotal = unitPrice * item.quantity;
                        
                        return (
                          <tr key={item.productId} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.75rem 1rem' }}>
                              <div style={{ fontWeight: 600 }}>{product?.name || item.productId}</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>SKU: {product?.sku}</div>
                            </td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{item.quantity}</td>
                            <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>₹{lineTotal.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {selectedReturn.status === 'approved' && (
                  <div style={{ marginTop: '0.5rem', textAlign: 'right', color: 'var(--success)', fontWeight: 700, fontSize: '0.9rem' }}>
                    <LuCheck size={14} /> Credits Returned to Account
                  </div>
                )}
              </div>

              {/* Photo & Reason */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0' }}>Client Note</h4>
                  <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '0.95rem', minHeight: '100px' }}>
                    {selectedReturn.reason}
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LuImage /> Photo Evidence</h4>
                  {selectedReturn.imageUrl ? (
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      style={{ 
                        border: '2px solid var(--border)', borderRadius: '12px', 
                        overflow: 'hidden', cursor: 'zoom-in', boxShadow: 'var(--shadow-lg)',
                        background: 'var(--surface-hover)'
                      }}
                    >
                      <img src={selectedReturn.imageUrl} alt="Return Evidence" style={{ width: '100%', display: 'block', maxHeight: '200px', objectFit: 'cover' }} />
                    </motion.div>
                  ) : (
                    <div style={{ 
                      height: '180px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                      background: 'linear-gradient(135deg, var(--surface-hover), rgba(var(--primary-rgb), 0.05))', 
                      borderRadius: '16px', border: '1px dashed var(--border)', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem'
                    }}>
                      <div style={{ 
                        width: '56px', height: '56px', borderRadius: '50%', background: 'white', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid var(--border)'
                      }}>
                        <LuImage size={24} className="text-primary" style={{ opacity: 0.5 }} />
                      </div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Visual Evidence Pending</div>
                      <p style={{ margin: 0, fontSize: '0.75rem', maxWidth: '200px', lineHeight: 1.4 }}>Client has not uploaded photographic proof for this claim yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Confirmation State */}
              <AnimatePresence>
                {selectedReturn.status === 'pending' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ 
                      display: 'flex', justifyContent: 'flex-end', gap: '1rem', 
                      marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' 
                    }}
                  >
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        if (confirm('Are you sure you want to reject this return request?')) {
                          handleReject();
                        }
                      }} 
                      style={{ color: 'var(--danger)', border: '1px solid var(--danger-light)', background: 'var(--danger-bg)' }}
                    >
                      <LuX size={16} /> Reject Request
                    </Button>
                    <Button 
                      variant="primary" 
                      onClick={() => {
                        if (confirm('Approve return and credit back funds? This will also update inventory for non-damaged items.')) {
                          handleApprove();
                        }
                      }} 
                      className="lift"
                    >
                      <LuCheck size={16} /> Approve & Return Credits
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReturnsManagement;
