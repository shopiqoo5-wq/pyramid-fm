import React from 'react';
import { useStore } from '../../store';
import { Card, Badge, Button } from '../../components/ui';
import { 
  LuMapPin, LuPhone, LuShieldAlert, LuBookOpen, 
  LuUserCheck, LuNavigation, LuInfo
} from 'react-icons/lu';
import { useTranslation } from '../../hooks/useTranslation';
import './Employee.css';

const SiteProtocols: React.FC = () => {
  const { currentUser, employees, locations, siteProtocols } = useStore();
  const { t } = useTranslation();
  
  const employee = employees.find(e => e.userId === currentUser?.id);
  const location = locations.find(l => l.id === employee?.locationId);
  // company context is available if needed for future logic

  if (!location) {
    return (
      <div className="employee-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', textAlign: 'center' }}>
        <LuMapPin size={64} style={{ opacity: 0.1, marginBottom: '2rem' }} />
        <h2 style={{ fontWeight: 800 }}>{t('protocols.none')}</h2>
      </div>
    );
  }

  return (
    <div className="employee-main animate-fade-in" style={{ paddingBottom: '8rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <Badge variant="info" style={{ marginBottom: '1.25rem', padding: '0.4rem 1.25rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.7rem' }}>
          SECURED ALPHA NODE • ACTIVE
        </Badge>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0, color: 'var(--text-main)' }}>{location.name}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 700, marginTop: '0.6rem' }}>{location.address}</p>
      </header>

      {/* Quick Action Map */}
      <div style={{ marginBottom: '3rem' }}>
        <Card variant="glass" style={{ padding: 0, overflow: 'hidden', height: '220px', position: 'relative', borderRadius: '32px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url("https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1000") center/cover' }} />
          <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem' }}>
             <Button variant="primary" style={{ borderRadius: '18px', padding: '0.8rem 1.5rem', fontWeight: 900, fontSize: '0.9rem', background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 10px 30px rgba(249, 115, 22, 0.3)' }}>
               <LuNavigation size={20} /> Deploy Navigation
             </Button>
          </div>
        </Card>
      </div>

      {/* Site Contacts */}
      <section style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LuUserCheck size={22} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>On-Site Command</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card variant="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)' }}>{location.contactPerson}</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Operational Facility Lead</div>
               </div>
               <a href={`tel:${location.contactPhone}`} style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <LuPhone size={22} />
               </a>
            </div>
          </Card>
          <Card variant="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div>
                 <div style={{ fontWeight: 900, fontSize: '1.1rem', color: 'var(--text-main)' }}>Security Command Center</div>
                 <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>Emergency Response Unit</div>
               </div>
               <a href={`tel:100`} style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <LuShieldAlert size={22} />
               </a>
            </div>
          </Card>
        </div>
      </section>

      {/* Standard Operating Procedures */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LuBookOpen size={22} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 950, margin: 0, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{t('protocols.title')}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
           {siteProtocols.filter(p => p.locationId === location.id).map((sop, i) => (
             <Card key={sop.id} variant="glass" style={{ padding: '1.5rem', borderRadius: '24px' }}>
               <div style={{ display: 'flex', gap: '1.25rem' }}>
                 <div style={{ 
                   width: '40px', height: '40px', borderRadius: '14px', 
                   background: 'rgba(255, 255, 255, 0.05)', color: 'var(--primary)', 
                   display: 'flex', alignItems: 'center', justifyContent: 'center',
                   flexShrink: 0, fontWeight: 950, fontSize: '1rem', border: '1px solid rgba(255,255,255,0.08)' 
                 }}>
                   {i+1}
                 </div>
                 <div>
                   <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.4rem', color: '#fff' }}>{sop.title}</div>
                   <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, lineHeight: 1.6 }}>{sop.content}</p>
                 </div>
               </div>
             </Card>
           ))}
           {siteProtocols.filter(p => p.locationId === location.id).length === 0 && (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', border: '1px dashed var(--border)', borderRadius: '16px' }}>
               Site is pending configuration by regional command.
             </div>
           )}
        </div>
      </section>

      {/* Emergency Footer */}
      <div style={{ marginTop: '3rem', padding: '1.5rem', borderRadius: '24px', background: 'rgba(239, 68, 68, 0.05)', border: '1px dashed rgba(239, 68, 68, 0.2)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <LuInfo size={24} style={{ color: 'var(--danger)' }} />
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          In case of fire or site emergency, follow the floor markers to Assembly Point C. Report to the Facility Manager immediately.
        </p>
      </div>
    </div>
  );
};

export default SiteProtocols;
