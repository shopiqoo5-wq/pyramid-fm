import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { Button, Modal, PhotoUpload } from '../../components/ui';
import { 
  LuRotateCcw, 
  LuTriangle, 
  LuCheck, 
  LuPackage, 
  LuHistory,
  LuFileSearch
} from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import './PortalReturns.css';

const Returns: React.FC = () => {
  const { currentUser, orders, returnRequests, createReturn, uploadVerificationPhoto } = useStore((state: any) => state);
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [returnItem, setReturnItem] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState<'Damaged' | 'Wrong Item' | 'Excess Quantity' | 'Other'>('Damaged');
  const [returnPhotoUrl, setReturnPhotoUrl] = useState('');

  const eligibleOrders = useMemo(() => {
    if (!currentUser) return [];
    return orders.filter((o: any) => o.companyId === currentUser.companyId && o.status === 'delivered');
  }, [orders, currentUser]);

  const myReturns = useMemo(() => {
    if (!currentUser) return [];
    return returnRequests.filter((r: any) => r.companyId === currentUser.companyId);
  }, [returnRequests, currentUser]);

  const handleSubmitReturn = () => {
    if (!returnItem || !returnQty || !returnPhotoUrl) return;
    
    uploadVerificationPhoto({
      relatedId: selectedOrder.id,
      type: 'return',
      imageUrl: returnPhotoUrl,
      uploadedBy: currentUser!.id
    });

    createReturn({
      orderId: selectedOrder.id,
      companyId: currentUser!.companyId || '',
      reason: returnReason,
      imageUrl: returnPhotoUrl,
      requestedBy: currentUser!.id,
      items: [{ productId: returnItem, quantity: Number(returnQty) }]
    });

    setIsReturnModalOpen(false);
    setActiveTab('history');
    setReturnItem('');
    setReturnPhotoUrl('');
  };

  const getStatusMeta = (status: string) => {
    switch(status) {
      case 'pending': return { label: 'UNDER REVIEW', color: 'var(--warning)', dots: 1 };
      case 'approved': return { label: 'AUTHORIZED', color: 'var(--info)', dots: 2 };
      case 'completed': return { label: 'RESOLVED', color: 'var(--success)', dots: 3 };
      default: return { label: status.toUpperCase(), color: 'var(--text-muted)', dots: 1 };
    }
  };

  return (
    <div className="returns-container">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Reverse Logistics</h1>
          <p className="text-muted">High-fidelity facility asset replacement and RMA management terminal.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => setActiveTab(activeTab === 'history' ? 'new' : 'history')}>
            {activeTab === 'history' ? 'INITIATE RETURN' : 'VIEW RETURN HISTORY'}
          </Button>
          <Button variant="primary" className="btn-premium" onClick={() => setActiveTab('new')}>
            <LuRotateCcw size={18} /> INITIALIZE RMA
          </Button>
        </div>
      </div>

      <div className="rma-terminal">
         <div className="rma-header">
            <div style={{ display: 'flex', gap: '2rem' }}>
               <div className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'history' ? '2px solid var(--primary)' : 'none', color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'history' ? 600 : 400 }} onClick={() => setActiveTab('history')}>
                  <LuHistory size={18} style={{ marginRight: '8px' }} /> RMA ARCHIVE ({myReturns.length})
               </div>
               <div className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`} style={{ background: 'transparent', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', borderBottom: activeTab === 'new' ? '2px solid var(--primary)' : 'none', color: activeTab === 'new' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'new' ? 600 : 400 }} onClick={() => setActiveTab('new')}>
                  <LuFileSearch size={18} style={{ marginRight: '8px' }} /> ELIGIBLE PAYLOADS ({eligibleOrders.length})
               </div>
            </div>
         </div>

         <div style={{ padding: '2rem' }}>
            <AnimatePresence mode="wait">
              {activeTab === 'history' ? (
                <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {myReturns.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                       <LuRotateCcw size={48} className="text-muted" style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
                       <h3 style={{ fontWeight: 800 }}>No Active Claims</h3>
                       <p className="text-muted">Reverse logistics pipeline is currently empty.</p>
                    </div>
                  ) : (
                    myReturns.map((r: any) => {
                      const meta = getStatusMeta(r.status);
                      return (
                        <div key={r.id} className="return-card-premium">
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                 <LuPackage size={24} color={meta.color} />
                              </div>
                              <div>
                                 <div style={{ fontWeight: 900, fontSize: '1.1rem' }}>RMA-{r.id.slice(0, 8).toUpperCase()}</div>
                                 <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 700 }}>ORIGIN: {r.orderId} • {new Date(r.createdAt).toLocaleDateString()}</div>
                                 <div className="rma-status-tracker" style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                                    <div className={`rma-status-dot ${meta.dots >= 1 ? (r.status === 'completed' ? 'success' : 'active') : ''}`} style={{ height: '4px', width: '30px', borderRadius: '2px', background: meta.dots >= 1 ? meta.color : 'var(--border)' }} />
                                    <div className={`rma-status-dot ${meta.dots >= 2 ? (r.status === 'completed' ? 'success' : 'active') : ''}`} style={{ height: '4px', width: '30px', borderRadius: '2px', background: meta.dots >= 2 ? meta.color : 'var(--border)' }} />
                                    <div className={`rma-status-dot ${meta.dots >= 3 ? (r.status === 'completed' ? 'success' : 'active') : ''}`} style={{ height: '4px', width: '30px', borderRadius: '2px', background: meta.dots >= 3 ? meta.color : 'var(--border)' }} />
                                 </div>
                              </div>
                           </div>
                           <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: meta.color, letterSpacing: '1px', marginBottom: '0.25rem' }}>{meta.label}</div>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{r.reason.toUpperCase()}</div>
                           </div>
                        </div>
                      );
                    })
                  )}
                </motion.div>
              ) : (
                <motion.div key="new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1rem' }}>
                  {eligibleOrders.map((order: any) => (
                    <div key={order.id} className="eligible-order-card">
                       <div>
                          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>ORDER {order.customId}</div>
                          <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem' }}>DELIVERED: {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} ASSETS</div>
                       </div>
                       <Button variant="primary" size="sm" style={{ borderRadius: '10px' }} onClick={() => { setSelectedOrder(order); setIsReturnModalOpen(true); }}>
                          INITIATE RMA
                       </Button>
                    </div>
                  ))}
                  {eligibleOrders.length === 0 && (
                    <div className="glass-surface" style={{ gridColumn: '1/-1', padding: '4rem', textAlign: 'center' }}>
                       <LuTriangle size={40} className="text-muted" style={{ opacity: 0.3, marginBottom: '1rem' }} />
                       <h3 style={{ fontWeight: 800 }}>No Eligible Payloads</h3>
                       <p className="text-muted">Only orders currently in 'Delivered' state are eligible for reverse logistics.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>

      <Modal isOpen={isReturnModalOpen} onClose={() => setIsReturnModalOpen(false)} title={`Reverse Logistics Authorization: ${selectedOrder?.customId}`}>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '0.5rem' }}>
            <div>
               <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>ASSET SELECTION</label>
               <select className="input-premium" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-hover)', fontWeight: 700 }} value={returnItem} onChange={(e) => setReturnItem(e.target.value)}>
                  <option value="">Select an asset for extraction...</option>
                  {selectedOrder?.items.map((item: any) => (
                    <option key={item.productId} value={item.productId}>{item.productId} (Ordered: {item.quantity})</option>
                  ))}
               </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
               <div>
                  <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>QUANTITY</label>
                  <input type="number" min="1" className="input-premium" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-hover)', fontWeight: 800 }} value={returnQty} onChange={(e) => setReturnQty(Number(e.target.value))} />
               </div>
               <div>
                  <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>FAILURE LOGIC</label>
                  <select className="input-premium" style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-hover)', fontWeight: 800 }} value={returnReason} onChange={(e: any) => setReturnReason(e.target.value)}>
                    <option value="Damaged">PHYSICAL DAMAGE DETECTED</option>
                    <option value="Wrong Item">INCORRECT SKU MAPPING</option>
                    <option value="Excess Quantity">OVER-STOCKED SURPLUS</option>
                    <option value="Other">OPERATIONAL ANOMALY</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>TELEMETRY EVIDENCE</label>
               <div className="glass-surface" style={{ padding: '1rem', borderRadius: '16px' }}>
                  <PhotoUpload onUpload={(url: string) => setReturnPhotoUrl(url)} previewUrl={returnPhotoUrl} />
               </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
               <Button variant="ghost" style={{ flex: 1 }} onClick={() => setIsReturnModalOpen(false)}>CANCEL AXIS</Button>
               <Button variant="primary" className="btn-premium" style={{ flex: 2 }} onClick={handleSubmitReturn} disabled={!returnItem || !returnPhotoUrl}>
                  <LuCheck size={18} /> AUTHORIZE RETURN
               </Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default Returns;
