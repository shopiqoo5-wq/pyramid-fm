import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { 
  LuTrash2,
  LuArrowLeft,
  LuShoppingCart, 
  LuFile, 
  LuBuilding,
  LuTruck,
  LuTriangle,
  LuArchive,
  LuArrowUpRight,
  LuDownload,
  LuBookmark,
  LuCircleCheck
} from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui';
import { calculateIndianGST } from '../../utils/gst';
import { motion, AnimatePresence } from 'framer-motion';
import './PortalCart.css';

const Cart: React.FC = () => {
  const cart = useStore((state) => state.cart);
  const savedItems = useStore((state) => state.savedItems);
  const products = useStore((state) => state.products);
  const companies = useStore((state) => state.companies);
  const locations = useStore((state) => state.locations);
  const removeFromCart = useStore((state) => state.removeFromCart);
  const addToCart = useStore((state) => state.addToCart);
  const getClientPrice = useStore((state) => state.getClientPrice);
  const currentUser = useStore((state) => state.currentUser);
  const placeOrder = useStore((state) => state.placeOrder);
  const saveForLater = useStore((state) => state.saveForLater);
  const moveToCart = useStore((state) => state.moveToCart);
  const removeFromSaved = useStore((state) => state.removeFromSaved);
  
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('l1');
  const [costCenter, setCostCenter] = useState('');
  const [poDocument, setPoDocument] = useState<File | null>(null);
  const [splitBillEnabled, setSplitBillEnabled] = useState(false);
  const [deptSplits, setDeptSplits] = useState([{ department: '', percentage: 100 }]);

  const myLocations = useMemo(() => locations.filter((l) => l.companyId === currentUser?.companyId), [locations, currentUser]);

  const cartItems = useMemo(() => cart.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = getClientPrice(item.productId, currentUser?.companyId);
    const finalUnitPrice = item.quantity >= 50 ? unitPrice * 0.95 : unitPrice;
    const total = item.quantity * finalUnitPrice;
    
    return { 
      ...product, 
      quantity: item.quantity, 
      unitPrice: finalUnitPrice, 
      total,
      hasVolumeDiscount: item.quantity >= 50
    };
  }), [cart, products, currentUser, getClientPrice]);

  const savedList = useMemo(() => savedItems.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = getClientPrice(item.productId, currentUser?.companyId);
    return { ...product, unitPrice };
  }), [savedItems, products, currentUser, getClientPrice]);

  const rawSubtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.total, 0), [cartItems]);
  const subtotal = rawSubtotal;

  const destState = useMemo(() => {
    const loc = myLocations.find((l) => l.id === selectedLocation);
    return loc?.id === 'l2' ? 'DL' : 'MH';
  }, [myLocations, selectedLocation]);

  const gstDetails = useMemo(() => calculateIndianGST(subtotal, 'MH', destState, 18), [subtotal, destState]);
  const grandTotal = gstDetails.netAmount;
  
  const isOverBudget = useMemo(() => {
    const loc = myLocations.find(l => l.id === selectedLocation);
    const budget = loc?.monthlyBudget || 0;
    return rawSubtotal > budget;
  }, [rawSubtotal, myLocations, selectedLocation]);

  const currentCompany = useMemo(() => companies.find((c) => c.id === currentUser?.companyId), [companies, currentUser]);
  const availableCredit = currentCompany?.availableCredit ?? 0;
  const isOverLimit = !!(currentCompany?.creditLimit && grandTotal > availableCredit);

  const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  const handleCheckout = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      placeOrder({
        companyId: currentUser?.companyId || 'c1',
        locationId: selectedLocation,
        placedBy: currentUser?.id || 'u1',
        status: isOverBudget ? (grandTotal >= 100000 ? 'pending_director' : 'pending_approval') : 'pending',
        costCenter,
        splits: splitBillEnabled ? deptSplits.filter(d => d.department && d.percentage > 0) : undefined,
        items: cartItems.map((i) => ({
          id: `oi-${Date.now()}-${i.id}`,
          productId: i.id,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          gstAmount: i.total * 0.18,
          total: i.total * 1.18 
        })),
        totalAmount: subtotal,
        gstAmount: gstDetails.totalGst,
        netAmount: grandTotal
      });
      setIsSubmitting(false);
      navigate('/portal/orders', { state: { orderPlaced: true, needsApproval: isOverBudget } });
    }, 1500);
  };

  const downloadQuote = () => {
    alert("Generating Proforma Quote (PDF)... Your download will begin shortly.");
  };

  if (cart.length === 0 && savedItems.length === 0) {
    return (
      <div className="empty-state-full" style={{ padding: '8rem 2rem' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-surface" style={{ padding: '3rem', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <div className="icon-circle-premium" style={{ margin: '0 auto 1.5rem' }}>
            <LuShoppingCart size={40} />
          </div>
          <h2 className="text-gradient">Cart is vacant</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Your procurement pipeline is currently empty. Start authorizing items from the catalog.</p>
          <Button variant="primary" size="lg" onClick={() => navigate('/portal/catalog')}>Initialize Catalog</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <Link to="/portal/catalog" className="back-link-premium">
            <LuArrowLeft size={16} /> RETURN TO CATALOG
          </Link>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '0.5rem' }}>Audit & Authorize</h1>
          <p className="text-muted">Review your procurement request payloads and regional logistics parameters.</p>
        </div>
      </div>

      <div className="split-layout">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {cartItems.length > 0 ? (
            <div className="cart-items-section">
              <div style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>ACTIVE PROCUREMENT PAYLOAD</span>
                <Button variant="ghost" size="sm" onClick={downloadQuote}><LuDownload size={16} /> Export Quote</Button>
              </div>
              <AnimatePresence mode="popLayout">
                {cartItems.map((item, idx) => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    style={{ display: 'flex', alignItems: 'center', padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)' }}
                  >
                    <img src={item.imageUrl} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '14px', objectFit: 'cover', background: 'var(--surface)' }} />
                    <div style={{ marginLeft: '1.5rem', flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{item.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>SKU: {item.sku}</div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button className="text-btn primary" style={{ fontSize: '0.75rem' }} onClick={() => saveForLater(item.id)}>
                          <LuArchive size={12} /> Save for later
                        </button>
                      </div>
                    </div>
                    <div className="qty-control-premium" style={{ margin: '0 3rem' }}>
                      <button className="icon-btn-premium sm" onClick={() => addToCart(item.id, -1)}>-</button>
                      <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 800 }}>{item.quantity}</span>
                      <button className="icon-btn-premium sm" onClick={() => addToCart(item.id, 1)}>+</button>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1.1rem' }}>{formatPrice(item.total)}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{formatPrice(item.unitPrice)} / unit</div>
                    </div>
                    <button className="icon-btn-premium sm danger" style={{ marginLeft: '2rem' }} onClick={() => removeFromCart(item.id)} title="Remove Item">
                      <LuTrash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
             <motion.div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(var(--surface-rgb), 0.5)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
                <LuArchive size={32} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: 0, fontWeight: 800 }}>No Active Items</h3>
                <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Move items from your saved list or return to catalog.</p>
                <Button variant="secondary" onClick={() => navigate('/portal/catalog')}>Browse Supplies</Button>
             </motion.div>
          )}

          {savedList.length > 0 && (
            <div className="saved-items-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <LuBookmark size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Saved for Later</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {savedList.map(item => (
                  <div key={item.id} className="saved-item-row">
                    <img src={item.imageUrl} className="saved-item-img" />
                    <div style={{ marginLeft: '1rem', flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{item.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>{formatPrice(item.unitPrice)} / {item.uom}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button variant="ghost" size="sm" onClick={() => moveToCart(item.id)} style={{ borderRadius: '10px' }}>
                          <LuArrowUpRight size={16} /> Restore
                        </Button>
                        <button className="icon-btn-premium sm danger" onClick={() => removeFromSaved(item.id)} title="Delete Saved">
                          <LuTrash2 size={14} />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="split-logic-card">
            <div className="section-header" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LuBuilding color="var(--primary)" /> Department Capital Allocation</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>Segment procurement liabilities across regional cost centers.</p>
              </div>
              <label className="toggle-premium">
                <input type="checkbox" checked={splitBillEnabled} onChange={e => setSplitBillEnabled(e.target.checked)} />
                <span>ENABLE SPLITS</span>
              </label>
            </div>
            
            <AnimatePresence>
              {splitBillEnabled && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {deptSplits.map((split, idx) => (
                      <div key={idx} className="split-input-group">
                        <input
                          type="text" placeholder="Authorized Department"
                          value={split.department}
                          onChange={e => setDeptSplits(s => s.map((d, i) => i === idx ? { ...d, department: e.target.value } : d))}
                          style={{ flex: 2, background: 'none', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '0.85rem' }}
                        />
                        <div style={{ width: '80px', textAlign: 'right', fontWeight: 800 }}>
                          <input
                            type="number"
                            value={split.percentage}
                            onChange={e => setDeptSplits(s => s.map((d, i) => i === idx ? { ...d, percentage: Number(e.target.value) } : d))}
                            style={{ width: '40px', background: 'none', border: 'none', outline: 'none', color: 'var(--primary)', textAlign: 'right', fontWeight: 800 }}
                          />%
                        </div>
                      </div>
                    ))}
                    <Button variant="ghost" onClick={() => setDeptSplits(s => [...s, { department: '', percentage: 0 }])} style={{ width: 'fit-content' }}>+ ALLOCATE NEW CENTER</Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ width: '400px' }}>
          <div className="checkout-summary-card">
            <h3 className="summary-title"><LuShoppingCart size={22} color="var(--primary)" /> Order Architecture</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="analytics-label">Fulfillment Region</label>
              <div className="filter-select-wrap-premium">
                <select className="select-premium" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                  {myLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
                <LuTruck className="select-icon" />
              </div>
            </div>

            <div className="summary-math">
              <div className="checkout-row">
                <span className="text-muted">Procurement Subtotal</span>
                <span style={{ fontWeight: 800 }}>{formatPrice(rawSubtotal)}</span>
              </div>
              <div className="checkout-row">
                <span className="text-muted">Estimated Tax (GST 18%)</span>
                <span style={{ fontWeight: 800 }}>{formatPrice(gstDetails.totalGst)}</span>
              </div>
              
              <div className="checkout-row total">
                <span>CONSOLIDATED TOTAL</span>
                <span style={{ color: 'var(--primary)', fontSize: '1.4rem' }}>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <AnimatePresence>
              {isOverBudget && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="checkout-alert warning">
                  <LuTriangle size={18} />
                  <div>
                    <div style={{ fontWeight: 800 }}>GOVERNANCE THRESHOLD HIT</div>
                    <div style={{ fontWeight: 600, opacity: 0.8, fontSize: '0.75rem' }}>This order exceeds site budget. Managerial override required via Approvals queue.</div>
                  </div>
                </motion.div>
              )}

              {isOverLimit && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="checkout-alert danger">
                  <LuTriangle size={18} />
                  <div>
                    <div style={{ fontWeight: 800 }}>CREDIT EXHAUSTION</div>
                    <div style={{ fontWeight: 600, opacity: 0.8, fontSize: '0.75rem' }}>Liquidity limit hit. Please contact your Pyramid FM Account Manager.</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ marginTop: '1.5rem' }}>
               <label className="analytics-label">Cost Reference Code</label>
               <input 
                type="text" placeholder="e.g. FY24-PROD-01" 
                className="input-premium" 
                value={costCenter} onChange={e => setCostCenter(e.target.value)} 
               />
            </div>

            <Button 
              variant="primary" 
              style={{ width: '100%', marginTop: '2rem', height: '60px', borderRadius: '18px', fontSize: '1.1rem', fontWeight: 800, background: isOverBudget ? 'var(--warning)' : 'var(--primary)' }}
              onClick={handleCheckout} 
              isLoading={isSubmitting}
              disabled={isOverLimit || cartItems.length === 0}
            >
              {isOverBudget ? 'SUBMIT FOR AUTHORIZATION' : 'FINALIZE ORDER'} <LuCircleCheck size={22} style={{ marginLeft: '8px' }} />
            </Button>

            <p style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1rem', fontWeight: 600 }}>
              {isOverBudget ? "Order will be queued for site manager approval." : "Standard fulfillment timeline: 24-48 hours."}
            </p>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="po-upload-dropzone" onClick={() => document.getElementById('po-upload')?.click()}>
               < LuFile size={28} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
               <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Authorized PO Manifest</div>
               <p className="text-muted" style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>{poDocument ? poDocument.name : 'Click to attach signed paperwork (PDF)'}</p>
               <input 
                type="file" id="po-upload" accept=".pdf" style={{ display: 'none' }} 
                onChange={(e) => e.target.files && setPoDocument(e.target.files[0])}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
