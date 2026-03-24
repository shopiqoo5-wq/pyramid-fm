import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { 
  LuShoppingCart, 
  LuHistory, 
  LuTrendingUp, 
  LuInfo,
  LuQrCode,
  LuActivity,
  LuCircleCheck,
  LuTruck,
  LuPackage,
  LuPlus,
  LuSignature,
  LuUsers,
  LuArrowRight
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { Card, Table, ScannerOverlay, Button, Skeleton, Badge } from '../../components/ui';
import '../Admin/Dashboard.css';
import './PortalDashboard.css';

import AnimatedCounter from '../../components/common/AnimatedCounter';

const LogisticsTracker: React.FC<{ status: string }> = ({ status }) => {
  const stages = [
    { id: 'placed', label: 'Order Placed', icon: <LuCircleCheck size={18} />, statuses: ['pending', 'pending_approval', 'approved'] },
    { id: 'packed', label: 'Processing', icon: <LuPackage size={18} />, statuses: ['packed'] },
    { id: 'shipped', label: 'Out for Delivery', icon: <LuTruck size={18} />, statuses: ['dispatched'] },
    { id: 'arrived', label: 'Delivered', icon: <LuActivity size={18} />, statuses: ['delivered'] }
  ];

  const getCurrentStageIndex = () => {
    if (status === 'delivered') return 3;
    if (status === 'dispatched') return 2;
    if (status === 'packed') return 1;
    return 0;
  };

  const currentIndex = getCurrentStageIndex();

  return (
    <div className="logistics-tracker glass-surface">
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>LIVE LOGISTICS STREAM</h3>
        <Badge variant="primary" className="animate-pulse">Real-time Tracking</Badge>
      </div>
      
      <div className="tracker-stages">
        <div className="progress-line" style={{ width: `${(currentIndex / (stages.length - 1)) * 100}%` }} />
        {stages.map((stage, idx) => (
          <div 
            key={stage.id} 
            className={`tracker-stage ${idx <= currentIndex ? 'complete' : ''} ${idx === currentIndex ? 'active' : ''}`}
          >
            <div className="stage-dot" />
            <div className="stage-label">{stage.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClientDashboard: React.FC = () => {
  const currentUser = useStore(state => state.currentUser);
  const orders = useStore(state => state.orders);
  const companies = useStore(state => state.companies);
  const products = useStore(state => state.products);
  const addToCart = useStore(state => state.addToCart);
  const locations = useStore(state => state.locations);
   const [isScanning, setIsScanning] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const company = companies.find(c => c.id === currentUser?.companyId);
  const clientOrders = orders.filter(o => o.companyId === currentUser?.companyId);
  const recentOrders = [...clientOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  
  // Track active order for logistics stream
  const activeOrder = clientOrders.find(o => !['delivered', 'cancelled', 'rejected'].includes(o.status)) || recentOrders[0];

  const totalSpentYTD = clientOrders.reduce((sum, order) => sum + order.netAmount, 0);
  const activeOrdersCount = clientOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  const requireApproval = clientOrders.filter(o => o.status === 'pending_approval').length;

  const isManager = currentUser?.role === 'client_manager' || currentUser?.role === 'admin';
  const myLocations = isManager 
    ? locations.filter(l => l.companyId === currentUser?.companyId)
    : locations.filter(l => l.id === currentUser?.locationId);

  const totalMonthlyBudget = myLocations.reduce((sum, l) => sum + (l.monthlyBudget || 0), 0) || (company?.creditLimit || 150000);
  const totalCurrentSpend = myLocations.reduce((sum, l) => sum + (l.currentMonthSpend || 0), 0);
  const budgetPercent = totalMonthlyBudget > 0 ? Math.min((totalCurrentSpend / totalMonthlyBudget) * 100, 100) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: 'warning',
      pending_approval: 'warning',
      approved: 'info',
      packed: 'primary',
      dispatched: 'primary',
      delivered: 'success'
    };
    const labels: any = {
      pending: 'Pending Finance',
      pending_approval: 'Awaiting Approval',
      approved: 'Processing',
      packed: 'Packed',
      dispatched: 'In Transit',
      delivered: 'Delivered'
    };
    return <Badge variant={styles[status] || 'neutral'}>{labels[status] || status.toUpperCase()}</Badge>;
  };

  const columns = [
    { key: 'customId', header: 'Order ID', render: (row: any) => <span className="font-bold" style={{ color: 'var(--primary)' }}>{row.customId}</span> },
    { key: 'createdAt', header: 'Date', render: (row: any) => <span className="text-muted">{new Date(row.createdAt).toLocaleDateString()}</span> },
    { key: 'netAmount', header: 'Net Amount', render: (row: any) => <span className="font-bold">{formatCurrency(row.netAmount)}</span> },
    { key: 'status', header: 'Status', render: (row: any) => getStatusBadge(row.status) }
  ];

  const handleScanSuccess = () => {
    if (products.length > 0) {
      const mockScannedSku = products[Math.floor(Math.random() * products.length)].sku;
      setIsScanning(false);
      navigate(`/portal/scan-result?sku=${mockScannedSku}`);
    }
  };

  return (
    <div className="portal-dashboard">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Systems Operational.</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>Welcome back, {currentUser?.name}. Manage your supply chain with precision.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => setIsScanning(true)} className="lift-premium" style={{ borderRadius: '14px', height: '48px', padding: '0 1.5rem' }}>
            <LuQrCode size={20} />
            <span>Shelf Scan</span>
          </Button>
          <Button variant="primary" onClick={() => navigate('/portal/catalog')} className="lift-premium shadow-glow" style={{ borderRadius: '14px', height: '48px', padding: '0 1.5rem' }}>
            <LuShoppingCart size={20} />
            <span>Procure Inventory</span>
          </Button>
        </div>
      </div>

      <div className="metrics-grid premium">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="glass-metric">
              <Skeleton variant="circle" width={48} height={48} style={{ marginRight: '1rem' }} />
              <div style={{ flex: 1 }}>
                <Skeleton width="40%" height={12} style={{ marginBottom: '8px' }} />
                <Skeleton width="60%" height={24} />
              </div>
            </div>
          ))
        ) : (
          <>
            <div className="glass-metric">
              <div className="metric-icon">
                <LuTrendingUp size={24} />
              </div>
              <div className="metric-info">
                <p className="metric-label">Annual Spend (YTD)</p>
                <h3 className="metric-value">{formatCurrency(totalSpentYTD)}</h3>
              </div>
            </div>
            
            <div className="glass-metric">
              <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)' }}>
                <LuActivity size={24} />
              </div>
              <div className="metric-info">
                <p className="metric-label">Active Procurement</p>
                <h3 className="metric-value"><AnimatedCounter value={activeOrdersCount} /></h3>
              </div>
            </div>

            <div className="glass-metric">
              <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)' }}>
                <LuHistory size={24} />
              </div>
              <div className="metric-info">
                <p className="metric-label">Need Approval</p>
                <h3 className="metric-value"><AnimatedCounter value={requireApproval} /></h3>
              </div>
            </div>
          </>
        )}

        <div className="budget-insight-card glass-surface" style={{ padding: '1.5rem', background: 'rgba(var(--primary-rgb), 0.03)', border: '1px solid var(--border)' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width={200} height={32} />
                <Skeleton width={60} height={32} />
              </div>
              <Skeleton height={12} style={{ borderRadius: '6px' }} />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-end' }}>
                <div>
                  <p className="metric-label" style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>Procurement Budget Utilization</p>
                  <p className="text-muted" style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Current Billing Cycle</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 900, color: budgetPercent > 90 ? 'var(--danger)' : budgetPercent > 75 ? 'var(--warning)' : 'var(--success)', fontSize: '1.5rem' }}>{Math.round(budgetPercent)}%</span>
                </div>
              </div>
              
              <div className="budget-meter-track" style={{ height: '12px', background: 'var(--surface-hover)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${budgetPercent}%` }}
                  className="budget-meter-fill" 
                  style={{ 
                    height: '100%',
                    background: budgetPercent > 90 ? 'var(--danger)' : budgetPercent > 75 ? 'var(--warning)' : 'var(--success)',
                    boxShadow: '0 0 15px rgba(var(--primary-rgb), 0.3)'
                  }} 
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>
                  {formatCurrency(totalCurrentSpend)} utilized <span style={{ opacity: 0.5 }}>/ {formatCurrency(totalMonthlyBudget)} limit</span>
                </p>
              </div>
            </>
          )}
        </div>

        {isManager && (
          <div className="glass-metric" style={{ background: 'rgba(var(--primary-rgb), 0.05)', border: '1px solid var(--primary)' }}>
            <div className="metric-icon" style={{ background: 'var(--primary)', color: 'white' }}>
              <LuUsers size={24} />
            </div>
            <div className="metric-info">
              <p className="metric-label">Personnel Registry</p>
              <h3 className="metric-value"><AnimatedCounter value={useStore.getState().users.filter(u => u.companyId === currentUser?.companyId).length} /></h3>
              <p className="text-muted" style={{ fontSize: '0.65rem', margin: 0, fontWeight: 700 }}>ACTIVE PROTOCOLS</p>
            </div>
          </div>
        )}
      </div>

      {activeOrder && <LogisticsTracker status={activeOrder.status} />}

      <div className="dashboard-content" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          <Card className="glass-surface" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div className="card-header-bar" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(var(--surface-rgb), 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.01em' }}>Recent Telemetry</h3>
                <p className="text-muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>Your latest 5 procurement cycles across all sites.</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/portal/orders')} style={{ fontWeight: 800 }}>View Full Log <LuArrowRight size={14} style={{ marginLeft: '4px' }} /></Button>
            </div>
            <Table columns={columns as any} data={recentOrders} />
          </Card>

          <div className="quick-reorder-section">
            <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.01em' }}>PREDICTIVE REPLENISHMENT</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>One-tap distribution based on historical demand.</p>
              </div>
            </div>
            <div className="quick-reorder-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {(() => {
                // Get most frequently ordered products
                const orderedProductIds = clientOrders.flatMap(o => o.items.map(i => i.productId));
                const frequency: Record<string, number> = {};
                orderedProductIds.forEach(id => frequency[id] = (frequency[id] || 0) + 1);
                const sortedProductIds = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]);
                const topProducts = sortedProductIds.length > 0 
                  ? sortedProductIds.map(id => products.find(p => p.id === id)).filter(Boolean).slice(0, 4)
                  : products.slice(0, 4);

                return topProducts.map((p: any) => (
                  <motion.div 
                    key={p.id} 
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="insta-add-card glass-surface lift-premium" 
                    style={{ padding: '1.5rem', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}
                  >
                    <div style={{ width: '100%', height: '120px', borderRadius: '16px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                       <img src={p.imageUrl} alt={p.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                    </div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem' }}>
                      <p style={{ margin: 0, fontWeight: 900, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{p.basePrice}</p>
                      <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>{p.uom}</span>
                    </div>
                    <button 
                      className="btn-premium" 
                      onClick={() => addToCart(p.id, 1)}
                      style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', fontWeight: 800, fontSize: '0.9rem', background: 'var(--primary)', color: 'white', border: 'none' }}
                    >
                      <LuPlus size={16} /> Quick Reorder
                    </button>
                    {frequency[p.id] > 2 && (
                       <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--warning)', color: 'black', padding: '4px 10px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 900 }}>FREQUENT</div>
                    )}
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card className="glass-surface" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, var(--surface), rgba(var(--primary-rgb), 0.02))' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.2rem', fontWeight: 800 }}>Operational Shortcuts</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button onClick={() => navigate('/portal/catalog')} className="list-item-row lift-premium" style={{ width: '100%', textAlign: 'left', padding: '1.25rem', background: 'var(--primary-light)', border: '1px solid var(--primary-light)', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                 <div className="metric-icon" style={{ background: 'var(--primary)', color: 'white', width: '44px', height: '44px', borderRadius: '12px' }}>
                   <LuShoppingCart size={22} />
                 </div>
                 <div style={{ marginLeft: '1rem' }}>
                   <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Browse Catalog</h4>
                   <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>Contracted rates applied</p>
                 </div>
              </button>

              <button onClick={() => setIsScanning(true)} className="list-item-row lift-premium" style={{ width: '100%', textAlign: 'left', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                 <div className="metric-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)', width: '44px', height: '44px', borderRadius: '12px' }}>
                   <LuQrCode size={22} />
                 </div>
                 <div style={{ marginLeft: '1rem' }}>
                   <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Shelf Scan</h4>
                   <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>Instant shelf replenishment</p>
                 </div>
              </button>

              <button onClick={() => navigate('/portal/compliance-vault')} className="list-item-row lift-premium" style={{ width: '100%', textAlign: 'left', padding: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                 <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)', width: '44px', height: '44px', borderRadius: '12px' }}>
                   <LuSignature size={22} />
                 </div>
                 <div style={{ marginLeft: '1rem' }}>
                   <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Compliances</h4>
                   <p className="text-muted" style={{ margin: 0, fontSize: '0.75rem' }}>MSDS & Certificates</p>
                 </div>
              </button>
            </div>
          </Card>
          
          <Card className="glass-surface" style={{ padding: '1.5rem', background: 'rgba(245,158,11,0.03)', border: '1px dashed var(--warning)' }}>
            {(() => {
              const inventory = useStore.getState().inventory;
              const lowStock = inventory.filter((i: any) => i.quantity <= i.lowStockThreshold);
              if (lowStock.length > 0) {
                return (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <LuInfo size={24} color="var(--warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800 }}>Supply Alert — {lowStock.length} Item{lowStock.length > 1 ? 's' : ''} Low</h4>
                      <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                        Low inventory detected. Consider adding these to your next replenishment order before stock runs out.
                      </p>
                    </div>
                  </div>
                );
              }
              return (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <LuInfo size={24} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 800, color: 'var(--success)' }}>All Clear</h4>
                    <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>All tracked inventory is within safe thresholds.</p>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      </div>

      <ScannerOverlay 
        isOpen={isScanning} 
        onClose={() => setIsScanning(false)}
        onScanSuccess={handleScanSuccess}
        title="Scan Supply Shelf"
        subtitle="Align the product's QR Tag in the frame to instantly reorder."
        scanDurationMs={1500}
      />
    </div>
  );
};

export default ClientDashboard;
