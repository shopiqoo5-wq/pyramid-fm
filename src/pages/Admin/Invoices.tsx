import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { 
  LuFileText, 
  LuFileJson, 
  LuCheck, 
  LuFilter,
  LuDownload,
  LuMail,
  LuBadgeAlert,
  LuCircleCheck,
  LuShieldCheck,
  LuSearch
} from 'react-icons/lu';
import { Card, Button, Table } from '../../components/ui';
import { sendTransactionalSMS } from '../../utils/sms';
import { downloadTallyXML } from '../../lib/tallyExport';

const AdminInvoices: React.FC = () => {
  const orders = useStore(state => state.orders);
  const companies = useStore(state => state.companies);
  const products = useStore(state => state.products);
  const markOrdersAsTallyExported = useStore(state => state.markOrdersAsTallyExported);
  const currentUser = useStore(state => state.currentUser);
  const addNotification = useStore(state => state.addNotification);
  const settings = useStore(state => state.settings);
  
  const [downloading, setDownloading] = useState<string | null>(null);
  const [filterMonth, setFilterMonth] = useState<string>(''); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'outstanding'>('all');

  // Data Processing
  const invoicedOrders = useMemo(() => {
    let result = orders
      .filter(o => !['pending', 'pending_director', 'cancelled'].includes(o.status))
      .map(o => {
        const company = companies.find(c => c.id === o.companyId);
        const daysOverdue = Math.floor((new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
        return { ...o, companyName: company?.name || 'Unknown', daysOverdue };
      });

    if (viewMode === 'outstanding') {
      result = result.filter(o => !o.isPaid);
    }

    if (filterMonth) {
      const [year, month] = filterMonth.split('-');
      result = result.filter(o => {
        const d = new Date(o.createdAt);
        return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month);
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => o.companyName.toLowerCase().includes(q) || o.customId.toLowerCase().includes(q));
    }

    return result.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [orders, companies, filterMonth, searchQuery, viewMode]);

  // Snapshot Analytics
  const snapshot = useMemo(() => {
    const outstanding = orders.filter(o => !['pending', 'pending_director', 'cancelled'].includes(o.status) && !o.isPaid);
    const total = outstanding.reduce((sum, o) => sum + o.netAmount, 0);
    const over30 = outstanding.filter(o => {
      const days = Math.floor((new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return days > 30;
    }).reduce((sum, o) => sum + o.netAmount, 0);
    const over60 = outstanding.filter(o => {
      const days = Math.floor((new Date().getTime() - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      return days > 60;
    }).reduce((sum, o) => sum + o.netAmount, 0);
    
    return {
      total,
      over30,
      over60,
      count: outstanding.length,
      health: Math.max(0, 100 - Math.round((over60 / (total || 1)) * 100))
    };
  }, [orders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  // Handlers
  const handleDownloadPDF = async (orderId: string) => {
    setDownloading(orderId);
    try {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const company = companies.find(c => c.id === order.companyId);
        const { generateInvoicePDF } = await import('../../lib/pdfGenerator');
        generateInvoicePDF(order, company, products, settings);
      }
    } catch(e) {
      console.error(e);
      addNotification({ userId: currentUser!.id, title: 'Export Failed', message: 'Failed to generate PDF.', type: 'error' });
    } finally {
      setDownloading(null);
    }
  };

  const handleBatchDownload = async () => {
    const { generateBatchInvoicesPDF } = await import('../../lib/pdfGenerator');
    const selectedOrders = orders.filter(o => selectedInvoices.includes(o.id));
    generateBatchInvoicesPDF(selectedOrders, companies, products, settings);
  };

  const handleBulkReconcile = () => {
    if (selectedInvoices.length > 0) {
      useStore.getState().bulkMarkAsReconciled(selectedInvoices);
      setSelectedInvoices([]);
      addNotification({ userId: currentUser!.id, title: 'Payment Received', message: `Successfully settled ${selectedInvoices.length} invoices.`, type: 'success' });
    }
  };

  const handleExportTally = () => {
    const unexportedOrders = invoicedOrders.filter(o => !o.tallyExported);
    if (unexportedOrders.length === 0) {
      addNotification({ userId: currentUser!.id, title: 'Sync Completed', message: 'No unsynced invoices found for export.', type: 'info' });
      return;
    }
    downloadTallyXML(unexportedOrders, companies, `PyramidFM_Tally_Sync`);
    markOrdersAsTallyExported(unexportedOrders.map(o => o.id));
    addNotification({ userId: currentUser!.id, title: 'Tally Export', message: 'Tally XML package generated successfully.', type: 'success' });
  };

  const handleSendReminder = (order: any, company: any) => {
    sendTransactionalSMS({
      to: '+919876543210',
      message: `Dear ${company?.name || 'Client'}, gentle reminder that Invoice ${order.customId} for ${formatCurrency(order.netAmount)} is due.`
    });
    addNotification({ userId: currentUser!.id, title: 'Reminder Sent', message: `Payment reminder dispatched to ${company?.name}.`, type: 'success' });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Financial Command Center</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Global A/R orchestration, collections pulse, and Tally ERP synchronization.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }} className="no-print">
           <Button variant="secondary" onClick={handleExportTally} className="lift">
            <LuFileJson size={18} /> Tally Sync
          </Button>
          <Button variant="primary" onClick={() => {}} className="lift">
            <LuDownload size={18} /> Global Report
          </Button>
        </div>
      </div>

      {/* Receivables Snapshot */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <Card className="glass-surface lift" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
           <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Total Receivables</div>
           <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>{formatCurrency(snapshot.total)}</div>
           <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Across {snapshot.count} active invoices</div>
        </Card>
        <Card className="glass-surface lift" style={{ padding: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
           <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Aging 30D+</div>
           <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b' }}>{formatCurrency(snapshot.over30)}</div>
           <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>Potential Cashflow Lock</div>
        </Card>
        <Card className="glass-surface lift" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger)' }}>
           <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Aging 60D+ (Critical)</div>
           <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--danger)' }}>{formatCurrency(snapshot.over60)}</div>
           <div className="pulse" style={{ fontSize: '0.65rem', color: 'white', background: 'var(--danger)', padding: '2px 8px', borderRadius: '6px', display: 'inline-block', marginTop: '6px', fontWeight: 800 }}>IMMEDIATE ACTION</div>
        </Card>
        <Card className="glass-surface lift" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
             <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LuShieldCheck size={24}/></div>
             <div>
               <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase' }}>Cashflow Health</div>
               <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{snapshot.health}%</div>
             </div>
           </div>
        </Card>
      </div>

      {/* Toolbox & Filters */}
      <Card className="glass-surface no-print" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '350px' }}>
            <LuSearch className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Query by Invoice #, Client Name, or Corporate ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="glass-surface" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
             <Button 
                variant={viewMode === 'all' ? 'primary' : 'secondary'} 
                size="sm" 
                onClick={() => setViewMode('all')}
                style={{ borderRadius: '8px' }}
              >
               All
             </Button>
             <Button 
                variant={viewMode === 'outstanding' ? 'primary' : 'secondary'} 
                size="sm" 
                onClick={() => setViewMode('outstanding')}
                style={{ borderRadius: '8px' }}
              >
               Outstanding
             </Button>
          </div>

          <div className="glass-surface" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem', borderRadius: '12px', border: '1px solid var(--border)', minHeight: '44px' }}>
            <LuFilter size={18} className="text-primary" />
            <input 
              type="month" 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)} 
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <Button variant="secondary" onClick={handleBatchDownload} disabled={selectedInvoices.length === 0} className="lift"><LuDownload /> Export ({selectedInvoices.length})</Button>
             <Button variant="primary" onClick={handleBulkReconcile} disabled={selectedInvoices.length === 0} className="lift shadow-glow"><LuCircleCheck /> Receive Payment</Button>
          </div>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="glass-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <Table 
          columns={[
            {
               key: 'select',
               header: (
                 <input 
                  type="checkbox" 
                  checked={selectedInvoices.length === invoicedOrders.length && invoicedOrders.length > 0}
                  onChange={(e) => setSelectedInvoices(e.target.checked ? invoicedOrders.map(o => o.id) : [])}
                 />
               ),
               render: (row) => (
                 <input 
                  type="checkbox" 
                  checked={selectedInvoices.includes(row.id)}
                  onChange={() => setSelectedInvoices(prev => prev.includes(row.id) ? prev.filter(id => id !== row.id) : [...prev, row.id])}
                 />
               )
            },
            { 
              key: 'id', 
              header: 'Operational Ref', 
              render: (r: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="text-primary" style={{ fontWeight: 900, fontSize: '1rem' }}>{r.customId}</span>
                  <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Issued {new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
              )
            },
            { 
              key: 'client', 
              header: 'Corporate Counterparty', 
              render: (r: any) => {
                const company = companies.find(c => c.id === r.companyId);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 900, border: '1px solid var(--border)' }}>{company?.name.charAt(0)}</div>
                    <span style={{ fontWeight: 700 }}>{company?.name}</span>
                  </div>
                );
              }
            },
            { 
              key: 'aging', 
              header: 'Aging Pulse', 
              render: (r: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    padding: '3px 10px', 
                    borderRadius: '6px', 
                    fontSize: '0.75rem', 
                    fontWeight: 900,
                    background: r.daysOverdue > 60 ? 'var(--danger-bg)' : r.daysOverdue > 30 ? 'var(--warning-bg)' : 'var(--success-bg)',
                    color: r.daysOverdue > 60 ? 'var(--danger)' : r.daysOverdue > 30 ? 'var(--warning)' : 'var(--success)'
                  }}>
                    {r.daysOverdue}D
                  </span>
                  {r.daysOverdue > 30 && <LuBadgeAlert size={14} className={r.daysOverdue > 60 ? 'text-danger pulse' : 'text-warning'} />}
                </div>
              )
            },
            { key: 'amount', header: 'Total Value', render: (r: any) => <span style={{ fontWeight: 900, fontSize: '1.05rem' }}>{formatCurrency(r.netAmount)}</span> },
            { 
              key: 'status', 
              header: 'Settlement', 
              render: (r: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`status-badge ${r.isPaid ? 'success' : 'warning'}`}>{r.isPaid ? 'RECEIVED' : 'PENDING'}</span>
                  {r.tallyExported && <LuCheck size={14} className="text-success" title="Synced to Tally" />}
                </div>
              ) 
            },
            {
              key: 'actions',
              header: '',
              render: (r: any) => {
                const company = companies.find(c => c.id === r.companyId);
                return (
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    {!r.isPaid ? (
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => {
                          useStore.getState().bulkMarkAsReconciled([r.id]);
                          addNotification({ userId: currentUser!.id, title: 'Invoice Settled', message: `Confirmed receipt for ${r.customId}`, type: 'success' });
                        }}
                        className="lift"
                        style={{ background: 'var(--success)', border: 'none', borderRadius: '10px', fontSize: '0.75rem', padding: '0 1rem' }}
                      >
                        Quick Receive
                      </Button>
                    ) : (
                       <Button variant="ghost" size="sm" style={{ pointerEvents: 'none', opacity: 0.5 }}><LuCircleCheck /></Button>
                    )}
                    <Button variant="ghost" size="sm" isLoading={downloading === r.id} onClick={() => handleDownloadPDF(r.id)} className="lift" style={{ border: '1px solid var(--border)', borderRadius: '10px' }}>
                      <LuDownload size={18} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleSendReminder(r, company)} className="lift" style={{ border: '1px solid var(--border)', borderRadius: '10px' }}>
                      <LuMail size={18} />
                    </Button>
                  </div>
                );
              }
            }
          ]} 
          data={invoicedOrders} 
        />
        {invoicedOrders.length === 0 && (
          <div style={{ padding: '6rem', textAlign: 'center', background: 'var(--surface-hover)' }}>
            <LuFileText size={64} style={{ opacity: 0.1, marginBottom: '1.5rem', color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, opacity: 0.5 }}>No invoices match your selection</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Adjust your filters or query to locate specific records.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminInvoices;
