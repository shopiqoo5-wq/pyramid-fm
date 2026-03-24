import React, { useState } from 'react';
import { useStore } from '../../store';
import { motion } from 'framer-motion';
import { 
  LuFileText, LuZap, LuClock, LuShieldCheck, LuTrendingDown, 
  LuSearch, LuInfo, LuCalendar, LuAward
} from 'react-icons/lu';
import { Card, Badge } from '../../components/ui';
import './AgreementConsole.css';

const AgreementConsole: React.FC = () => {
  const { contracts, settings, products, clientPricing, currentUser } = useStore();
  const [priceSearch, setPriceSearch] = useState('');

  const myCompanyId = currentUser?.companyId;
  const myContracts = contracts.filter(c => c.companyId === myCompanyId);
  const activeContract = myContracts.find(c => c.status === 'Active') || myContracts[0];

  const myNegotiatedPricing = clientPricing.filter(cp => cp.companyId === myCompanyId);
  
  const priceBookData = products.map(p => {
    const negotiated = myNegotiatedPricing.find(cp => cp.productId === p.id);
    const contractPrice = negotiated ? negotiated.negotiatedPrice : p.basePrice;
    const discount = p.basePrice > 0 ? ((p.basePrice - contractPrice) / p.basePrice) * 100 : 0;
    
    return {
      ...p,
      contractPrice,
      marketPrice: p.basePrice,
      discount: Math.round(discount)
    };
  }).filter(p => p.name.toLowerCase().includes(priceSearch.toLowerCase()));

  return (
    <div className="agreement-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div className="icon-box-premium sm">
             <LuZap size={20} />
          </div>
          <Badge variant="success" style={{ fontWeight: 900 }}>B2B PARTNERSHIP ACTIVE</Badge>
        </div>
        <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 900 }}>Service Agreement & SLAs</h2>
        <p className="text-muted">Review your corporate framework, fulfillment tiers, and negotiated unit economics.</p>
      </div>

      <div className="agreement-hero-grid">
        <div className="contract-status-card active shadow-glow-primary">
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
             <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <LuAward size={48} />
             </div>
             <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Primary Contract</span>
                <h3 style={{ margin: '0.2rem 0', fontSize: '1.8rem', fontWeight: 900 }}>{activeContract?.type || 'Enterprise Master Agreement'}</h3>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                      <LuCalendar size={14} className="text-muted" />
                      Expires: {activeContract ? new Date(activeContract.endDate).toLocaleDateString() : 'N/A'}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                      <LuShieldCheck size={14} color="var(--success)" />
                      Compliance Verified
                   </div>
                </div>
             </div>
          </div>
          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--surface-hover)', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Renewal Policy: <strong style={{ color: 'var(--text-main)' }}>{activeContract?.renewalTerms || 'Manual 30-Day Notice'}</strong></span>
             <button className="icon-btn-premium sm" style={{ width: 'auto', padding: '0 1rem', borderRadius: '10px' }}>
                <LuFileText size={16} /> View Full PDF
             </button>
          </div>
        </div>

        <div className="sla-matrix-card">
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <LuClock size={20} color="var(--primary)" />
              <h4 style={{ margin: 0, fontWeight: 800 }}>Fulfillment SLAs</h4>
           </div>
           <div className="sla-matrix">
              {Object.entries(settings.regionalSLAs).slice(0, 4).map(([zone, days]) => (
                <div key={zone} className="sla-row">
                   <span className="sla-zone">{zone} Zone</span>
                   <span className="sla-days">{days} Working Days</span>
                </div>
              ))}
           </div>
           <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
              <LuInfo size={14} /> Times calculated from portal approval.
           </div>
        </div>
      </div>

      <Card className="price-book-card" style={{ padding: 0, borderRadius: '24px' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
              <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LuTrendingDown color="var(--success)" /> Contracted Price Book
              </h4>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: '4px 0 0 0' }}>Displaying negotiated unit rates under your current tier.</p>
           </div>
           <div className="search-wrap-premium" style={{ width: '280px' }}>
              <LuSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Find SKU or Category..." 
                value={priceSearch}
                onChange={(e) => setPriceSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="price-book-list">
           <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 100px 120px 120px', 
              padding: '0.75rem 1.75rem', 
              background: 'var(--surface-hover)', 
              fontSize: '0.7rem', 
              fontWeight: 900, 
              color: 'var(--text-muted)', 
              textTransform: 'uppercase',
              letterSpacing: '1px'
           }}>
              <span>Product Details</span>
              <span>UOM</span>
              <span>Market Rate</span>
              <span>Contract Rate</span>
           </div>
           {priceBookData.map((item, idx) => (
             <motion.div 
               key={item.id}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.02 }}
               className="price-item-premium"
             >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', background: 'var(--surface-hover)' }} />
                   <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.7rem' }}>SKU: {item.sku}</div>
                   </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.uom}</div>
                <div className="market-price">₹{item.marketPrice.toLocaleString()}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                   <span className="contract-price">₹{item.contractPrice.toLocaleString()}</span>
                   {item.discount > 0 && (
                     <span className="savings-badge">-{item.discount}%</span>
                   )}
                </div>
             </motion.div>
           ))}
        </div>
      </Card>
    </div>
  );
};

export default AgreementConsole;
