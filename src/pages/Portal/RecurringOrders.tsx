import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuRepeat, 
  LuPlus, 
  LuTrash2, 
  LuPlay, 
  LuPause, 
  LuSave,
  LuCalendar, 
  LuPackage, 
  LuZap, 
  LuCheck,
  LuClock,
  LuActivity
} from 'react-icons/lu';
import { useStore } from '../../store';
import { Button } from '../../components/ui';
import './PortalRecurring.css';

const FREQUENCIES = [
  { label: 'Weekly', days: 7 },
  { label: 'Bi-Weekly', days: 14 },
  { label: 'Monthly', days: 30 },
  { label: 'Quarterly', days: 90 },
];

const RecurringOrders: React.FC = () => {
  const {
    recurringOrders, addRecurringOrder, toggleRecurringOrderStatus,
    deleteRecurringOrder, cart, currentUser, products, getClientPrice
  } = useStore();
  const [activeTab, setActiveTab] = useState<'active' | 'create'>('active');
  const [frequency, setFrequency] = useState(30);

  const myOrders = useMemo(() => recurringOrders.filter((o: any) => o.companyId === currentUser?.companyId), [recurringOrders, currentUser]);
  const activeCount = myOrders.filter((o: any) => o.status === 'active').length;
  const pausedCount = myOrders.filter((o: any) => o.status === 'paused').length;

  const handleCreate = () => {
    if (!currentUser || cart.length === 0) return;
    addRecurringOrder({
      companyId: currentUser.companyId!,
      locationId: currentUser.locationId ?? '',
      placedBy: currentUser.id,
      items: cart.map((c: any) => {
        const price = getClientPrice(c.productId, currentUser.companyId!);
        return {
          id: `ri-${c.productId}`,
          productId: c.productId,
          quantity: c.quantity,
          unitPrice: price,
          gstAmount: 0,
          total: c.quantity * price,
        };
      }),
      frequencyDays: frequency,
      nextDeliveryDate: new Date(Date.now() + frequency * 86400000).toISOString(),
      status: 'active',
    });
    setActiveTab('active');
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  return (
    <div className="recurring-container">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800 }}>Asset Velocity</h1>
          <p className="text-muted">Autonomous replenishment infrastructure for high-consumption facility assets.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="ghost" onClick={() => setActiveTab(activeTab === 'active' ? 'create' : 'active')}>
             {activeTab === 'active' ? 'CONFIGURE NEW FLOW' : 'VIEW RUNNING PIPELINES'}
          </Button>
          <Button variant="primary" className="btn-premium" onClick={() => setActiveTab('create')}>
            <LuPlus size={18} /> INITIALIZE AUTOMATION
          </Button>
        </div>
      </div>

      <div className="velocity-grid">
         {[
           { label: 'RUNNING PIPELINES', value: activeCount, color: 'var(--success)', icon: <LuZap size={20} /> },
           { label: 'THROTTLED/PAUSED', value: pausedCount, color: 'var(--warning)', icon: <LuPause size={20} /> },
           { label: 'AUTO-MANAGED NODES', value: myOrders.length, color: 'var(--primary)', icon: <LuActivity size={20} /> },
         ].map((stat, i) => (
           <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="velocity-stat-premium">
              <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color }}>
                 {stat.icon}
              </div>
              <div>
                 <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>{stat.label}</div>
                 <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)' }}>{stat.value}</div>
              </div>
           </motion.div>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'active' ? (
          <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            {myOrders.length === 0 ? (
              <div className="empty-state-full glass-surface" style={{ padding: '6rem 2rem' }}>
                <LuRepeat size={48} color="var(--border)" />
                <h3 style={{ marginTop: '1.5rem', fontWeight: 800 }}>No Active Automation</h3>
                <p className="text-muted">Supply chain autonomy is currently disabled. Configure a flow to begin.</p>
                <Button variant="primary" style={{ marginTop: '2rem' }} onClick={() => setActiveTab('create')}>CONFIGURE PIPELINE</Button>
              </div>
            ) : (
              myOrders.map((order: any, idx: number) => (
                <motion.div 
                  key={order.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: idx * 0.05 }}
                  className={`schedule-card-premium ${order.status === 'paused' ? 'paused' : ''}`}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(var(--primary-rgb), 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <LuClock size={28} />
                  </div>
                  
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>REPLENISHMENT EVERY {order.frequencyDays} DAYS</div>
                    <div className="text-muted" style={{ fontSize: '0.85rem', display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><LuPackage size={14} /> {order.items.length} Asset Clusters</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><LuCalendar size={14} /> NEXT INJECTION: {new Date(order.nextDeliveryDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '140px' }}>
                     <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--primary)' }}>
                        {formatPrice(order.items.reduce((acc: number, item: any) => acc + item.total, 0))}
                     </div>
                     <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700 }}>EST. PAYLOAD VALUE</div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <button 
                      className="icon-btn-premium sm" 
                      onClick={() => toggleRecurringOrderStatus(order.id)}
                      title={order.status === 'active' ? 'Pause Automation' : 'Resume Automation'}
                    >
                      {order.status === 'active' ? <LuPause size={16} /> : <LuPlay size={16} />}
                    </button>
                    <button 
                      className="icon-btn-premium sm danger" 
                      onClick={() => deleteRecurringOrder(order.id)}
                      title="Terminate Pipeline"
                    >
                      <LuTrash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="automation-wizard mx-auto">
            <h2 style={{ fontWeight: 900, marginBottom: '0.5rem' }}>Automation Architect</h2>
            <p className="text-muted" style={{ marginBottom: '2.5rem' }}>Initialize a scheduled procurement logic based on your current cart payload.</p>

            {cart.length === 0 ? (
              <div className="alert-premium warning" style={{ marginBottom: '2rem' }}>
                <LuZap size={20} />
                <div>
                   <div style={{ fontWeight: 800 }}>CART PAYLOAD EMPTY</div>
                   <div style={{ opacity: 0.9 }}>Infrastructure logic requires a base asset mapping. Populate cart first.</div>
                </div>
              </div>
            ) : (
              <div className="glass-surface" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--primary-light)' }}>
                 <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <LuCheck size={18} /> ASSET CLUSTERS READY ({cart.length})
                 </div>
                 {cart.slice(0, 3).map((c: any) => (
                   <div key={c.productId} style={{ fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                      • {products.find((p: any) => p.id === c.productId)?.name} [x{c.quantity}]
                   </div>
                 ))}
                 {cart.length > 3 && <div className="text-muted" style={{ fontSize: '0.75rem' }}>+ {cart.length - 3} additional clusters</div>}
              </div>
            )}

            <div style={{ marginBottom: '2rem' }}>
               <label style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Replenishment Velocity</label>
               <div className="frequency-selector-premium">
                 {FREQUENCIES.map(f => (
                   <div 
                    key={f.days} 
                    className={`freq-btn-premium ${frequency === f.days ? 'active' : ''}`}
                    onClick={() => setFrequency(f.days)}
                   >
                     {f.label}
                   </div>
                 ))}
               </div>
            </div>

            <div style={{ background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
               <LuCalendar size={20} color="var(--primary)" />
               <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>INITIAL INJECTION PHASE</div>
                  <div style={{ fontWeight: 800 }}>{new Date(new Date().getTime() + frequency * 86400000).toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
               <Button variant="ghost" style={{ flex: 1 }} onClick={() => setActiveTab('active')}>CANCEL</Button>
               <Button variant="primary" className="btn-premium" style={{ flex: 2 }} onClick={handleCreate} disabled={cart.length === 0}>
                  <LuSave size={18} /> AUTHORIZE AUTOMATION
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecurringOrders;
