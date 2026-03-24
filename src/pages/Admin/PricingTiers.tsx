import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { 
  LuPercent, 
  LuPlus, 
  LuTrash2, 
  LuTrendingDown, 
  LuUsers, 
  LuShieldAlert,
  LuChevronRight,
  LuLayoutGrid
} from 'react-icons/lu';
import { Card, Button, Badge } from '../../components/ui';
import './Dashboard.css';

const PricingTiers: React.FC = () => {
  const { settings, updateSettings, companies, products } = useStore();
  const [localTiers, setLocalTiers] = useState(settings.pricingTiers);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  
  const categories = Array.from(new Set(products.map(p => p.category)));
  
  const handleSave = () => {
    updateSettings({ pricingTiers: localTiers });
  };

  const handleAddTier = () => {
    const name = prompt('Enter name for the new tier:');
    if (name && !localTiers[name.toLowerCase()]) {
      const newTiers = { ...localTiers, [name.toLowerCase()]: { global: 0 } };
      setLocalTiers(newTiers);
      setSelectedTier(name.toLowerCase());
    }
  };

  const handleDeleteTier = (tier: string) => {
    if (tier === 'standard') return;
    if (window.confirm(`Are you sure you want to delete the "${tier}" tier?`)) {
      const newTiers = { ...localTiers };
      delete newTiers[tier];
      setLocalTiers(newTiers);
      if (selectedTier === tier) setSelectedTier(null);
    }
  };

  const handleUpdateGlobal = (tier: string, val: string) => {
    const num = Math.min(100, Math.max(0, parseInt(val) || 0));
    setLocalTiers({
      ...localTiers,
      [tier]: { ...localTiers[tier], global: num }
    });
  };

  const handleUpdateOverride = (tier: string, category: string, val: string) => {
    const num = Math.min(100, Math.max(0, parseInt(val) || 0));
    const currentOverrides = localTiers[tier].categoryOverrides || {};
    setLocalTiers({
      ...localTiers,
      [tier]: { 
        ...localTiers[tier], 
        categoryOverrides: { ...currentOverrides, [category]: num } 
      }
    });
  };

  const removeOverride = (tier: string, category: string) => {
    const currentOverrides = { ...(localTiers[tier].categoryOverrides || {}) };
    delete currentOverrides[category];
    setLocalTiers({
      ...localTiers,
      [tier]: { ...localTiers[tier], categoryOverrides: currentOverrides }
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Pricing Tier Engine</h2>
          <p className="text-muted">Manage global discount hierarchies and category-specific contract overrides.</p>
        </div>
        <Button variant="primary" onClick={handleAddTier} className="lift">
          <LuPlus size={18} /> Define New Tier
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
        {/* Tier List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(localTiers).map(([name, config]) => {
            const clientCount = companies.filter(c => c.pricingTier === name).length;
            const isSelected = selectedTier === name;
            
            return (
              <motion.div 
                key={name}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedTier(name)}
                style={{ cursor: 'pointer' }}
              >
                <Card 
                  className={`glass-surface ${isSelected ? 'selected' : ''}`}
                  style={{ 
                    padding: '1.25rem', 
                    borderLeft: isSelected ? '4px solid var(--primary)' : '4px solid transparent',
                    background: isSelected ? 'var(--primary-light)' : 'transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', fontWeight: 800 }}>{name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.4rem' }}>
                        <Badge variant={config.global > 0 ? 'primary' : 'neutral'}>{config.global}% Global</Badge>
                        <span className="text-muted" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <LuUsers size={12} /> {clientCount} Accounts
                        </span>
                      </div>
                    </div>
                    <LuChevronRight size={18} className="text-muted" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Tier Editor */}
        <AnimatePresence mode="wait">
          {selectedTier ? (
            <motion.div
              key={selectedTier}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="glass-surface" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <LuPercent size={20} />
                    </div>
                    <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{selectedTier} Tier Profile</h3>
                  </div>
                  {selectedTier !== 'standard' && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTier(selectedTier)} style={{ color: 'var(--danger)' }}>
                      <LuTrash2 size={16} /> Delete
                    </Button>
                  )}
                </div>

                <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Global Level Discount</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '120px' }}>
                      <input 
                        type="number" 
                        value={localTiers[selectedTier].global}
                        onChange={(e) => handleUpdateGlobal(selectedTier, e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem', paddingRight: '2.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', fontWeight: 800, fontSize: '1.2rem' }}
                      />
                      <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text-muted)' }}>%</span>
                    </div>
                    <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>This multiplier applies to all SKUs unless overridden below or by a negotiated 1-to-1 SKU price.</p>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LuLayoutGrid size={18} /> Category Overrides</h4>
                    <span className="text-muted" style={{ fontSize: '0.75rem' }}>{Object.keys(localTiers[selectedTier].categoryOverrides || {}).length} rules applied</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {categories.map(cat => {
                      const override = localTiers[selectedTier].categoryOverrides?.[cat];
                      return (
                        <div key={cat} style={{ 
                          display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', 
                          background: override !== undefined ? 'var(--surface)' : 'transparent',
                          borderRadius: '12px', border: override !== undefined ? '1px solid var(--primary-border)' : '1px solid transparent'
                        }}>
                          <div style={{ flex: 1, fontWeight: 600, textTransform: 'capitalize' }}>{cat}</div>
                          {override !== undefined ? (
                            <>
                              <div style={{ position: 'relative', width: '90px' }}>
                                <input 
                                  type="number" 
                                  value={override}
                                  onChange={(e) => handleUpdateOverride(selectedTier, cat, e.target.value)}
                                  style={{ width: '100%', padding: '0.4rem 0.75rem', paddingRight: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', fontWeight: 700, textAlign: 'right' }}
                                />
                                <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>%</span>
                              </div>
                              <button onClick={() => removeOverride(selectedTier, cat)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.2rem' }}>
                                <LuTrash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => handleUpdateOverride(selectedTier, cat, localTiers[selectedTier].global.toString())}>
                              <LuPlus size={14} /> Add Override
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', gap: '1rem' }}>
                   <Button variant="primary" onClick={handleSave} className="lift">
                     Save Tier Configuration
                   </Button>
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card className="glass-surface" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', border: '1px dashed var(--border)', textAlign: 'center' }}>
              <div style={{ padding: '1.5rem', borderRadius: '50%', background: 'var(--surface-hover)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                <LuTrendingDown size={48} />
              </div>
              <h3>Select a Tier to Edit</h3>
              <p className="text-muted" style={{ maxWidth: '300px' }}>Choose a corporate tier from the left sidebar to configure its global discount and category-level overrides.</p>
            </Card>
          )}
        </AnimatePresence>
      </div>

      {/* Impact Assessment */}
      <Card className="glass-surface shadow-glow" style={{ padding: '2rem', background: 'var(--primary-light)', border: '1px solid var(--primary-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
           <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
             <LuShieldAlert size={30} />
           </div>
           <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontWeight: 800 }}>Global Pricing Precedence</h4>
              <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.9rem' }}>
                Note: **1-to-1 SKU negotiated rates** always take priority over these tier rules. If a client has a fixed price for an item, the tier percentage will be ignored for that specific item.
              </p>
           </div>
        </div>
      </Card>
    </div>
  );
};

export default PricingTiers;
