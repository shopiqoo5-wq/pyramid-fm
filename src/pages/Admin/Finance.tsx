import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { Card, Table, Button } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { 
  LuHistory,
  LuArrowUpRight,
  LuCalculator,
  LuShieldCheck,
  LuShieldAlert,
  LuTrendingUp,
  LuDownload,
  LuBanknote,
  LuFileJson,
  LuActivity,
  LuCircleCheck,
  LuScale
} from 'react-icons/lu';
import { downloadTallyXML } from '../../lib/tallyExport';

const Finance: React.FC = () => {
  const orders = useStore(state => state.orders);
  const companies = useStore(state => state.companies);
  const locations = useStore(state => state.locations);
  const markOrdersAsTallyExported = useStore(state => state.markOrdersAsTallyExported);
  
  const [activeTab, setActiveTab] = useState<'ledger' | 'tax' | 'risk'>('ledger');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrdersToPay, setSelectedOrdersToPay] = useState<string[]>([]);

  // Finance Ledger Data
  const financeData = companies.map(c => {
    const clientOrders = orders.filter(o => o.companyId === c.id && !['pending', 'pending_director', 'cancelled'].includes(o.status));
    const totalBilled = clientOrders.reduce((acc, o) => acc + o.netAmount, 0);
    const tdsDeducted = clientOrders.reduce((acc, o) => acc + (o.tdsDeducted || 0), 0);
    
    let paidAmount = 0;
    let pendingAmount = 0;
    const unpaidOrders: any[] = [];

    clientOrders.forEach(o => {
      if (o.isPaid) {
        paidAmount += o.netAmount;
      } else {
        pendingAmount += o.netAmount;
        unpaidOrders.push(o);
      }
    });

    return {
      id: c.id,
      name: c.name,
      totalBilled,
      paidAmount,
      pendingAmount,
      tdsDeducted,
      unpaidOrders,
      status: pendingAmount > 50000 ? 'Attention' : 'Healthy'
    };
  });

  // Reconcile Actions
  const handleOpenReconcile = (clientData: any) => {
    setSelectedClient(clientData);
    setSelectedOrdersToPay([]);
    setIsModalOpen(true);
  };

  const handleToggleOrderSelection = (orderId: string) => {
    setSelectedOrdersToPay(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleReconcileSelected = () => {
    if (selectedClient && selectedOrdersToPay.length > 0) {
      useStore.getState().markAsReconciled(selectedClient.id, selectedOrdersToPay);
      setIsModalOpen(false);
      setSelectedClient(null);
      setSelectedOrdersToPay([]);
    }
  };

  const handleExportTally = () => {
    if (selectedClient && selectedOrdersToPay.length > 0) {
      const ordersToSync = orders.filter(o => selectedOrdersToPay.includes(o.id));
      downloadTallyXML(ordersToSync, companies, `Tally_Sales_${selectedClient.name}`);
      markOrdersAsTallyExported(selectedOrdersToPay);
    }
  };

  const handleGlobalTallyExport = () => {
    const allUnreconciledOrders = orders.filter(o => !['pending', 'pending_director', 'cancelled'].includes(o.status) && !o.isPaid);
    if (allUnreconciledOrders.length > 0) {
      downloadTallyXML(allUnreconciledOrders, companies, 'Tally_Global_Sales');
      markOrdersAsTallyExported(allUnreconciledOrders.map(o => o.id));
    }
  };

  // Tax Summary Calculations
  const taxData = orders
    .filter(o => !['pending', 'pending_director', 'cancelled'].includes(o.status))
    .map(order => {
      const location = locations.find(l => l.id === order.locationId);
      const company = companies.find(c => c.id === order.companyId);
      const isInterState = location?.state !== 'Maharashtra'; 
      const taxableValue = order.totalAmount;
      const totalGst = (taxableValue * 0.18); 
      
      return {
        orderId: order.customId,
        companyName: company?.name || 'Unknown',
        date: order.createdAt,
        state: location?.state || 'Unknown',
        taxableValue,
        cgst: isInterState ? 0 : totalGst / 2,
        sgst: isInterState ? 0 : totalGst / 2,
        igst: isInterState ? totalGst : 0,
        tds: order.tdsDeducted || 0,
        totalInvoice: order.netAmount
      };
    });

  const aggregateTax = {
    cgst: taxData.reduce((acc, row) => acc + row.cgst, 0),
    sgst: taxData.reduce((acc, row) => acc + row.sgst, 0),
    igst: taxData.reduce((acc, row) => acc + row.igst, 0),
    tds: taxData.reduce((acc, row) => acc + row.tds, 0),
    totalTaxable: taxData.reduce((acc, row) => acc + row.taxableValue, 0)
  };

  const formatCurrency = (amt: number) => `₹${amt.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Premium Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.05) 0%, transparent 100%)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(var(--primary-rgb), 0.1)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
             <span className="status-badge info" style={{ padding: '4px 12px', fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 900 }}>SYSTEM TREASURY</span>
             <span className="text-muted" style={{ fontSize: '0.75rem' }}>• Last Sync: {new Date().toLocaleTimeString()}</span>
          </div>
          <h2 className="text-gradient" style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>Treasury & Tax Command</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.5rem', maxWidth: '600px' }}>Orchestrate corporate ledgers, credit risk velocity, and inter-state tax fulfillment with precision.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={handleGlobalTallyExport} className="lift shadow-sm" style={{ gap: '0.6rem', padding: '0.8rem 1.5rem', borderRadius: '14px' }}>
            <LuFileJson size={20} /> Tally Bulk Sync
          </Button>
          <Button variant="primary" onClick={() => {}} className="lift shadow-glow" style={{ gap: '0.6rem', padding: '0.8rem 1.5rem', borderRadius: '14px' }}>
            <LuActivity size={20} /> Fiscal Insights
          </Button>
        </div>
      </div>

      {/* Modern Tabs (Restored to Horizontal Row) */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="glass-surface shadow-lg" style={{ padding: '0.6rem', display: 'flex', flexDirection: 'row', gap: '0.6rem', borderRadius: '22px', border: '1px solid var(--border)' }}>
          {[
            { id: 'ledger', label: 'CLIENT LEDGERS', icon: <LuBanknote size={20} /> },
            { id: 'risk', label: 'CREDIT & RISK HUB', icon: <LuShieldAlert size={20} /> },
            { id: 'tax', label: 'TAX & COMPLIANCE', icon: <LuCalculator size={20} /> }
          ].map((tab) => (
            <button 
              key={tab.id}
              className={`tab-btn-premium ${activeTab === tab.id ? 'active' : ''}`} 
              onClick={() => setActiveTab(tab.id as any)} 
              style={{ 
                padding: '1rem 2.5rem', 
                borderRadius: '16px', 
                gap: '0.75rem', 
                minWidth: '240px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                whiteSpace: 'nowrap',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'ledger' ? (
          <motion.div key="ledger" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* High-Impact Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'Cumulative Revenue', value: formatCurrency(financeData.reduce((a, b) => a + b.totalBilled, 0)), icon: <LuHistory />, color: 'var(--primary)', bg: 'rgba(var(--primary-rgb), 0.1)', trend: '+12.5%' },
                { label: 'Outstanding A/R', value: formatCurrency(financeData.reduce((a, b) => a + b.pendingAmount, 0)), icon: <LuArrowUpRight />, color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', trend: '-2.4%' },
                { label: 'TDS Tracked', value: formatCurrency(financeData.reduce((a, b) => a + b.tdsDeducted, 0)), icon: <LuShieldCheck />, color: 'var(--info)', bg: 'rgba(6, 182, 212, 0.1)', trend: 'Stable' },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ scale: 1.02 }} className="quick-stat lift glass-surface shadow-sm" style={{ position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, color: stat.color, background: stat.bg, padding: '4px 8px', borderRadius: '6px' }}>{stat.trend}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.75rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div className="quick-stat-label" style={{ letterSpacing: '0.05em' }}>{stat.label}</div>
                      <div className="quick-stat-value" style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: 900 }}>{stat.value}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Card className="glass-surface shadow-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: '24px' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)' }}>
                 <h4 style={{ margin: 0, fontWeight: 900, letterSpacing: '-0.02em', fontSize: '1.2rem' }}>Corporate AR Ledger</h4>
                 <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button variant="ghost" size="sm" style={{ border: '1px solid var(--border)', borderRadius: '10px' }}>Export CSV</Button>
                    <Button variant="ghost" size="sm" style={{ border: '1px solid var(--border)', borderRadius: '10px' }}>Print Audit </Button>
                 </div>
              </div>
              <Table 
                columns={[
                  { 
                    key: 'name', 
                    header: 'Corporate Counterparty', 
                    render: (r: any) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1rem', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>{r.name.charAt(0)}</div>
                        <div>
                          <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{r.name}</span>
                          <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>ID: CL-{r.id.substring(0,6)}</div>
                        </div>
                      </div>
                    )
                  },
                  { key: 'totalBilled', header: 'Cumulative Billing', render: (r: any) => <span style={{ fontWeight: 700 }}>{formatCurrency(r.totalBilled)}</span> },
                  { key: 'paidAmount', header: 'Total Receipts', render: (r: any) => <span style={{ color: 'var(--success)', fontWeight: 800 }}>{formatCurrency(r.paidAmount)}</span> },
                  { key: 'pendingAmount', header: 'Operational Debt', render: (r: any) => <span style={{ color: r.status === 'Attention' ? 'var(--danger)' : 'var(--warning)', fontWeight: 900 }}>{formatCurrency(r.pendingAmount)}</span> },
                  { 
                    key: 'status', 
                    header: 'Health Pulse', 
                    render: (r: any) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.status === 'Attention' ? 'var(--danger)' : 'var(--success)', boxShadow: `0 0 10px ${r.status === 'Attention' ? 'var(--danger)' : 'var(--success)'}` }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: r.status === 'Attention' ? 'var(--danger)' : 'var(--success)' }}>{r.status}</span>
                      </div>
                    )
                  },
                  { 
                    key: 'actions', 
                    header: '', 
                    render: (r: any) => (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => handleOpenReconcile(r)}
                          className="lift"
                          style={{ borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 800 }}
                          disabled={r.pendingAmount <= 0}
                        >
                          Settle Ledger <LuArrowUpRight size={14} style={{ marginLeft: '6px' }} />
                        </Button>
                      </div>
                    ) 
                  }
                ]} 
                data={financeData} 
              />
            </Card>
          </motion.div>
        ) : activeTab === 'risk' ? (
          <motion.div key="risk" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
              {financeData.map((client) => {
                const company = companies.find(c => c.id === client.id);
                const limit = company?.creditLimit || 1;
                const outstanding = client.pendingAmount;
                const utilization = Math.round((outstanding / limit) * 100);
                const isCritical = utilization > 90;
                const isWarning = utilization > 60;
                
                return (
                  <Card key={client.id} className="glass-surface lift shadow-lg" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: '24px', borderTop: isCritical ? '6px solid var(--danger)' : '1px solid var(--border)' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ fontWeight: 900, fontSize: '1.25rem' }}>{client.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <LuActivity size={12}/> Net Debt Velocity: Stable
                          </div>
                        </div>
                        {isCritical ? (
                          <div className="pulse" style={{ background: 'var(--danger)', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <LuCircleCheck size={14}/> LIMIT SATURATED
                          </div>
                        ) : isWarning ? (
                           <div style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>CAUTION</div>
                        ) : (
                           <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '4px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 900 }}>CAPACITY CLEAR</div>
                        )}
                     </div>
                     
                     <div style={{ background: 'rgba(var(--primary-rgb), 0.03)', padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(var(--primary-rgb), 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 800 }}>
                           <span className="text-muted">CREDIT EXPOSURE</span>
                           <span style={{ color: isCritical ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--primary)' }}>{utilization}%</span>
                        </div>
                        <div style={{ height: '12px', background: 'var(--border)', borderRadius: '6px', overflow: 'hidden' }}>
                           <motion.div 
                             initial={{ width: 0 }} 
                             animate={{ width: `${Math.min(utilization, 100)}%` }} 
                             transition={{ duration: 1, ease: 'easeOut' }}
                             style={{ height: '100%', background: isCritical ? 'var(--danger)' : isWarning ? 'var(--warning)' : 'var(--primary)', boxShadow: `0 0 15px ${isCritical ? 'rgba(239, 68, 68, 0.4)' : isWarning ? 'rgba(245, 158, 11, 0.4)' : 'rgba(var(--primary-rgb), 0.4)'}` }} 
                           />
                        </div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                           <div className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.08em' }}>ALLOCATED LIMIT</div>
                           <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{formatCurrency(limit)}</div>
                        </div>
                        <div>
                           <div className="text-muted" style={{ fontSize: '0.65rem', fontWeight: 900, letterSpacing: '0.08em' }}>UTILIZED ASSETS</div>
                           <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isCritical ? 'var(--danger)' : 'var(--text-main)' }}>{formatCurrency(outstanding)}</div>
                        </div>
                     </div>

                     <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleOpenReconcile(client)} style={{ flex: 1, borderRadius: '12px' }}>
                           <LuTrendingUp size={16} /> Exposure History
                        </Button>
                        <Button variant="ghost" size="sm" style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '12px' }}>
                           Update Limit
                        </Button>
                     </div>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div key="tax" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            {/* Tax Highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
              {[
                { label: 'CGST Liability', val: aggregateTax.cgst, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', desc: 'Central Asset' },
                { label: 'SGST Liability', val: aggregateTax.sgst, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', desc: 'State Asset' },
                { label: 'IGST Liability', val: aggregateTax.igst, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', desc: 'Trans-border' },
                { label: 'TDS Receivable', val: aggregateTax.tds, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', desc: 'Escrowed' },
              ].map((t, i) => (
                <Card key={i} className="glass-surface lift shadow-sm" style={{ borderTop: `4px solid ${t.color}`, padding: '1.5rem', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.label}</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '0.5rem' }}>{formatCurrency(t.val)}</div>
                    </div>
                    <div style={{ fontSize: '0.6rem', padding: '4px 8px', borderRadius: '6px', background: t.bg, color: t.color, fontWeight: 900 }}>{t.desc}</div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="glass-surface shadow-xl" style={{ padding: 0, overflow: 'hidden', borderRadius: '24px' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <LuScale className="text-primary" size={24}/>
                   <h4 style={{ margin: 0, fontWeight: 900, letterSpacing: '-0.02em' }}>GSTR-1 Tax Reconciliation Register</h4>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                   <Button variant="secondary" size="sm" onClick={() => {}} style={{ borderRadius: '10px' }}><LuDownload /> Export GST Audit</Button>
                </div>
              </div>
              <Table 
                columns={[
                  { key: 'orderId', header: 'Audit Voucher #', render: (r: any) => <strong className="text-primary" style={{ fontWeight: 900 }}>{r.orderId}</strong> },
                  { key: 'companyName', header: 'Taxable Entity', render: (r: any) => <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{r.companyName}</span> },
                  { key: 'state', header: 'Yield Source', render: (r: any) => <span className="status-badge info" style={{ padding: '4px 10px', fontSize: '0.7rem', fontWeight: 900 }}>{r.state}</span> },
                  { key: 'taxable', header: 'Taxable Yield', render: (r: any) => <span style={{ fontWeight: 800 }}>{formatCurrency(r.taxableValue)}</span> },
                  { key: 'cgst', header: 'CGST (9%)', render: (r: any) => <span style={{ opacity: r.cgst > 0 ? 1 : 0.3 }}>{formatCurrency(r.cgst)}</span> },
                  { key: 'sgst', header: 'SGST (9%)', render: (r: any) => <span style={{ opacity: r.sgst > 0 ? 1 : 0.3 }}>{formatCurrency(r.sgst)}</span> },
                  { key: 'igst', header: 'IGST (18%)', render: (r: any) => <span style={{ opacity: r.igst > 0 ? 1 : 0.3, fontWeight: r.igst > 0 ? 800 : 400 }}>{formatCurrency(r.igst)}</span> },
                  { key: 'total', header: 'Settlement Val', render: (r: any) => <strong style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-main)' }}>{formatCurrency(r.totalInvoice)}</strong> }
                ]} 
                data={taxData} 
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconciliation Modal */}
      <AnimatePresence>
        {isModalOpen && selectedClient && (
          <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title={`Ledger Reconciliation: ${selectedClient.name}`}
            className="glass-surface shadow-2xl"
            style={{ maxWidth: '850px', borderRadius: '28px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', padding: '2rem', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '24px', border: '1px solid rgba(var(--primary-rgb), 0.1)' }}>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>DEBT CEILING</div>
                  <div style={{ fontWeight: 900, color: 'var(--danger)', fontSize: '1.8rem' }}>{formatCurrency(selectedClient.pendingAmount)}</div>
                </div>
                <div>
                  <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>LIQUID RECEIPTS</div>
                  <div style={{ fontWeight: 900, color: 'var(--success)', fontSize: '1.8rem' }}>{formatCurrency(selectedClient.paidAmount)}</div>
                </div>
                <div style={{ background: 'var(--primary)', color: 'white', padding: '1rem 1.5rem', borderRadius: '18px', boxShadow: '0 10px 20px -10px rgba(var(--primary-rgb), 0.5)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>TO RECONCILE</div>
                  <div style={{ fontWeight: 900, fontSize: '1.8rem' }}>
                    {formatCurrency(selectedClient.unpaidOrders.filter((o: any) => selectedOrdersToPay.includes(o.id)).reduce((a: any, b: any) => a + b.netAmount, 0))}
                  </div>
                </div>
              </div>

              <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: 0, fontWeight: 900, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>Audit-Ready Vouchers</h4>
                    <div style={{ background: 'var(--surface-hover)', padding: '0.4rem 1rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800 }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <input 
                          type="checkbox" 
                          checked={selectedOrdersToPay.length === selectedClient.unpaidOrders.length && selectedClient.unpaidOrders.length > 0}
                          onChange={(e) => setSelectedOrdersToPay(e.target.checked ? selectedClient.unpaidOrders.map((o: any) => o.id) : [])}
                        />
                        Audit All
                      </label>
                    </div>
                 </div>
                
                <div style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '20px', background: 'var(--surface-hover)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead style={{ background: 'var(--surface-hover)', position: 'sticky', top: 0, zIndex: 1, borderBottom: '1px solid var(--border)' }}>
                      <tr>
                        <th style={{ padding: '1.25rem' }}></th>
                        <th style={{ padding: '1.25rem' }}>Operational ID</th>
                        <th style={{ padding: '1.25rem' }}>Issuance Date</th>
                        <th style={{ padding: '1.25rem' }}>Days Aging</th>
                        <th style={{ padding: '1.25rem', textAlign: 'right' }}>Voucher Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedClient.unpaidOrders.map((order: any) => {
                        const daysOverdue = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                        const isSelected = selectedOrdersToPay.includes(order.id);
                        return (
                          <tr key={order.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', background: isSelected ? 'rgba(var(--primary-rgb), 0.08)' : 'transparent' }}>
                            <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => handleToggleOrderSelection(order.id)}
                                style={{ transform: 'scale(1.2)' }}
                              />
                            </td>
                            <td style={{ padding: '1.25rem' }}>
                               <div style={{ fontWeight: 900, color: 'var(--text-main)' }}>{order.customId}</div>
                               <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700 }}>FISCAL VOUCHER</div>
                            </td>
                            <td style={{ padding: '1.25rem', fontWeight: 600 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td style={{ padding: '1.25rem' }}>
                               <span style={{ 
                                 padding: '4px 10px', 
                                 borderRadius: '6px', 
                                 fontSize: '0.7rem', 
                                 fontWeight: 900,
                                 background: daysOverdue > 30 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--primary-rgb), 0.1)',
                                 color: daysOverdue > 30 ? 'var(--danger)' : 'var(--primary)'
                               }}>
                                 {daysOverdue}D EXPOSURE
                               </span>
                            </td>
                            <td style={{ padding: '1.25rem', textAlign: 'right', fontWeight: 900, color: 'var(--text-main)', fontSize: '1rem' }}>{formatCurrency(order.netAmount)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.5rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
                <Button 
                  variant="secondary" 
                  onClick={handleExportTally} 
                  disabled={selectedOrdersToPay.length === 0}
                  className="lift"
                  style={{ padding: '0.8rem 1.5rem', borderRadius: '14px' }}
                >
                  <LuFileJson size={18} style={{ marginRight: '8px' }} /> Pack Tally XML
                </Button>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button variant="ghost" onClick={() => setIsModalOpen(false)} style={{ borderRadius: '14px', padding: '0 1.5rem' }}>Discard</Button>
                  <Button 
                    variant="primary" 
                    onClick={handleReconcileSelected} 
                    disabled={selectedOrdersToPay.length === 0}
                    className="shadow-glow"
                    style={{ padding: '0.8rem 2.5rem', borderRadius: '14px', fontWeight: 900 }}
                  >
                    <LuCircleCheck size={18} style={{ marginRight: '8px' }} /> Confirm Settlement
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Finance;
