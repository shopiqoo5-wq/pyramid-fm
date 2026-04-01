import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { 
  LuSearch, 
  LuFilter, 
  LuCheck, 
  LuTruck, 
  LuPackage, 
  LuEye,
  LuClock,
  LuFileCheck,
  LuPrinter,
  LuLayoutGrid
} from 'react-icons/lu';
import { Card, Button, Table, Modal, PhotoUpload } from '../../components/ui';
import type { Order } from '../../types';

const AdminOrders: React.FC = () => {
  const { orders, companies, products, updateOrderStatus, uploadVerificationPhoto, settings } = useStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deliveryPhoto, setDeliveryPhoto] = useState<string | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchTargetStatus, setBatchTargetStatus] = useState<any>(null);

  const filteredAndSortedOrders = useMemo(() => {
    let result = orders.filter(o => {
      const company = companies.find(c => c.id === o.companyId);
      const searchStr = `${o.customId} ${company?.name} ${o.locationId}`.toLowerCase();
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      if (sortBy === 'amount') {
        return sortOrder === 'desc' ? b.netAmount - a.netAmount : a.netAmount - b.netAmount;
      }
      if (sortBy === 'status') {
        return sortOrder === 'desc' ? b.status.localeCompare(a.status) : a.status.localeCompare(b.status);
      }
      return 0;
    });

    return result;
  }, [orders, companies, searchTerm, statusFilter, sortBy, sortOrder]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.netAmount || 0), 0);
  const stats = [
    { label: 'Strategic Pipeline', count: orders.filter((o: any) => ['pending', 'pending_approval', 'pending_director', 'approved'].includes(o.status)).length, color: 'var(--warning)', icon: <LuClock /> },
    { label: 'Live Fulfillment', count: orders.filter((o: any) => ['packed', 'dispatched'].includes(o.status)).length, color: 'var(--primary)', icon: <LuPackage /> },
    { label: 'Total Managed Flow', count: formatCurrency(totalRevenue), color: 'var(--success)', icon: <LuFileCheck /> },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="status-badge warning">ADMIN AUTH</span>;
      case 'pending_approval': return <span className="status-badge warning">MANAGER AUTH</span>;
      case 'pending_director': return <span className="status-badge warning" style={{ background: '#fff3cd', color: '#856404', borderColor: '#ffeeba' }}>DIRECTOR AUTH</span>;
      case 'approved': return <span className="status-badge info">READY</span>;
      case 'packed': return <span className="status-badge primary">PACKED</span>;
      case 'dispatched': return <span className="status-badge primary">DISPATCHED</span>;
      case 'delivered': return <span className="status-badge success">DELIVERED</span>;
      case 'cancelled': return <span className="status-badge danger">VOID</span>;
      default: return <span className="status-badge">{status.toUpperCase()}</span>;
    }
  };

  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus: any = 'pending';
    if (currentStatus === 'pending' || currentStatus === 'pending_approval' || currentStatus === 'pending_director') nextStatus = 'approved';
    else if (currentStatus === 'approved') nextStatus = 'packed';
    else if (currentStatus === 'packed') nextStatus = 'dispatched';
    else if (currentStatus === 'dispatched') nextStatus = 'delivered';
    
    if (nextStatus === 'delivered' && deliveryPhoto) {
      uploadVerificationPhoto({ 
        relatedId: orderId, 
        type: 'delivery', 
        imageUrl: deliveryPhoto,
        uploadedBy: 'Admin'
      });
    }

    if (nextStatus !== 'pending') {
      updateOrderStatus(orderId, nextStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: nextStatus });
        setDeliveryPhoto(null);
      }
    }
  };

  const handleBulkApprove = () => {
    selectedOrderIds.forEach(id => {
      const order = orders.find(o => o.id === id);
      if (order && (order.status.startsWith('pending') || order.status === 'approved')) {
        handleUpdateStatus(id, order.status);
      }
    });
    setSelectedOrderIds([]);
  };

  const handleBatchTransition = (targetStatus: string) => {
    selectedOrderIds.forEach(id => {
      updateOrderStatus(id, targetStatus as any);
    });
    setSelectedOrderIds([]);
    setIsBatchModalOpen(false);
    setBatchTargetStatus(null);
  };

  const handleBatchPrint = async (type: 'invoice' | 'challan') => {
    const { generateBatchInvoicesPDF, generateBatchChallansPDF } = await import('../../lib/pdfGenerator');
    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
    if (type === 'invoice') {
      generateBatchInvoicesPDF(selectedOrders, companies, products, settings);
    } else {
      generateBatchChallansPDF(selectedOrders, companies, settings);
    }
  };

  const toggleSort = (key: 'date' | 'amount' | 'status') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  const handlePrintManifest = async () => {
    if (selectedOrderIds.length === 0) {
      alert('Please select orders to manifest.');
      return;
    }
    const { generateBatchManifestPDF } = await import('../../lib/pdfGenerator');
    const selectedOrders = orders.filter(o => selectedOrderIds.includes(o.id));
    generateBatchManifestPDF(selectedOrders, companies, settings);
  };

  const handleDownloadChallan = async (order: Order) => {
    const { generateDeliveryChallanPDF } = await import('../../lib/pdfGenerator');
    const company = companies.find(c => c.id === order.companyId);
    generateDeliveryChallanPDF(order, company, settings);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Operations Orchestrator</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Global synchronization across regional hubs, fulfillment logistics, and client pipelines.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }} className="no-print">
           <Button variant="secondary" onClick={handlePrintManifest} className="lift"><LuPrinter size={18} /> Print Manifest</Button>
           <Button variant="primary" onClick={() => setIsBatchModalOpen(true)} className="lift" disabled={selectedOrderIds.length === 0}>Batch Process</Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }} className="no-print">
        {stats.map((s, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="quick-stat lift glass-surface"
            style={{ padding: '1.5rem' }}
          >
             <div style={{ 
               width: '56px', height: '56px', borderRadius: '16px', background: `${s.color}15`, color: s.color,
               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
             }}>
               {s.icon}
             </div>
             <div>
               <div className="quick-stat-label" style={{ fontWeight: 700 }}>{s.label}</div>
               <div className="quick-stat-value" style={{ color: 'var(--text-main)', fontSize: '1.8rem', fontWeight: 800 }}>{s.count}</div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Filters Bar */}
      <Card className="glass-surface no-print" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '350px' }}>
            <LuSearch className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Search by Order Ref, Client ID, site name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="glass-surface" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
            <LuFilter size={18} className="text-primary" />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, padding: '0.85rem 0', cursor: 'pointer' }}
            >
              <option value="all">Lifecycle: Global</option>
              <option value="pending">Authorize Reqd</option>
              <option value="approved">Manifest Ready</option>
              <option value="packed">In Logistics</option>
              <option value="dispatched">In Transit</option>
              <option value="delivered">Success Full</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
             <Button 
                variant={sortBy === 'date' ? 'primary' : 'secondary'} 
                size="sm" 
                onClick={() => toggleSort('date')}
                style={{ borderRadius: '10px', fontSize: '0.8rem' }}
              >
               Date {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
             </Button>
             <Button 
                variant={sortBy === 'amount' ? 'primary' : 'secondary'} 
                size="sm" 
                onClick={() => toggleSort('amount')}
                style={{ borderRadius: '10px', fontSize: '0.8rem' }}
              >
               Value {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
             </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions Menu */}
      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="glass-surface"
            style={{ 
              padding: '1.25rem 2rem', background: 'var(--primary)', color: 'white', borderRadius: '18px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-2xl)'
            }}
          >
             <div style={{ fontWeight: 800 }}>{selectedOrderIds.length} Selections Locked</div>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="ghost" className="lift" style={{ color: 'white' }} onClick={handleBulkApprove}><LuCheck size={18} /> Global Authenticate</Button>
                <Button variant="ghost" className="lift" style={{ color: 'white' }} onClick={handlePrintManifest}><LuPrinter size={18} /> Batch Manifest</Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrderIds([])} style={{ color: 'rgba(255,255,255,0.7)' }}>Deselect All</Button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="glass-surface" style={{ padding: 0, overflow: 'hidden' }}>
        <Table 
          columns={[
            {
               key: 'select',
               header: (
                 <input 
                  type="checkbox" 
                  checked={selectedOrderIds.length === filteredAndSortedOrders.length && filteredAndSortedOrders.length > 0}
                  onChange={(e) => setSelectedOrderIds(e.target.checked ? filteredAndSortedOrders.map(o => o.id) : [])}
                 />
               ),
               render: (row) => (
                 <input 
                  type="checkbox" 
                  checked={selectedOrderIds.includes(row.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedOrderIds([...selectedOrderIds, row.id]);
                    else setSelectedOrderIds(selectedOrderIds.filter(id => id !== row.id));
                  }}
                 />
               )
            },
            { 
              key: 'customId', 
              header: 'Operational Ref', 
              render: (row: any) => (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{row.customId}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{new Date(row.createdAt).toLocaleDateString()}</span>
                </div>
              ) 
            },
            {
              key: 'client',
              header: 'Corporate Counterparty',
              render: (row: any) => {
                const company = companies.find(c => c.id === row.companyId);
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 900, border: '1px solid var(--border)' }}>{company?.name.charAt(0)}</div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{company?.name}</span>
                       <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{row.locationId}</span>
                    </div>
                  </div>
                );
              }
            },
            { 
              key: 'hub', 
              header: 'Logistics Hub', 
              render: (row: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LuPackage size={14} className="text-primary" />
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {row.warehouseId === 'w2' ? 'NORTH HUB' : (row.warehouseId === 'w3' ? 'WEST HUB' : 'HQ BASE')}
                  </span>
                </div>
              ) 
            },
            { key: 'netAmount', header: 'Intel Value', render: (row: any) => <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>{formatCurrency(row.netAmount)}</span> },
            { key: 'status', header: 'Lifecycle Trace', render: (row: any) => getStatusBadge(row.status) },
            {
              key: 'actions',
              header: '',
              render: (row: any) => (
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedOrder(row)}
                    className="lift"
                    style={{ background: 'var(--surface-hover)', borderRadius: '10px' }}
                  >
                    <LuEye size={18} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownloadChallan(row)}
                    className="lift"
                    style={{ background: 'var(--surface-hover)', borderRadius: '10px' }}
                    title="Download Delivery Challan"
                  >
                    <LuTruck size={18} />
                  </Button>
                  {row.status !== 'delivered' && row.status !== 'cancelled' && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      className="lift"
                      onClick={() => handleUpdateStatus(row.id, row.status)}
                      style={{ borderRadius: '10px', minWidth: '120px' }}
                    >
                      {row.status.startsWith('pending') ? <><LuCheck size={16} /> Authenticate</> : 
                       row.status === 'approved' ? <><LuPackage size={16} /> Manifest</> :
                       row.status === 'packed' ? <><LuTruck size={16} /> Transit</> : <LuCheck size={16} />}
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-muted"><LuLayoutGrid size={18} /></Button>
                </div>
              )
            }
          ]} 
          data={filteredAndSortedOrders} 
        />
        {filteredAndSortedOrders.length === 0 && (
          <div style={{ padding: '6rem', textAlign: 'center', background: 'var(--surface-hover)' }}>
            <LuSearch size={64} style={{ opacity: 0.1, marginBottom: '1.5rem', color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, opacity: 0.5 }}>Deep search yielded zero results</h3>
            <p className="text-muted" style={{ marginTop: '0.5rem' }}>Adjust your parameters to locate specific identifiers.</p>
          </div>
        )}
      </Card>

      <AnimatePresence>
        {isBatchModalOpen && (
          <Modal
            isOpen={isBatchModalOpen}
            onClose={() => setIsBatchModalOpen(false)}
            title="Batch Fulfillment Orchestration"
            style={{ maxWidth: '600px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
               <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--primary-border)' }}>
                  <div style={{ fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>Cohort Selected: {selectedOrderIds.length} Orders</div>
                  <p style={{ margin: 0, fontSize: '0.85rem' }}>Select a target lifecycle phase to transition the selected cohort simultaneously.</p>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Button variant={batchTargetStatus === 'approved' ? 'primary' : 'secondary'} onClick={() => setBatchTargetStatus('approved')} className="lift">
                    <LuCheck /> Authorize
                  </Button>
                  <Button variant={batchTargetStatus === 'packed' ? 'primary' : 'secondary'} onClick={() => setBatchTargetStatus('packed')} className="lift">
                    <LuPackage /> Pack Items
                  </Button>
                  <Button variant={batchTargetStatus === 'dispatched' ? 'primary' : 'secondary'} onClick={() => setBatchTargetStatus('dispatched')} className="lift">
                    <LuTruck /> Dispatch
                  </Button>
                  <Button variant={batchTargetStatus === 'delivered' ? 'primary' : 'secondary'} onClick={() => setBatchTargetStatus('delivered')} className="lift">
                    <LuFileCheck /> Delivery Info
                  </Button>
               </div>

               <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                  <h4 style={{ margin: '0 0 1rem 0' }}>Unified Documents</h4>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="ghost" onClick={() => handleBatchPrint('invoice')} style={{ flex: 1, border: '1px solid var(--border)' }} className="lift">
                      <LuPrinter /> Batch Invoices
                    </Button>
                    <Button variant="ghost" onClick={() => handleBatchPrint('challan')} style={{ flex: 1, border: '1px solid var(--border)' }} className="lift">
                      <LuTruck /> Batch Challans
                    </Button>
                  </div>
               </div>

               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                  <Button variant="secondary" onClick={() => setIsBatchModalOpen(false)}>Cancel</Button>
                  <Button 
                    variant="primary" 
                    disabled={!batchTargetStatus} 
                    onClick={() => handleBatchTransition(batchTargetStatus)}
                    className="shadow-glow"
                  >
                    Execute Batch Transition
                  </Button>
               </div>
            </div>
          </Modal>
        )}

        {selectedOrder && (
          <Modal
            isOpen={!!selectedOrder}
            onClose={() => { setSelectedOrder(null); setDeliveryPhoto(null); }}
            title={`Logistics Intelligence: ${selectedOrder.customId}`}
            style={{ maxWidth: '900px' } as any}
            className="logistics-detail-modal"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1rem 0' }}>
              {/* Header Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', background: 'var(--surface-raised)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-glass)' }}>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>Tracking Ref</label>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)' }}>{selectedOrder.customId}</div>
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>Lifecycle Phase</label>
                  <div>{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>Fulfillment Hub</label>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)' }}>{selectedOrder.warehouseId === 'w2' ? 'North Regional' : 'Western Zone'}</div>
                </div>
                <div className="input-group" style={{ margin: 0 }}>
                  <label className="input-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--primary)' }}>Settlement Value</label>
                  <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 900 }}>{formatCurrency(selectedOrder.netAmount)}</div>
                </div>
              </div>

              {/* Manifest Items */}
              <div>
                <h4 className="text-gradient" style={{ margin: '0 0 1.5rem 0', fontSize: '1.4rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <LuPackage /> Logistics Manifest
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {selectedOrder.items.map((item, index) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.25rem 1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', transition: 'all 0.2s' }} className="hover-lift">
                        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', overflow: 'hidden' }}>
                           <img src={product?.imageUrl} alt={product?.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)' }}>{product?.name}</div>
                          <div className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>SKU: <span style={{ fontFamily: 'monospace' }}>{product?.sku}</span> | UOM: {product?.uom}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 950, fontSize: '1.25rem', color: 'var(--text-main)' }}>{item.quantity} <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>units</span></div>
                          <div className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 700 }}>{formatCurrency(item.total)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Action Zone (Dispatch/Fulfillment) */}
              {selectedOrder.status === 'dispatched' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '2.5rem', background: 'rgba(52, 211, 153, 0.05)', borderRadius: '28px', border: '2px dashed var(--success)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <LuFileCheck size={28} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 900, color: 'var(--success)' }}>Final Transmission Required</h3>
                      <p className="text-muted" style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                        Verify regional fulfillment by uploading a timestamped delivery certificate or agent manifest.
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '2.5rem' }}>
                    <PhotoUpload 
                      onUpload={(url) => setDeliveryPhoto(url)} 
                      label="Capture Signed Dispatch Voucher" 
                    />
                  </div>
                  
                  {deliveryPhoto && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                       <Button variant="primary" onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status)} className="pulse btn-lg" style={{ padding: '1.25rem 4rem' }}>
                         Authenticate Global Success
                       </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem', marginTop: '1rem' }}>
                 <Button variant="secondary" onClick={() => setSelectedOrder(null)} size="lg">Dismiss Insight</Button>
                 {selectedOrder.status !== 'cancelled' && (
                    <Button variant="ghost" onClick={() => handleDownloadChallan(selectedOrder)} size="lg" style={{ border: '1px solid var(--border)' }} className="lift">
                      <LuTruck size={20} /> Delivery Challan
                    </Button>
                 )}
                 {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'dispatched' && (
                    <Button variant="primary" onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status)} className="lift btn-lg shadow-glow" style={{ padding: '0 2.5rem' }}>
                       Authorize {selectedOrder.status.startsWith('pending') ? 'Regional Dispatch' : 'Next Logistics Phase'}
                    </Button>
                 )}
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;
