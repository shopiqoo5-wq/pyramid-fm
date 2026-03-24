import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui';
import { 
  LuPlus,
  LuShoppingCart,
  LuSearch,
  LuCheck,
  LuTrash2, 
  LuFileSpreadsheet,
  LuZap,
  LuLayoutGrid
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import './PortalQuickOrder.css';

const QuickOrder: React.FC = () => {
  const { products, getClientPrice, currentUser, addToCart } = useStore((state: any) => state);
  const [searchTerm, setSearchTerm] = useState('');
  const [quickItems, setQuickItems] = useState<{product: any, qty: number}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return products.filter((p: any) => 
      p.active && (
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    ).slice(0, 6);
  }, [searchTerm, products]);

  const handleAddQuickItem = (product: any) => {
    const existing = quickItems.find(i => i.product.id === product.id);
    if (existing) {
      setQuickItems(quickItems.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setQuickItems([{ product, qty: 1 }, ...quickItems]);
    }
    setSearchTerm('');
  };

  const handleUpdateQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setQuickItems(quickItems.filter(i => i.product.id !== productId));
    } else {
      setQuickItems(quickItems.map(i => i.product.id === productId ? { ...i, qty } : i));
    }
  };

  const handleAddAllToCart = () => {
    quickItems.forEach(item => {
      addToCart(item.product.id, item.qty);
    });
    setQuickItems([]);
    navigate('/portal/cart');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setUploadProgress(0);
      
      let p = 0;
      const interval = setInterval(() => {
        p += 20;
        setUploadProgress(p);
        if (p >= 100) {
          clearInterval(interval);
          const mockParsed = products.slice(5, 8).map((p: any) => ({ product: p, qty: 12 }));
          setQuickItems([...mockParsed, ...quickItems]);
          setIsUploading(false);
        }
      }, 400);
    }
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  return (
    <div className="quick-order-container">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 800 }}>Flash Procurement</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem' }}>Zero-friction SKU injection and high-velocity bulk payload mapping.</p>
        </div>
        {quickItems.length > 0 && (
          <Button variant="primary" className="btn-premium" onClick={handleAddAllToCart}>
            <LuShoppingCart size={18} /> AUTHORIZE BATCH ({quickItems.length})
          </Button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="search-console-premium">
            <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <LuZap size={20} /> SKU INJECTOR
            </h3>
            <div style={{ position: 'relative' }}>
              <div className="input-with-icon-premium">
                <LuSearch className="input-icon" size={20} />
                <input 
                  type="text" 
                  placeholder="Enter SKU, Asset Name, or Variant ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.5rem', borderRadius: '18px', border: '1px solid var(--border)', background: 'var(--surface-hover)', fontSize: '1.05rem', fontWeight: 600, outline: 'none', transition: 'all 0.3s' }}
                />
              </div>
              
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="search-results-overlay">
                    {searchResults.map((p: any) => (
                      <div key={p.id} className="search-item-premium" onClick={() => handleAddQuickItem(p)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img src={p.imageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{p.name}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>SKU: {p.sku}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(getClientPrice(p.id, currentUser?.companyId))}</span>
                          <LuPlus size={18} color="var(--primary)" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="draft-manifest-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <LuLayoutGrid size={20} color="var(--primary)" /> DRAFT MANIFEST
              </h3>
              {quickItems.length > 0 && (
                <div className="tag-premium">
                  EST. VALUE: {formatPrice(quickItems.reduce((acc, item) => acc + (getClientPrice(item.product.id, currentUser?.companyId) * item.qty), 0))}
                </div>
              )}
            </div>
            
            <AnimatePresence initial={false}>
              {quickItems.length > 0 ? (
                quickItems.map((item, idx) => (
                  <motion.div 
                    key={item.product.id} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="draft-item-premium"
                  >
                    <img src={item.product.imageUrl} alt="" style={{ width: '50px', height: '50px', borderRadius: '10px' }} />
                    <div style={{ flex: 1, marginLeft: '1.25rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.product.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>REF: {item.product.sku}</div>
                    </div>
                    <div className="qty-control-premium" style={{ margin: '0 2rem' }}>
                      <button onClick={() => handleUpdateQty(item.product.id, item.qty - 1)}>-</button>
                      <input 
                        type="number" value={item.qty} 
                        onChange={(e) => handleUpdateQty(item.product.id, parseInt(e.target.value) || 0)}
                        style={{ width: '50px', background: 'none', border: 'none', textAlign: 'center', fontWeight: 800, color: 'var(--text-main)' }}
                      />
                      <button onClick={() => handleUpdateQty(item.product.id, item.qty + 1)}>+</button>
                    </div>
                    <div style={{ minWidth: '120px', textAlign: 'right' }}>
                       <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatPrice(getClientPrice(item.product.id, currentUser?.companyId) * item.qty)}</div>
                       <div className="text-muted" style={{ fontSize: '0.7rem' }}>Authorized Rate</div>
                    </div>
                    <button className="icon-btn danger" style={{ marginLeft: '1.5rem' }} onClick={() => handleUpdateQty(item.product.id, 0)}>
                      <LuTrash2 size={18} />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="empty-state-full" style={{ padding: '4rem', border: '1px dashed var(--border)', borderRadius: '24px' }}>
                   <p className="text-muted">No operational payloads detect. Inject SKUs to begin.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-surface" style={{ padding: '1.75rem', borderRadius: '24px' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800 }}>BULK PAYLOAD MAPPER</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.75rem' }}>
              Interface with your procurement ERP system by uploading standardized `.xlsx` mappings.
            </p>
            
            <div className="bulk-upload-zone-premium" onClick={() => document.getElementById('upload-file')?.click()}>
              {isUploading ? (
                <div style={{ width: '100%' }}>
                  <LuZap size={40} className="animate-pulse" color="var(--primary)" />
                  <div style={{ fontWeight: 800, marginTop: '1rem' }}>MAPPING ASSETS...</div>
                  <div className="parsing-progress-bar">
                    <div className="parsing-progress-fill" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <>
                  <LuFileSpreadsheet size={40} color="var(--primary)" />
                  <div style={{ fontWeight: 800, marginTop: '1rem', color: 'var(--text-main)' }}>UPLOAD SPREADSHEET</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>DRAG & DROP OR CLICK</div>
                </>
              )}
              <input 
                type="file" id="upload-file" disabled={isUploading} 
                accept=".csv, .xlsx" onChange={handleFileUpload} style={{ display: 'none' }} 
              />
            </div>

            <div style={{ marginTop: '1.5rem' }}>
               <Button variant="ghost" style={{ width: '100%', borderRadius: '12px', borderColor: 'var(--border)' }}>
                 <LuPlus size={14} style={{ marginRight: '0.5rem' }} /> DOWNLOAD TEMPLATE
               </Button>
            </div>
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px' }}>
             <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', fontWeight: 800 }}>QUICK ADD PROTOCOL</h4>
             <ul style={{ padding: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
               <li style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                 <LuCheck size={14} color="var(--success)" /> Enter SKU for precise mapping.
               </li>
               <li style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                 <LuCheck size={14} color="var(--success)" /> Verify line totals before authorization.
               </li>
               <li style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                 <LuCheck size={14} color="var(--success)" /> ERP uploads support up to 500 lines.
               </li>
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickOrder;
