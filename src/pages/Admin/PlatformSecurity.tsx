import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { 
  LuShieldAlert, LuActivity, LuLock, LuShieldCheck, LuZap, LuHistory
} from 'react-icons/lu';
import { Card, Button, Table, Badge, Modal } from '../../components/ui';
import { Link } from 'react-router-dom';

const PlatformSecurity: React.FC = () => {
  const { auditLogs, employees, companies, logAction, addAlert } = useStore();
  
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState(false);
  const [isHardening, setIsHardening] = useState(false);

  const resolveUserName = (userId: string) => {
    if (userId === 'system') return 'SYSTEM CORE';
    const emp = employees.find(e => e.id === userId || e.userId === userId);
    if (emp) return emp.name;
    const client = companies.find(c => c.id === userId);
    if (client) return client.name;
    return userId;
  };

  const handleDeployHardening = async () => {
    setIsHardening(true);
    await new Promise(resolve => setTimeout(resolve, 2200));
    
    const details = "Forced credential rotation and integrity checksum verification deployed across all nodes.";
    addAlert({
      message: details,
      type: 'success'
    });
    
    logAction('system', 'Security Hardening', details);
    setIsHardening(false);
  };

  const securityLogs = useMemo(() => 
    auditLogs.filter(l => l.type === 'security' || l.action.toLowerCase().includes('shield') || l.action.toLowerCase().includes('hardening'))
    .slice().reverse(),
  [auditLogs]);

  // Heatmap deterministic mock data
  const heatmapData = useMemo(() => Array.from({ length: 24 }).map((_, h) => ({
    hour: h,
    blocks: Array.from({ length: 14 }).map((_, i) => ({
      index: i,
      isActive: ((h * 17 + i * 11) % 10) < 4
    }))
  })), []);

  const stats = [
    { label: 'Security Score', value: '98/100', icon: <LuShieldCheck />, color: 'var(--success)' },
    { label: 'Pending Audits', value: '0', icon: <LuActivity />, color: 'var(--primary)' },
    { label: 'Blocked Threats', value: '142', icon: <LuShieldAlert />, color: 'var(--warning)' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px' }}>Security Surveillance</h2>
          <p className="text-muted">Real-time threat monitoring, security pulse forensics, and global integrity ledger.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <Button variant="secondary" className="lift" onClick={() => setIsProtocolModalOpen(true)}>
             <LuHistory size={18} /> Protocol History
           </Button>
           <Button 
             variant="primary" 
             className="lift shadow-glow" 
             onClick={handleDeployHardening}
             disabled={isHardening}
           >
             <LuZap size={18} /> {isHardening ? 'Deploying...' : 'Deploy Hardening'}
           </Button>
        </div>
      </header>

      {/* KPI Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {stats.map((stat, i) => (
          <Card key={i} style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '16px', 
              background: 'var(--surface-hover)', color: stat.color, 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '1.75rem', border: `1px solid ${stat.color}` 
            }}>
              {stat.icon}
            </div>
            <div>
              <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)' }}>{stat.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
        {/* Security Pulse Heatmap */}
        <Card style={{ padding: '2rem', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.2rem', color: 'var(--text-main)' }}>Access Velocity Heatmap</h3>
              <p className="text-muted" style={{ fontSize: '0.8rem' }}>Real-time authentication density across all facility nodes.</p>
            </div>
            <Badge variant="primary" style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}>LIVE STREAM</Badge>
          </div>
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '6px', 
            height: '220px', background: 'var(--surface-sub)', 
            borderRadius: '20px', padding: '2rem', border: '1px solid var(--border)' 
          }}>
            {heatmapData.map((col) => (
              <div key={col.hour} style={{ display: 'flex', flexDirection: 'column-reverse', gap: '3px' }}>
                {col.blocks.map((block) => (
                  <motion.div 
                    key={block.index} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: block.isActive ? 0.8 : 0.05 }}
                    style={{ 
                      height: '100%', 
                      background: block.isActive ? 'var(--primary)' : 'var(--text-muted)', 
                      borderRadius: '4px' 
                    }} 
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', padding: '0 1rem' }}>
             {['00:00', '08:00', '16:00', '23:59'].map(t => <span key={t} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>{t}</span>)}
          </div>
        </Card>

        {/* Security Alerts / Quick Audit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <LuShieldAlert className="text-warning" /> Critical Alerts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               {[
                 { msg: 'Unusual scan density in Zone Alpha', time: '4m ago', level: 'warning' },
                 { msg: 'Credential rotation required for root_admin', time: '12h ago', level: 'info' },
                 { msg: 'Failed login attempt from unauthorized IP', time: '22h ago', level: 'danger' },
               ].map((alert, i) => (
                 <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                   <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--${alert.level})`, marginTop: '5px' }} />
                   <div>
                     <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{alert.msg}</div>
                     <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>{alert.time}</div>
                   </div>
                 </div>
               ))}
            </div>
            <Button variant="ghost" style={{ width: '100%', marginTop: '1.5rem', border: '1px dashed var(--border)' }}>View All Incidents</Button>
          </Card>

          <Card style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '24px', boxShadow: '0 10px 25px rgba(var(--primary-rgb), 0.3)' }}>
             <h4 style={{ margin: 0, fontWeight: 900 }}>Integrity Shield Active</h4>
             <p style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.5rem' }}>All biometric data is hashed using SHA-512 and stored in a disjointed HSM-compliant vault.</p>
             <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <LuLock size={24} style={{ opacity: 0.3 }} />
             </div>
          </Card>
        </div>
      </div>

      {/* Snapshot Ledger */}
      <Card style={{ padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 900, color: 'var(--text-main)' }}>System Integrity Ledger</h3>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>Immutable tracking of secure transactions and state transitions.</p>
          </div>
          <Link to="/admin/audit-logs">
            <Button variant="secondary" className="lift">Full Audit Trail</Button>
          </Link>
        </div>
        
        <Table 
          columns={[
             { key: 'ts', header: 'TEMPORAL MARK', render: (l: any) => <span className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 700 }}>{new Date(l.timestamp).toLocaleString()}</span> },
             { key: 'user', header: 'PERSONNEL', render: (l: any) => <strong style={{ color: 'var(--text-main)' }}>{resolveUserName(l.userId)}</strong> },
             { key: 'action', header: 'EVENT CLASSIFIER', render: (l: any) => <Badge variant={l.action.includes('delete') ? 'danger' : 'neutral'}>{l.action.toUpperCase()}</Badge> },
             { key: 'details', header: 'CONTEXTUAL LOG', render: (l: any) => <span style={{ fontSize: '0.9rem' }}>{l.details}</span> }
          ]} 
          data={auditLogs.slice(0, 5)}
        />
      </Card>

      {/* Protocol History Modal */}
      <Modal
        isOpen={isProtocolModalOpen}
        onClose={() => setIsProtocolModalOpen(false)}
        title="Security Protocol History"
        style={{ maxWidth: '900px' }}
      >
        <div style={{ marginBottom: '1.5rem' }}>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Comprehensive log of all high-integrity security operations and hardening protocols.</p>
        </div>
        <Table 
          columns={[
            { key: 'ts', header: 'TIMESTAMP', render: (l: any) => <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{new Date(l.timestamp).toLocaleString()}</span> },
            { key: 'action', header: 'OPERATION', render: (l: any) => <Badge variant="primary">{l.action.toUpperCase()}</Badge> },
            { key: 'details', header: 'PROTOCOL DETAILS', render: (l: any) => <span style={{ fontSize: '0.9rem' }}>{l.details}</span> }
          ]}
          data={securityLogs}
        />
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={() => setIsProtocolModalOpen(false)}>Acknowledge</Button>
        </div>
      </Modal>
    </div>
  );
};

export default PlatformSecurity;
