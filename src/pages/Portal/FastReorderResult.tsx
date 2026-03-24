import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { LuCheck, LuArrowLeft, LuShoppingCart, LuPackageSearch, LuTriangleAlert, LuPlus, LuMinus } from 'react-icons/lu';
import { Card, Button } from '../../components/ui';

const FastReorderResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const skuString = searchParams.get('sku');
  const { products, currentUser, clientPricing, addToCart } = useStore();
  
  const [quantity, setQuantity] = useState(1);

  const product = React.useMemo(() => products.find(p => p.sku === skuString) || null, [products, skuString]);
  
  const customPrice = React.useMemo(() => {
    if (product && currentUser?.companyId) {
      const pricing = clientPricing.find(cp => cp.productId === product.id && cp.companyId === currentUser.companyId);
      return pricing ? pricing.negotiatedPrice : null;
    }
    return null;
  }, [product, currentUser, clientPricing]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
      navigate('/portal/cart');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  if (!skuString) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <LuTriangleAlert size={48} color="var(--warning)" style={{ marginBottom: '1rem' }} />
        <h2>Invalid QR Code</h2>
        <p className="text-muted">No product information was found in this scan.</p>
        <Button onClick={() => navigate('/portal')} style={{ marginTop: '1rem' }}>Return to Dashboard</Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <LuPackageSearch size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h2>Product Not Found</h2>
        <p className="text-muted">The SKU <strong>{skuString}</strong> does not exist in the active catalog.</p>
        <Button onClick={() => navigate('/portal')} style={{ marginTop: '1rem' }}>Return to Dashboard</Button>
      </div>
    );
  }

  const activePrice = customPrice !== null ? customPrice : product.basePrice;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem 0' }}>
      <button 
        onClick={() => navigate('/portal')}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '1.5rem', padding: 0, fontSize: '0.9rem' }}
      >
        <LuArrowLeft size={16} /> Back to Dashboard
      </button>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', marginBottom: '1rem' }}>
          <LuCheck size={32} />
        </div>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>Scan Successful!</h2>
        <p className="text-muted" style={{ margin: 0 }}>Fast reorder unlocked for this item.</p>
      </div>

      <Card style={{ padding: '0', overflow: 'hidden', border: '2px solid var(--primary-light)' }}>
        <div style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }} 
          />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{product.category}</span>
            <h3 style={{ margin: '0.25rem 0 0.5rem 0', fontSize: '1.25rem' }}>{product.name}</h3>
            <p className="text-muted" style={{ fontSize: '0.85rem', margin: '0 0 1rem 0' }}>SKU: {product.sku} • {product.uom}</p>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatCurrency(activePrice)}
              </span>
              {customPrice !== null && (
                <span className="status-badge success" style={{ fontSize: '0.7rem' }}>Negotiated Rate</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-main)' }}>Quantity Needed</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ padding: '0.75rem', background: 'none', border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}
              >
                <LuMinus size={16} />
              </button>
              <span style={{ padding: '0 1.5rem', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                style={{ padding: '0.75rem', background: 'none', border: 'none', borderLeft: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-main)' }}
              >
                <LuPlus size={16} />
              </button>
            </div>
            
            <div style={{ flex: 1, textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Estimated Total</p>
              <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>{formatCurrency(activePrice * quantity)}</p>
            </div>
          </div>
        </div>
      </Card>

      <Button 
        variant="primary" 
        size="lg" 
        onClick={handleAddToCart}
        style={{ width: '100%', marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
      >
        <LuShoppingCart size={20} /> Add to Cart & Checkout
      </Button>
    </div>
  );
};

export default FastReorderResult;
