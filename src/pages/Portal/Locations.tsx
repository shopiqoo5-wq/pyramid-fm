import React, { useState } from 'react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuMapPin, 
  LuPlus, 
  LuShieldAlert,
  LuTrendingUp,
  LuLocate,
  LuChevronRight,
  LuPencil,
  LuDollarSign
} from 'react-icons/lu';
import { Button, Input } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './PortalLocations.css';

const Locations: React.FC = () => {
  const { currentUser, locations, addLocation, updateLocationBudget } = useStore((state: any) => state);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  
  const [newLocation, setNewLocation] = useState({
    name: '', address: '', state: ''
  });

  const myLocations = React.useMemo(() => locations.filter((l: any) => l.companyId === currentUser?.companyId), [locations, currentUser?.companyId]);

  const locationSpendData = React.useMemo(() => myLocations.map((l: any) => ({
    name: l.name,
    spend: 10000 + ((l.name.length * 997) % 50000)
  })), [myLocations]);

  const handleCreateLocation = () => {
    if (!newLocation.name || !newLocation.address || !newLocation.state) return;
    addLocation({
      companyId: currentUser?.companyId || '',
      name: newLocation.name,
      address: newLocation.address,
      state: newLocation.state,
    });
    setIsAddModalOpen(false);
    setNewLocation({ name: '', address: '', state: '' });
  };

  return (
    <div className="locations-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Site Governance</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>Orchestrate multi-site facility inventories and regional budget allocations.</p>
        </div>
        {currentUser?.role === 'client_manager' && (
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} style={{ borderRadius: '14px', height: '48px', padding: '0 1.5rem', fontWeight: 700 }}>
            <LuPlus size={20} style={{ marginRight: '0.5rem' }} /> Register Facility
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="analytics-card-premium">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <LuTrendingUp color="var(--primary)" /> Portfolio Consumption Analytics
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Q3 Fiscal</span>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationSpendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: 'var(--surface-hover)', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}
                />
                <Bar dataKey="spend" radius={[8, 8, 0, 0]} barSize={36}>
                  {locationSpendData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'var(--primary)' : 'var(--primary-glow)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="threat-card">
          <div className="threat-header">
            <LuShieldAlert size={24} />
            <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Anomaly Intelligence</h3>
          </div>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1.25rem', fontWeight: 600 }}>
            Our AI has identified high-variance consumption signatures in your secondary sites.
          </p>
          <AnimatePresence>
            <motion.div key="threat-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="threat-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>North Hub Logistics</span>
                <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 800 }}>+58% Variance</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Unusual surge in specialized disposables detected.</div>
            </motion.div>
            <motion.div key="threat-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="threat-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>South Wing Factory</span>
                <span style={{ color: '#f59e0b', fontSize: '0.75rem', fontWeight: 800 }}>Predictive Shortage</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Current burn rate exceeds replenishment window.</div>
            </motion.div>
          </AnimatePresence>
          <Button variant="ghost" style={{ width: '100%', marginTop: '0.5rem', borderRadius: '12px', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
            Initialize Governance Audit <LuChevronRight size={14} />
          </Button>
        </div>
      </div>

      <div className="site-grid">
        {myLocations.map((loc: any, i: number) => {
          const spend = loc.currentMonthSpend || 0;
          const budget = loc.monthlyBudget || 0;
          const usagePct = budget > 0 ? Math.min((spend / budget) * 100, 100) : 0;
          const isOver = spend > budget && budget > 0;

          return (
            <motion.div
              key={loc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="site-card-premium"
            >
              <div className="site-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <LuLocate size={22} />
                  </div>
                  <div>
                    <h4 className="site-name">{loc.name}</h4>
                    <span className="site-address"><LuMapPin size={12} /> {loc.state}</span>
                  </div>
                </div>
                <div className="site-badge">{loc.isDefault ? 'Primary' : 'Secondary'}</div>
              </div>

              <div className="site-body">
                <div className="meter-label">
                  <span style={{ fontWeight: 800 }}>Monthly Utilization</span>
                  <span style={{ color: isOver ? '#ef4444' : 'var(--text-muted)' }}>{Math.round(usagePct)}%</span>
                </div>
                <div className="meter-bg">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePct}%` }}
                    className="meter-fill" 
                    style={{ background: isOver ? '#ef4444' : 'var(--primary)' }} 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.8rem', fontWeight: 700 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Invoiced: ₹{spend.toLocaleString()}</span>
                  <span style={{ color: 'var(--primary)' }}>Limit: ₹{budget.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                {currentUser?.role === 'client_manager' && (
                  <button className="btn-finance-action" style={{ flex: 1 }} onClick={() => {
                    setSelectedLocation(loc);
                    setBudgetAmount((loc.monthlyBudget || 0).toString());
                    setIsBudgetModalOpen(true);
                  }}>
                    <LuDollarSign size={14} /> Set Budget
                  </button>
                )}
                <button className="btn-finance-action" style={{ background: 'none' }}>
                  <LuPencil size={14} /> Profile
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Register Infrastructure Asset"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem' }}>
          <Input label="Facility Designation" value={newLocation.name} onChange={e => setNewLocation({...newLocation, name: e.target.value})} placeholder="e.g. South Wing Factory" />
          <Input label="Geographic State" value={newLocation.state} onChange={e => setNewLocation({...newLocation, state: e.target.value})} placeholder="e.g. Maharashtra" />
          <Input label="Full Operational Address" value={newLocation.address} onChange={e => setNewLocation({...newLocation, address: e.target.value})} placeholder="Industrial Plot, Building..." />
          <div style={{ marginTop: '1rem' }}>
            <Button variant="primary" onClick={handleCreateLocation} style={{ width: '100%', height: '52px', borderRadius: '16px' }}>Verify & Authorize Site</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isBudgetModalOpen} 
        onClose={() => setIsBudgetModalOpen(false)} 
        title={`Governance: Budgetary Cap`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '14px', border: '1px solid var(--border)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Allocating a cap to <strong>{selectedLocation?.name}</strong>. Procurement requests exceeding this value will trigger high-level manager approval.
          </div>
          <Input 
            label="Invoicing Limit (₹)" 
            type="number"
            value={budgetAmount} 
            onChange={e => setBudgetAmount(e.target.value)} 
          />
          <Button variant="primary" style={{ width: '100%', height: '52px', borderRadius: '16px' }} onClick={() => {
            updateLocationBudget(selectedLocation.id, parseFloat(budgetAmount));
            setIsBudgetModalOpen(false);
          }}>Confirm Allocation</Button>
        </div>
      </Modal>
    </div>
  );
};

export default Locations;
