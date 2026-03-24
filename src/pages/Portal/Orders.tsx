import React, { useState } from 'react';
import { useStore } from '../../store';
import { 
  LuSearch, 
  LuFilter, 
  LuEye, 
  LuPackage, 
  LuCircleCheck,
  LuClock,
  LuTruck,
  LuActivity,
  LuClipboardCheck,
  LuPlay,
  LuShieldCheck
} from 'react-icons/lu';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Table, Modal, EmptyState } from '../../components/ui';
import type { Order, OrderStatus } from '../../types';
import './PortalOrders.css';

const PortalOrders: React.FC = () => {
  const orders = useStore((state) => state.orders);
  const currentUser = useStore((state) => state.currentUser);
  const products = useStore((state) => state.products);
  const addToCart = useStore((state) => state.addToCart);
  const updateOrderStatus = useStore((state) => state.updateOrderStatus);
  
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  const clientOrders = orders.filter((o) => o.companyId === currentUser?.companyId);

  const filteredOrders = clientOrders.filter((o) => {
    const matchesSearch = o.customId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const simulateLifecycle = async (orderId: string) => {
    setIsSimulating(orderId);
    const flow: OrderStatus[] = ['pending_approval', 'approved', 'packed', 'dispatched', 'delivered'];
    
    for (const status of flow) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      updateOrderStatus(orderId, status);
      // If the selected order is this one, update the modal view by refreshing from store
      // Since we use the store directly in the modal (via selectedOrder state), we need to update selectedOrder
    }
    setIsSimulating(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': 
      case 'pending_approval':
      case 'pending_director': 
        return <span className={`status-pill-premium ${status === 'pending_director' ? 'primary' : 'pending'}`}><LuClock size={14} /> {status === 'pending_director' ? 'Director Audit' : 'Manager Review'}</span>;
      case 'approved': 
        return <span className="status-pill-premium processing"><LuActivity size={14} /> Processing</span>;
      case 'packed': 
      case 'dispatched': 
        return <span className="status-pill-premium dispatched"><LuTruck size={14} /> {status === 'packed' ? 'Packed' : 'Dispatched'}</span>;
      case 'delivered': 
        return <span className="status-pill-premium delivered"><LuCircleCheck size={14} /> Delivered</span>;
      case 'cancelled':
        return <span className="status-pill-premium danger" style={{ background: 'var(--error-bg)', color: 'var(--error)' }}>Rejected</span>;
      default: 
        return <span className="status-pill-premium">{status}</span>;
    }
  };

  const renderTimeline = (status: string) => {
    if (status === 'cancelled') {
      return (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--danger)' }}>
          <LuActivity size={32} style={{ marginBottom: '1rem' }} />
          <h3 style={{ margin: 0, fontWeight: 800 }}>Order Discontinued</h3>
          <p className="text-muted">This transaction has been voided and will not be processed further.</p>
        </div>
      );
    }

    const steps = [
      { id: 'pending', label: 'Order Initialized', icon: <LuClipboardCheck size={16} />, desc: 'System verification' },
      { id: 'pending_approval', label: 'Mgr Authorization', icon: <LuShieldCheck size={16} />, desc: 'Budget validation' },
      { id: 'pending_director', label: 'Director Sign-off', icon: <LuShieldCheck size={16} />, desc: 'Capital allocation' },
      { id: 'approved', label: 'Pyramid Processing', icon: <LuActivity size={16} />, desc: 'Inventory allocation' },
      { id: 'packed', label: 'Logistics Prep', icon: <LuPackage size={16} />, desc: 'Packaging completed' },
      { id: 'dispatched', label: 'Transit Initiated', icon: <LuTruck size={16} />, desc: 'En route to facility' },
      { id: 'delivered', label: 'Asset Delivered', icon: <LuCircleCheck size={16} />, desc: 'Finalized' }
    ];

    const activeSteps = status === 'pending_director' || (selectedOrder?.netAmount || 0) >= 100000 
      ? steps 
      : steps.filter(s => s.id !== 'pending_director');

    const currentIndex = activeSteps.findIndex(s => s.id === status);

    return (
      <div className="timeline-track">
        {activeSteps.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div key={step.id} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'active' : ''}`}>
              <div className="timeline-dot">
                {isCompleted ? <LuCircleCheck size={14} /> : step.icon}
              </div>
              <div className="timeline-content">
                <h4>{step.label}</h4>
                <p>{isCompleted ? (isCurrent ? 'Awaiting next phase...' : 'Phase Authorized') : step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    );
  };

  const columns = [
    { key: 'customId', header: 'Order Ref', render: (row: Order) => <span style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'Outfit, sans-serif' }}>{row.customId}</span> },
    { key: 'createdAt', header: 'Transaction Date', render: (row: Order) => <span style={{ fontWeight: 500 }}>{new Date(row.createdAt).toLocaleDateString()}</span> },
    { key: 'netAmount', header: 'Total Value', render: (row: Order) => <span style={{ fontWeight: 800, fontSize: '1rem' }}>{formatCurrency(row.netAmount)}</span> },
    { key: 'status', header: 'Fulfillment Status', render: (row: Order) => getStatusBadge(row.status) },
    {
      key: 'actions',
      header: '',
      render: (row: Order) => (
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
          {row.status === 'pending' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); simulateLifecycle(row.id); }}
              isLoading={isSimulating === row.id}
              style={{ padding: '0.6rem', background: 'var(--primary-light)', borderRadius: '10px', color: 'var(--primary)' }}
            >
              <LuPlay size={18} />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={(e) => { e.stopPropagation(); setSelectedOrder(row); }} 
            className="lift-premium"
            style={{ padding: '0.6rem', background: 'var(--surface-hover)', borderRadius: '10px' }}
          >
            <LuEye size={18} color="var(--primary)" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="orders-container">
      {location.state?.orderPlaced && (
        <Card style={{ background: location.state.needsApproval ? 'var(--warning-bg)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${location.state.needsApproval ? 'var(--warning)' : 'var(--success)'}`, borderRadius: '16px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ background: location.state.needsApproval ? 'var(--warning)' : 'var(--success)', padding: '0.5rem', borderRadius: '10px' }}>
              {location.state.needsApproval ? <LuClock size={20} color="white" /> : <LuCircleCheck size={20} color="white" />}
            </div>
            <div>
              <h4 style={{ margin: 0, fontWeight: 800, color: location.state.needsApproval ? 'var(--warning)' : 'var(--success)' }}>
                {location.state.needsApproval ? 'Awaiting Authorization' : 'Transaction Authorized'}
              </h4>
              <p className="text-muted" style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem' }}>
                {location.state.needsApproval ? 'Since this order exceeds budget thresholds, it has been queued for manager review.' : 'Your order has been queued for fulfillment. Tracking is now active.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Activity Ledger</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>Professional tracking of facility resources and procurement history.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/portal/catalog')} className="lift-premium shadow-glow" style={{ borderRadius: '14px', height: '48px', padding: '0 1.5rem' }}>
          <LuPackage size={20} />
          <span>Procure Resources</span>
        </Button>
      </div>

      <Card className="filters-bar" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', width: '100%' }}>
          <div className="search-box" style={{ flex: 1, minWidth: '300px' }}>
            <LuSearch className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Filter by Order Reference (e.g. ORD-2024-001)..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontWeight: 500 }}
            />
          </div>
          
          <div className="filter-select-wrap-premium" style={{ minWidth: '220px' }}>
            <select 
              className="select-premium"
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Awaiting Review</option>
              <option value="approved">Fulfillment Phase</option>
              <option value="dispatched">In Transit</option>
              <option value="delivered">Completed</option>
            </select>
            <LuFilter className="select-icon" />
          </div>
        </div>
      </Card>

      {clientOrders.length === 0 ? (
        <EmptyState 
          icon={LuPackage}
          title="No Transaction History"
          description="You haven't placed any supply orders yet. Explore the catalog to begin your facility procurement."
          variant="glass"
          action={
            <Button variant="primary" onClick={() => navigate('/portal/catalog')}>
              Browse Product Catalog
            </Button>
          }
        />
      ) : filteredOrders.length === 0 ? (
        <EmptyState 
          icon={LuSearch}
          title="No Matches Found"
          description="No orders match your current filter criteria. Try adjusting your search term or status filter."
          action={
            <Button variant="ghost" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
              Clear All Filters
            </Button>
          }
        />
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden', borderRadius: '20px', border: '1px solid var(--border)' }}>
          <Table columns={columns} data={filteredOrders} onRowClick={(row) => setSelectedOrder(row)} />
        </Card>
      )}

      <Modal 
        isOpen={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        title={`Transaction Details — ${selectedOrder?.customId}`}
        className="modal-glass"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Button variant="ghost" onClick={() => setSelectedOrder(null)} style={{ fontWeight: 700 }}>Dismiss</Button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button variant="secondary" onClick={() => {
                if (selectedOrder) {
                  selectedOrder.items.forEach((item: any) => addToCart(item.productId, item.quantity));
                  navigate('/portal/cart');
                }
              }} style={{ borderRadius: '10px' }}>Repeat Transaction</Button>
              <Button variant="primary" className="shadow-glow" style={{ borderRadius: '10px' }} disabled={!['dispatched', 'delivered'].includes(selectedOrder?.status || '')}>Download Manifest</Button>
            </div>
          </div>
        }
      >
        {selectedOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="summary-card-premium">
              <div className="summary-item">
                <label>Fulfillment Phase</label>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>
              <div className="summary-item">
                <label>Authorized Date</label>
                <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <label>Strategic Asset Value</label>
                <span style={{ color: 'var(--primary)' }}>{formatCurrency(selectedOrder.netAmount)}</span>
              </div>
              <div className="summary-item">
                <label>Requester Authentication</label>
                <span>{selectedOrder.placedBy}</span>
              </div>
            </div>

            <div className="order-items-section">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><LuPackage color="var(--primary)" /> Itemized Resources</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {selectedOrder.items.map((item, index) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <div key={index} className="order-item-premium">
                      <img src={product?.imageUrl} alt={product?.name} style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{product?.name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>SKU: {product?.sku}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{item.quantity} {product?.uom}</div>
                        <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>{formatCurrency(item.total)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedOrder.approvalChain && selectedOrder.approvalChain.length > 0 && (
                <div style={{ padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                   <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><LuShieldCheck className="text-success" /> Authorization Chain</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {selectedOrder.approvalChain.map((approve, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>OK</div>
                              <div>
                                 <div style={{ fontWeight: 800 }}>{approve.userName || 'Approved'}</div>
                                 <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{approve.role.replace('_', ' ').toUpperCase()}</div>
                              </div>
                           </div>
                           <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(approve.timestamp).toLocaleString()}</div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.5rem' }}>Asset Logistics Timeline</h3>
              {renderTimeline(selectedOrder.status)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PortalOrders;
