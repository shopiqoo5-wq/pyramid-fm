import React from 'react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuX, 
  LuShieldCheck, 
  LuClock, 
  LuBuilding, 
  LuPackage, 
  LuTriangle,
  LuFileSearch,
  LuZap,
  LuClipboardCheck,
  LuArrowUpRight,
  LuCheck
} from 'react-icons/lu';
import { Button, Modal, Table } from '../../components/ui';
import type { Order } from '../../types';
import './PortalApprovals.css';

const Approvals: React.FC = () => {
  const { orders, currentUser, approveOrder, updateOrderStatus, locations, products } = useStore((state: any) => state);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  const pendingOrders = orders.filter((o: any) =>
    o.companyId === currentUser?.companyId &&
    (o.status === 'pending_approval' || o.status === 'pending')
  );

  const approvedTotal = orders.filter((o: any) =>
    o.companyId === currentUser?.companyId && o.status === 'approved'
  ).length;

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (!['client_manager', 'client_director', 'admin'].includes(currentUser?.role || '')) {
    return (
      <div className="empty-state-full" style={{ marginTop: '4rem' }}>
        <div style={{ width: '100px', height: '100px', background: 'var(--warning-bg)', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--warning)' }}>
          <LuShieldCheck size={56} />
        </div>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Authorization Required</h3>
        <p className="text-muted" style={{ maxWidth: '400px', margin: '0.5rem auto' }}>
          This hub is restricted to operational managers and corporate directors. Please contact your administrator for governance permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="approvals-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Governance Console</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>Audit and authorize procurement requests across your organizational facilities.</p>
        </div>
      </div>

      <div className="approval-stats">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="approval-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}><LuClock size={20} /></div>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Awaiting Authorization</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>{pendingOrders.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Urgent requests requiring review</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="approval-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}><LuClipboardCheck size={20} /></div>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Total Authorized</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>{approvedTotal}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Operational orders finalized</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="approval-stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}><LuZap size={20} /></div>
          <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Exposure Value</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
            {fmt(pendingOrders.reduce((s: number, o: any) => s + o.netAmount, 0))}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Volume pending capital allocation</div>
        </motion.div>
      </div>

      <div className="request-queue">
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Pending Request Pipeline</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Priority Sort by Recency</span>
        </div>

        <AnimatePresence mode="popLayout">
          {pendingOrders.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state-full" style={{ padding: '4rem' }}>
              <div style={{ width: '80px', height: '80px', background: 'var(--surface-hover)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--text-muted)' }}>
                <LuFileSearch size={40} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Pipeline Fully Audited</h3>
              <p className="text-muted">No procurement requests are currently awaiting your signature.</p>
            </motion.div>
          ) : (
            pendingOrders.map((order: any, i: number) => {
              const location = locations.find((l: any) => l.id === order.locationId);
              const isHighValue = order.netAmount >= 100000;

              const hasSignedAlready = order.approvalChain?.some((c: any) => c.userId === currentUser?.id);
              const needsDirector = isHighValue && !(order.approvalChain?.some((c: any) => c.role === 'client_director' || c.role === 'admin'));
              const isPendingDirector = needsDirector && order.approvalChain?.length > 0;
              
              const canSign = !hasSignedAlready && (!isPendingDirector || ['client_director', 'admin'].includes(currentUser?.role || ''));

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="request-card"
                >
                  <div className="stat-icon-wrapper" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', margin: 0 }}>
                    <LuTriangle size={20} />
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div className="request-id">#{order.customId}</div>
                    <div className="request-meta">
                      <span><LuBuilding size={12} /> {location?.name || 'Central HQ'}</span>
                      <span><LuClock size={12} /> {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span><LuPackage size={12} /> {order.items.length} Line Items</span>
                    </div>
                  </div>

                  {isHighValue && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '4px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start' }}>
                        <LuTriangle size={12} /> TIER 2 REQUIRED
                      </div>
                      {isPendingDirector && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <LuClock size={12} /> Awaiting Director Signature
                        </div>
                      )}
                    </div>
                  )}

                  <div className="request-value">{fmt(order.netAmount)}</div>

                  <div className="approval-actions">
                    <button className="btn-reject" onClick={() => updateOrderStatus(order.id, 'cancelled')} title="Reject Request">
                      <LuX size={18} />
                    </button>
                    <button className="btn-finance-action" onClick={() => setSelectedOrder(order)} style={{ background: 'var(--surface-hover)' }}>
                      Review items
                    </button>
                    {canSign ? (
                      <button className="btn-approve-direct" onClick={() => approveOrder(order.id, currentUser!.id, currentUser!.role)}>
                        {isPendingDirector ? 'Final Sign-off' : 'Authorize'} <LuArrowUpRight size={14} />
                      </button>
                    ) : (
                      <button className="btn-approve-direct" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }}>
                        <LuCheck size={14} /> Signed
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <Modal
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            title={`Procurement Audit: #${selectedOrder.customId}`}
          >
            <div style={{ padding: '0.5rem' }}>
              <div className="ledger-card" style={{ boxShadow: 'none', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
                <Table
                  columns={[
                    { key: 'productId', header: 'Asset Designation', render: (row: any) => <span style={{ fontWeight: 700 }}>{products.find((p: any) => p.id === row.productId)?.name || 'Unknown Item'}</span> },
                    { key: 'quantity', header: 'Qty', render: (row: any) => <span style={{ fontWeight: 800 }}>{row.quantity}</span> },
                    { key: 'total', header: 'Value', render: (row: any) => <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>₹{Number(row.total).toLocaleString()}</span> }
                  ]}
                  data={selectedOrder.items}
                />
              </div>

              {selectedOrder.approvalChain && selectedOrder.approvalChain.length > 0 && (
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                   <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><LuShieldCheck className="text-success" /> Endorsement History</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedOrder.approvalChain.map((approve, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 900 }}>OK</div>
                              <div>
                                 <div style={{ fontWeight: 800 }}>{approve.userName || 'Authorized Personnel'}</div>
                                 <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{approve.role.replace('_', ' ').toUpperCase()}</div>
                              </div>
                           </div>
                           <div className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(approve.timestamp).toLocaleString()}</div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              <div className="review-summary-box">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>Authorization Total</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{fmt(selectedOrder.netAmount)}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Button variant="ghost" onClick={() => { updateOrderStatus(selectedOrder.id, 'cancelled'); setSelectedOrder(null); }} style={{ color: '#ef4444' }}>Reject</Button>
                  <Button variant="primary" onClick={() => { approveOrder(selectedOrder.id, currentUser!.id, currentUser!.role); setSelectedOrder(null); }} style={{ borderRadius: '12px' }}>Confirm Authorization</Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Approvals;
