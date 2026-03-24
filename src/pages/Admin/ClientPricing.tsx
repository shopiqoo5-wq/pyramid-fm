import React, { useState } from 'react';
import { useStore } from '../../store';
import { LuSearch, LuSave, LuX, LuStar } from 'react-icons/lu';
import { Card, Button } from '../../components/ui';
import './Dashboard.css';

const ClientPricing: React.FC = () => {
  const { companies, products, clientPricing, setClientPrice, updateCompany, favorites, settings } = useStore();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [localPrices, setLocalPrices] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  // Initialize local inputs when a company is selected
  React.useEffect(() => {
    if (selectedCompanyId) {
      const companyPrices = clientPricing.filter(p => p.companyId === selectedCompanyId);
      const newLocalPrices: Record<string, string> = {};
      
      products.forEach(product => {
        const customPrice = companyPrices.find(p => p.productId === product.id);
        if (customPrice) {
          newLocalPrices[product.id] = customPrice.negotiatedPrice.toString();
        } else {
          // If no custom price is set, we leave it empty to show the placeholder
          newLocalPrices[product.id] = '';
        }
      });
      
      setLocalPrices(newLocalPrices);
    } else {
      setLocalPrices({});
    }
  }, [selectedCompanyId, clientPricing, products]);

  const handlePriceChange = (productId: string, value: string) => {
    setLocalPrices(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handleSavePrices = () => {
    if (!selectedCompanyId) return;
    setIsSaving(true);
    
    // Simulate network delay
    setTimeout(() => {
      Object.entries(localPrices).forEach(([productId, priceStr]) => {
        const price = Number(priceStr);
        if (!isNaN(price) && priceStr !== '') {
          setClientPrice(selectedCompanyId, productId, price);
        }
      });
      setIsSaving(false);
      // alert('Prices saved successfully!'); // Optional confirmation
    }, 600);
  };

  const handleUpdateTier = (tier: any) => {
    if (selectedCompanyId) {
      updateCompany(selectedCompanyId, { pricingTier: tier });
    }
  };

  const handleUpdateMultiplier = (value: string) => {
    if (selectedCompanyId) {
      const num = parseFloat(value);
      updateCompany(selectedCompanyId, { discountMultiplier: isNaN(num) ? undefined : num });
    }
  };

  const handleClearPrice = (productId: string) => {
    setLocalPrices(prev => ({
      ...prev,
      [productId]: ''
    }));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  return (
    <div className="flex flex-col gap-6" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="page-header">
        <h2>Custom Client Pricing Matrix</h2>
        <p className="text-muted">Manage granular, SKU-level negotiated rate cards for individual corporate clients.</p>
      </div>

      <Card style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Select Corporate Client</label>
            <select 
              value={selectedCompanyId} 
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '1rem' }}
            >
              <option value="">-- Choose a Client --</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.gstNumber})</option>
              ))}
            </select>
          </div>
          
          {selectedCompany && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-hover)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
               <div>
                 <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Current Tier</span>
                 <select 
                   value={selectedCompany.pricingTier || 'standard'} 
                   onChange={(e) => handleUpdateTier(e.target.value)}
                   style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                 >
                    <option value="standard">Standard</option>
                    {Object.entries(settings.pricingTiers).filter(([n]) => n !== 'standard').map(([name, discount]) => (
                      <option key={name} value={name}>{name.charAt(0).toUpperCase() + name.slice(1)} ({discount.global}%)</option>
                    ))}
                  </select>
               </div>
               <div>
                 <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.2rem' }}>Global Multiplier</span>
                 <input 
                   type="number" 
                   step="0.01" 
                   placeholder="e.g. 0.85" 
                   value={selectedCompany.discountMultiplier || ''} 
                   onChange={(e) => handleUpdateMultiplier(e.target.value)} 
                   style={{ width: '80px', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                 />
               </div>
            </div>
          )}
        </div>
      </Card>

      {selectedCompanyId ? (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="search-box" style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '300px', background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)' }}>
              <LuSearch className="search-icon" size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Search products by Name or SKU..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', background: 'none', border: 'none', outline: 'none', fontSize: '0.95rem', color: 'var(--text-main)' }}
              />
            </div>
            
            <Button variant="primary" onClick={handleSavePrices} isLoading={isSaving}>
              <LuSave size={18} /> Save Price Matrix
            </Button>
          </div>

          <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--surface-hover)', position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Product Name</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>SKU & Category</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Standard MSRP</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)', textAlign: 'right', width: '300px' }}>Custom Client Price (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  // Calculate what the tier price WOULD be for context
                  let calculatedTierPrice = product.basePrice;
                  if (selectedCompany?.discountMultiplier) {
                    calculatedTierPrice = product.basePrice * selectedCompany.discountMultiplier;
                  } else {
                    const tierName = selectedCompany?.pricingTier || 'standard';
                    const tierConfig = settings.pricingTiers[tierName as keyof typeof settings.pricingTiers] || { global: 0 };
                    const discountPercent = tierConfig.global;
                    calculatedTierPrice = product.basePrice * (1 - discountPercent / 100);
                  }

                  const isCustomized = localPrices[product.id] && localPrices[product.id] !== '';
                  const isFavorite = favorites.some(f => f.productId === product.id && f.companyId === selectedCompanyId);

                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border)', background: isCustomized ? 'var(--surface-hover)' : 'transparent' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                          <img src={product.imageUrl} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border)' }} />
                          {isFavorite && (
                            <div style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--surface)', borderRadius: '50%', padding: '2px', display: 'flex' }} title="Client Favorite">
                              <LuStar size={14} color="#f59e0b" fill="#f59e0b" />
                            </div>
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontSize: '0.9em' }}>{product.sku}</div>
                        <div className="text-muted" style={{ fontSize: '0.8em', textTransform: 'capitalize' }}>{product.category}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div>{formatPrice(product.basePrice)}</div>
                        {calculatedTierPrice !== product.basePrice && !isCustomized && (
                          <div className="text-muted" style={{ fontSize: '0.8rem' }}>Tier Rate: {formatPrice(calculatedTierPrice)}</div>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', background: isCustomized ? 'var(--primary-light)' : 'var(--surface)', border: `1px solid ${isCustomized ? 'var(--primary)' : 'var(--border)'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <span style={{ padding: '0.5rem 0.75rem', background: isCustomized ? 'var(--primary)' : 'var(--surface-hover)', color: isCustomized ? '#fff' : 'var(--text-muted)', borderRight: `1px solid ${isCustomized ? 'var(--primary)' : 'var(--border)'}`, fontWeight: 500 }}>₹</span>
                            <input 
                              type="number" 
                              min="0"
                              step="0.01"
                              value={localPrices[product.id] || ''}
                              onChange={(e) => handlePriceChange(product.id, e.target.value)}
                              placeholder={calculatedTierPrice.toString()}
                              style={{ 
                                width: '120px', 
                                padding: '0.5rem 0.75rem', 
                                border: 'none', 
                                outline: 'none', 
                                background: 'transparent',
                                color: isCustomized ? 'var(--primary-dark)' : 'var(--text-main)',
                                fontWeight: isCustomized ? 600 : 400,
                                textAlign: 'right'
                              }}
                            />
                          </div>
                          <button 
                            onClick={() => handleClearPrice(product.id)}
                            title="Revert to Tier Rate"
                            style={{ 
                              background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem',
                              color: isCustomized ? 'var(--text-muted)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            disabled={!isCustomized}
                          >
                           <LuX size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filteredProducts.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No products found matching "{searchTerm}"
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--surface-hover)', border: '1px dashed var(--border)' }}>
          <h3 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No Client Selected</h3>
          <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto' }}>Please select a corporate client from the dropdown above to view and manage their dedicated 1-to-1 SKU pricing matrix.</p>
        </Card>
      )}
    </div>
  );
};

export default ClientPricing;
