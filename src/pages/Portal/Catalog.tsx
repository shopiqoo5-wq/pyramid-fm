import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { 
  LuSearch, 
  LuPlus, 
  LuShoppingCart, 
  LuHeart, 
  LuZap, 
  LuLayoutGrid, 
  LuList, 
  LuArrowUpDown,
  LuCircleCheck,
  LuTrash2
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, EmptyState } from '../../components/ui';
import { motion, AnimatePresence } from 'framer-motion';
import './Catalog.css';

const Catalog: React.FC = () => {
  const products = useStore(state => state.products);
  const getClientPrice = useStore(state => state.getClientPrice);
  const currentUser = useStore(state => state.currentUser);
  const addToCart = useStore(state => state.addToCart);
  const cart = useStore(state => state.cart);
  const favorites = useStore(state => state.favorites);
  const toggleFavorite = useStore(state => state.toggleFavorite);
  const productBundles = useStore(state => state.productBundles);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const navigate = useNavigate();

  const categories = ['All', 'Bundles', 'Favorites', ...Array.from(new Set(products.map(p => p.category)))];

  const ssrProducts = useMemo(() => products.slice(0, 3).map(p => ({
    ...p,
    velocity: 70 + ((p.id.length * 13) % 25)
  })), [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      if (p.eligibleCompanies && p.eligibleCompanies.length > 0) {
        if (!currentUser?.companyId || !p.eligibleCompanies.includes(currentUser.companyId)) return false;
      }
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesCategory = categoryFilter === 'All' || 
        (categoryFilter === 'Favorites' ? favorites.some(f => f.productId === p.id && f.companyId === currentUser?.companyId) : p.category === categoryFilter);
      return matchesSearch && matchesCategory && p.active && categoryFilter !== 'Bundles';
    });

    return result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      const priceA = getClientPrice(a.id, currentUser?.companyId);
      const priceB = getClientPrice(b.id, currentUser?.companyId);
      return sortBy === 'price-asc' ? priceA - priceB : priceB - priceA;
    });
  }, [products, searchTerm, categoryFilter, favorites, currentUser, sortBy, getClientPrice]);

  const filteredBundles = productBundles.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (categoryFilter === 'All' || categoryFilter === 'Bundles') && b.active;
  });

  const getQuantityInCart = (productId: string) => cart.find(c => c.productId === productId)?.quantity || 0;
  const formatPrice = (price: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleBulkAdd = () => {
    selectedIds.forEach(id => addToCart(id, 1));
    setSelectedIds([]);
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredProducts.length) setSelectedIds([]);
    else setSelectedIds(filteredProducts.map(p => p.id));
  };

  return (
    <div className="catalog-container">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Supply Catalog</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>Browse negotiated supplies and reorder with contract rates.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => navigate('/portal/quick-order')} className="lift-premium" style={{ borderRadius: '14px', height: '48px', padding: '0 1.5rem' }}>
            <LuZap size={20} />
            <span>Express Reorder</span>
          </Button>
          <Button variant="primary" onClick={() => navigate('/portal/cart')} className="lift-premium shadow-glow" style={{ borderRadius: '14px', height: '48px', padding: '0 1.5rem' }}>
            <LuShoppingCart size={20} />
            <span>Checkout ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
          </Button>
        </div>
      </div>

      <Card className="filters-bar" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-box" style={{ flex: 1 }}>
              <LuSearch className="search-icon" size={20} />
              <input type="text" placeholder="Search resources..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="view-toggle-group">
              <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid View">
                <LuLayoutGrid size={20} />
              </button>
              <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List View">
                <LuList size={20} />
              </button>
            </div>

            <div className="filter-select-wrap-premium">
              <select 
                className="select-premium"
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ minWidth: '180px' }}
              >
                <option value="name">Sort by Name</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <LuArrowUpDown className="select-icon" />
            </div>
          </div>
          
          <div className="category-tags">
            {categories.map(cat => (
              <button key={cat} className={`tag-btn ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>{cat}</button>
            ))}
          </div>
        </div>
      </Card>

      {categoryFilter === 'All' && !searchTerm && (
        <div className="ssr-section" style={{ margin: '2.5rem 0' }}>
          <div className="section-header" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <LuZap size={20} color="var(--primary)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Smart Replenishment</h3>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {ssrProducts.map(p => (
              <div key={`ssr-${p.id}`} className="ssr-card-premium">
                <img src={p.imageUrl} style={{ width: '60px', height: '60px', borderRadius: '12px', objectFit: 'cover' }} alt={p.name} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', fontWeight: 800 }}>{p.name}</h4>
                  <Button variant="primary" size="sm" onClick={() => addToCart(p.id, 1)} style={{ width: '100%', height: '32px' }}>Restock</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'grid' ? (
        <div className="product-grid">
          {filteredProducts.map(product => {
            const clientPrice = getClientPrice(product.id, currentUser?.companyId);
            const inCart = getQuantityInCart(product.id);
            const isFavorite = favorites.some(f => f.productId === product.id && f.companyId === currentUser?.companyId);
            const isSelected = selectedIds.includes(product.id);

            return (
              <div key={product.id} className={`product-card premium ${isSelected ? 'selected' : ''}`} style={isSelected ? { borderColor: 'var(--primary)', background: 'rgba(var(--primary-rgb), 0.02)' } : {}}>
                <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', gap: '0.5rem' }}>
                   <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(product.id)} className="list-item-checkbox" />
                   <button className="icon-btn" onClick={() => currentUser?.companyId && toggleFavorite(product.id, currentUser.companyId)} style={{ background: 'white', border: 'none', padding: '6px', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                     <LuHeart size={16} fill={isFavorite ? 'var(--danger)' : 'none'} color={isFavorite ? 'var(--danger)' : 'var(--text-muted)'} />
                   </button>
                </div>
                
                <div className="product-img-premium">
                  <img src={product.imageUrl} alt={product.name} />
                  {clientPrice < product.basePrice && <div className="contract-badge-premium">Contract</div>}
                </div>

                <div className="product-info-premium">
                  <h4 className="product-name-premium">{product.name}</h4>
                  <div className="price-row-premium">
                    <span className="price-main">{formatPrice(clientPrice)}</span>
                    <span className="uom">/ {product.uom}</span>
                  </div>
                  <div className="product-actions">
                    {inCart > 0 ? (
                      <div className="qty-control-premium">
                        <button className="qty-btn-premium" onClick={() => addToCart(product.id, -1)}>-</button>
                        <span className="qty-val-premium">{inCart}</span>
                        <button className="qty-btn-premium" onClick={() => addToCart(product.id, 1)}>+</button>
                      </div>
                    ) : (
                      <Button variant="secondary" style={{ width: '100%' }} onClick={() => addToCart(product.id, 1)}>Add to Order</Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="product-list-view">
          <div style={{ padding: '0 2rem 1rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }}>
            <input type="checkbox" checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0} onChange={toggleAll} className="list-item-checkbox" />
            <span style={{ fontWeight: 800, color: 'var(--text-muted)', flex: 4 }}>RESOURCE NAME</span>
            <span style={{ fontWeight: 800, color: 'var(--text-muted)', flex: 1 }}>CATEGORY</span>
            <span style={{ fontWeight: 800, color: 'var(--text-muted)', flex: 1.5 }}>CONTRACT RATE</span>
            <div style={{ flex: 2 }} />
          </div>
          {filteredProducts.map(product => {
            const clientPrice = getClientPrice(product.id, currentUser?.companyId);
            const isSelected = selectedIds.includes(product.id);
            const inCart = getQuantityInCart(product.id);
            
            return (
              <motion.div layout key={product.id} className="product-list-item">
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(product.id)} className="list-item-checkbox" />
                <div style={{ flex: 4, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={product.imageUrl} style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>{product.name}</h4>
                    <p className="text-muted" style={{ fontSize: '0.75rem', margin: 0 }}>SKU: {product.sku}</p>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <Badge variant="neutral" style={{ fontSize: '0.7rem' }}>{product.category}</Badge>
                </div>
                <div style={{ flex: 1.5 }}>
                  <span style={{ fontWeight: 900, color: 'var(--primary)' }}>{formatPrice(clientPrice)}</span>
                  <span className="text-muted" style={{ fontSize: '0.7rem', marginLeft: '4px' }}>/ {product.uom}</span>
                </div>
                <div style={{ flex: 2, display: 'flex', justifyContent: 'flex-end' }}>
                   {inCart > 0 ? (
                      <div className="qty-control-premium" style={{ width: '120px' }}>
                        <button className="qty-btn-premium" onClick={() => addToCart(product.id, -1)}>-</button>
                        <span className="qty-val-premium">{inCart}</span>
                        <button className="qty-btn-premium" onClick={() => addToCart(product.id, 1)}>+</button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => addToCart(product.id, 1)}><LuPlus size={16} /> Add</Button>
                    )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, x: '-50%' }}
            animate={{ y: 0, x: '-50%' }}
            exit={{ y: 100, x: '-50%' }}
            className="mass-action-bar"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                {selectedIds.length}
              </div>
              <span style={{ fontWeight: 800 }}>Items Selected</span>
            </div>
            <div style={{ width: '1px', height: '30px', background: 'var(--border)' }} />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                className="icon-btn-premium sm danger" 
                onClick={() => setSelectedIds([])} 
                title="Clear Selection"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <LuTrash2 size={16} />
              </button>
              <Button variant="primary" onClick={handleBulkAdd} className="shadow-glow" style={{ borderRadius: '12px' }}>
                <LuCircleCheck size={18} /> Add All
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {filteredBundles.length > 0 && (
        <div style={{ marginTop: '4rem' }}>
          <div className="section-header" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Curated Procurement Solutions</h3>
            <p className="text-muted">High-value kits designed for standardized facility operations.</p>
          </div>
          <div className="product-grid">
            {filteredBundles.map(bundle => (
              <div key={bundle.id} className="bundle-card-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <Badge variant="primary" style={{ padding: '0.4rem 0.8rem' }}>PREMIUM SOLUTION</Badge>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>{bundle.items.length} COMPONENTS</span>
                </div>
                
                <h3 style={{ fontSize: '1.6rem', margin: '0.5rem 0 0.75rem 0', fontWeight: 900, fontFamily: 'Outfit, sans-serif' }}>{bundle.name}</h3>
                <p className="text-muted" style={{ fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>{bundle.description}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                  {bundle.items.slice(0, 3).map((item, idx) => (
                    <span key={idx} style={{ background: 'var(--surface-hover)', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, border: '1px solid var(--border)' }}>
                      {item.quantity}x {products.find(p => p.id === item.productId)?.name?.split(' ')[0]}
                    </span>
                  ))}
                  {bundle.items.length > 3 && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', padding: '0.35rem 0' }}>+{bundle.items.length - 3} more</span>}
                </div>

                <div className="price-row-premium" style={{ marginBottom: '1.5rem' }}>
                  <div className="price-col">
                    <span className="price-main" style={{ fontSize: '1.8rem' }}>{formatPrice(bundle.price)}</span>
                    <span className="uom" style={{ fontSize: '1rem' }}>/ Solution Kit</span>
                  </div>
                </div>

                <div className="product-actions">
                  <Button 
                    variant="primary" 
                    className="lift-premium shadow-glow"
                    style={{ width: '100%', height: '52px', borderRadius: '16px', fontWeight: 800, fontSize: '1rem' }} 
                    onClick={() => {
                      bundle.items.forEach(item => addToCart(item.productId, item.quantity));
                    }}
                  >
                    <LuPlus size={20} /> Deploy Solution to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && filteredBundles.length === 0 && (
        <div style={{ padding: '4rem 0' }}>
          <EmptyState 
            icon={LuSearch}
            title="No Resources Found"
            description="Your search parameters did not return any assets. Try broadening your criteria or checking for typos."
            variant="glass"
            action={
              <Button variant="ghost" onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}>
                Reset All Parameters
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default Catalog;
