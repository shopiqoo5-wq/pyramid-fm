import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui';
import {
  LuTruck, 
  LuPackage, 
  LuMapPin,
  LuSearch, 
  LuChevronRight, 
  LuBox, 
  LuWarehouse,
  LuFactory,
  LuActivity,
  LuLayoutGrid,
  LuHistory
} from 'react-icons/lu';
import './PortalTracking.css';

const statusOrder = ['pending', 'approved', 'packed', 'dispatched', 'delivered'];
const statusMeta: Record<string, { label: string; icon: any; color: string }> = {
  pending:    { label: 'Payload Initialized',   icon: <LuBox size={18} />,         color: 'var(--text-muted)' },
  approved:   { label: 'Authorized' ,           icon: <LuActivity size={18} />,   color: 'var(--info)' },
  packed:     { label: 'Assets Consolidated',   icon: <LuPackage size={18} />,     color: 'var(--warning)' },
  dispatched: { label: 'In Global Transit',     icon: <LuTruck size={18} />,       color: 'var(--primary)' },
  delivered:  { label: 'Site Fulfillment',      icon: <LuMapPin size={18} />,      color: 'var(--success)' },
};

const OrderTracking: React.FC = () => {
  const { orders, currentUser } = useStore((state: any) => state);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const clientOrders = useMemo(() => orders
    .filter((o: any) => o.companyId === currentUser?.companyId)
    .filter((o: any) => ['approved', 'packed', 'dispatched', 'delivered'].includes(o.status))
    .filter((o: any) => !search || o.customId?.toLowerCase().includes(search.toLowerCase())),
  [orders, currentUser, search]);

  const selectedOrder = useMemo(() => clientOrders.find((o: any) => o.id === selected) || clientOrders[0], [clientOrders, selected]);

  const getStep = (orderStatus: string) => statusOrder.indexOf(orderStatus);

  const estDelivery = (createdAt: string) => {
    const d = new Date(createdAt);
    d.setDate(d.getDate() + 3);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  if (clientOrders.length === 0) {
    return (
      <div className="empty-state-full" style={{ padding: '8rem 2rem' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-surface" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className="icon-circle-premium" style={{ margin: '0 auto 1.5rem' }}>
            <LuTruck size={40} />
          </div>
          <h2 className="text-gradient">No Active Logistics</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Your procurement pipeline is currently clear. No active shipments detected in the regional network.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/portal/catalog')}>Initialize Catalog</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="tracking-page">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Supply Chain Pulse</h1>
          <p className="text-muted">High-fidelity real-time telemetry of your facility assets in transit.</p>
        </div>
        <div className="tag-premium highlight">
           LIVE NETWORK STATUS: NOMINAL
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem' }}>
        <div className="tracking-sidebar">
          <div className="input-with-icon-premium" style={{ marginBottom: '1rem' }}>
            <LuSearch className="input-icon" size={18} />
            <input 
              type="text" placeholder="Trace Shipment ID..." 
              value={search} onChange={e => setSearch(e.target.value)} 
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '14px', border: '1px solid var(--border)', background: 'var(--surface)', fontSize: '0.9rem', outline: 'none', color: 'var(--text-main)' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {clientOrders.map((order: any) => (
              <motion.div
                key={order.id}
                whileHover={{ x: 5 }}
                onClick={() => setSelected(order.id)}
                className={`tracking-order-card ${selectedOrder?.id === order.id ? 'selected' : ''}`}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', borderRadius: '18px', background: selectedOrder?.id === order.id ? 'var(--surface-hover)' : 'var(--surface)', border: '1px solid var(--border)' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  {statusMeta[order.status]?.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>#{order.customId}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{order.items.length} ASSETS • EST. {estDelivery(order.createdAt)}</div>
                </div>
                {order.status === 'delivered' ? <LuPackage color="var(--success)" size={20} /> : <LuChevronRight color="var(--border)" size={20} />}
              </motion.div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
        {selectedOrder && (
          <motion.div 
            key={selectedOrder.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="tracker-console"
          >
            <div className="tracker-header" style={{ padding: '2rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem', opacity: 0.9, color: 'var(--primary)' }}>Logistics Telemetry</div>
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{selectedOrder.customId}</h2>
                  <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
                    <div className="tracker-header-stat">
                       <span style={{ opacity: 0.7, fontSize: '0.7rem', display: 'block', marginBottom: '0.2rem' }}>ORIGIN HUB</span>
                       <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>PYRAMID CENTRAL-MH</span>
                    </div>
                    <div className="tracker-header-stat">
                       <span style={{ opacity: 0.7, fontSize: '0.7rem', display: 'block', marginBottom: '0.2rem' }}>DESTINATION SITE</span>
                       <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{selectedOrder.locationId?.toUpperCase() || 'PRIMARY-FACILITY'}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div className="status-badge-premium" style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.75rem' }}>
                      {statusMeta[selectedOrder.status]?.label.toUpperCase()}
                   </div>
                </div>
              </div>
            </div>

            <div className="timeline-premium" style={{ padding: '2rem' }}>
              {statusOrder.map((status, i) => {
                const currentStep = getStep(selectedOrder.status);
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;
                const meta = statusMeta[status];

                return (
                  <div key={status} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', position: 'relative' }}>
                    {i < statusOrder.length - 1 && (
                      <div className={`timeline-line ${i < currentStep ? 'active' : ''}`} style={{ position: 'absolute', left: '19px', top: '40px', bottom: '-20px', width: '2px', background: i < currentStep ? 'var(--primary)' : 'var(--border)' }} />
                    )}
                    <div className="timeline-icon-wrap" style={{ width: '40px', height: '40px', borderRadius: '50%', background: isCompleted ? 'var(--primary)' : 'var(--surface)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isCompleted ? 'white' : 'var(--text-muted)', zIndex: 2 }}>
                      {meta.icon}
                    </div>
                    <div className="timeline-content">
                       <div style={{ fontSize: '1rem', fontWeight: 800, color: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--text-main)' : 'var(--text-muted)' }}>
                         {meta.label}
                       </div>
                       <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                         {isCurrent ? `Live updates available from Regional Hub ${i+1}.` : isCompleted ? 'Phase verified and logged in blockchain.' : 'Phase pending carrier authorization.'}
                       </p>
                    </div>
                    {isCurrent && (
                       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="live-pulse" style={{ marginLeft: 'auto', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                         <LuActivity size={12} className="animate-pulse" /> LIVE TELEMETRY
                       </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="logistics-blueprint" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border)' }}>
              <div className={`hub-node ${getStep(selectedOrder.status) >= 0 ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, color: getStep(selectedOrder.status) >= 0 ? 'var(--primary)' : 'var(--text-muted)' }}>
                 <LuFactory size={24} />
                 <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>PRODUCTION</span>
              </div>
              <div style={{ flex: 1, borderBottom: '2px dashed var(--border)' }} />
              <div className={`hub-node ${getStep(selectedOrder.status) >= 2 ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, color: getStep(selectedOrder.status) >= 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
                 <LuWarehouse size={24} />
                 <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>REGIONAL HUB</span>
              </div>
              <div style={{ flex: 1, borderBottom: '2px dashed var(--border)' }} />
              <div className={`hub-node ${getStep(selectedOrder.status) >= 3 ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, color: getStep(selectedOrder.status) >= 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
                 <LuTruck size={24} />
                 <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>TRANSIT</span>
              </div>
              <div style={{ flex: 1, borderBottom: '2px dashed var(--border)' }} />
              <div className={`hub-node ${getStep(selectedOrder.status) >= 4 ? 'active' : ''}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, color: getStep(selectedOrder.status) >= 4 ? 'var(--primary)' : 'var(--text-muted)' }}>
                 <LuMapPin size={24} />
                 <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>FULFILLED</span>
              </div>
            </div>
            
            <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--surface-hover)', borderRadius: '0 0 28px 28px' }}>
               <Button variant="ghost" onClick={() => navigate('/portal/orders')}>
                  <LuLayoutGrid size={18} style={{ marginRight: '8px' }} /> FULL AUDIT TRAIL
               </Button>
               <Button variant="primary" style={{ borderRadius: '12px' }}>
                  <LuHistory size={18} style={{ marginRight: '8px' }} /> SUPPORT INTERFACE
               </Button>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrderTracking;
