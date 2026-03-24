import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { Card, Button, Badge } from '../../components/ui';
import {
  Truck,
  MapPin,
  Globe,
  Warehouse,
  Timer,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import './Dashboard.css';

const Logistics: React.FC = () => {
  const { orders, settings, addNotification, currentUser, warehouses, updateSettings } = useStore((state: any) => state);
  const [localSLAs, setLocalSLAs] = useState(settings.regionalSLAs || { 'Other': 5 });

  const [now] = useState(() => Date.now());

  const slaBreaches = useMemo(() => {
    return orders.filter((o: any) => {
      if (o.status === 'delivered' || o.status === 'cancelled') return false;
      const ageInDays = (now - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const region = Object.keys(localSLAs).find(r => o.locationId?.includes(r)) || 'Other';
      const limit = localSLAs[region] || 5;
      return ageInDays > limit;
    });
  }, [orders, localSLAs, now]);
  
  const handleSave = () => {
    updateSettings({ regionalSLAs: localSLAs });
    if (currentUser) {
      addNotification({ userId: currentUser.id, title: 'Logistics Updated', message: 'Regional SLA policies synchronized across all hubs.', type: 'success' });
    }
  };

  const handleUpdateSLA = (region: string, days: string) => {
    const num = Math.max(1, parseInt(days) || 1);
    setLocalSLAs({ ...localSLAs, [region]: num });
  };

  const handleAddRegion = () => {
    const region = prompt('Enter new region/state name:');
    if (region && !localSLAs[region]) {
      setLocalSLAs({ ...localSLAs, [region]: 5 });
    }
  };

  const removeRegion = (region: string) => {
    if (region === 'Other') return;
    const newSLAs = { ...localSLAs };
    delete newSLAs[region];
    setLocalSLAs(newSLAs);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Dispatch & Logistics Control</h2>
          <p className="text-muted">Manage regional serviceability, delivery timelines, and warehouse fulfillment nodes.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={handleAddRegion} className="lift">
            <MapPin size={18} /> Add Service Region
          </Button>
          <Button variant="primary" onClick={handleSave} className="lift shadow-glow">
            Save Logistics Policy
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
        {/* Regional SLAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Globe size={24} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Zone Lead Times (SLA)</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {Object.entries(localSLAs).map(([region, days]) => (
              <Card key={region} className="glass-surface lift" style={{ padding: '1.5rem', position: 'relative' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>{region}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    value={days as number} 
                    onChange={(e) => handleUpdateSLA(region, e.target.value)}
                    style={{ width: '50px', border: 'none', background: 'transparent', fontWeight: 900, color: 'var(--primary)', fontSize: '2rem', padding: 0, outline: 'none' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Business Days</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Timer size={14} /> Expected fulfillment
                </div>
                {region !== 'Other' && (
                  <button onClick={() => removeRegion(region)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.5 }}>
                    <Trash2 size={16} />
                  </button>
                )}
              </Card>
            ))}
          </div>

          <Card className="glass-surface" style={{ padding: '2rem', background: 'var(--surface-hover)', border: '1px dashed var(--border)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
             <Truck size={48} className="text-muted" />
             <div>
                <h4 style={{ margin: 0 }}>Auto-Dispatch Logic</h4>
                <p className="text-muted" style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>Orders are automatically assigned to the warehouse with the closest proximity to the delivery region to minimize lead times.</p>
             </div>
          </Card>
        </div>

        {/* Warehouse Network & Intelligence */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {slaBreaches.length > 0 && (
            <Card className="glass-surface" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <Timer size={24} className="text-danger" />
               <div>
                  <div style={{ fontWeight: 800, color: 'var(--danger)' }}>{slaBreaches.length} SLA Breaches Detected</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>Orders exceeding regional lead times require expedited dispatch.</div>
               </div>
            </Card>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Warehouse size={24} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>Fulfillment Nodes</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {warehouses.map((w: any) => (
              <Card key={w.id} style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem' }}>{w.name}</strong>
                    <Badge variant="success" style={{ fontSize: '0.6rem' }}>ONLINE</Badge>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>{w.address}, {w.state}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{w.code}</div>
                  <div className="text-success" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'flex-end' }}>
                    <ShieldCheck size={12} /> Primary Node
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
            <Truck size={24} color="var(--primary)" />
            <h3 style={{ margin: 0 }}>3PL Carrier Network</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <Card className="glass-surface lift" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>BD</div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>BlueDart Apex</div>
                   <div className="text-success" style={{ fontSize: '0.7rem', fontWeight: 700 }}>API CONNECTED</div>
                </div>
             </Card>
             <Card className="glass-surface lift" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--warning-bg)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>DY</div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Delhivery Global</div>
                   <div className="text-warning" style={{ fontSize: '0.7rem', fontWeight: 700 }}>LATENCY DETECTED</div>
                </div>
             </Card>
          </div>

          <Card style={{ padding: '1.5rem', background: 'var(--primary-light)', border: '1px solid var(--primary-border)' }}>
             <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary)' }}>Logistics Intelligence</h4>
             <p style={{ margin: 0, fontSize: '0.85rem' }}>
               Current fulfillment node efficiency: **94.2%**. 
               {slaBreaches.length > 0 ? ` WARNING: ${slaBreaches.length} orders are stalled.` : ' All zones operating within SLA parameters.'}
             </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Logistics;
