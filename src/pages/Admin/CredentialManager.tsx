import React, { useState } from 'react';
import { useStore } from '../../store';
import { 
  LuKey, LuShield, LuPlus, LuLock, LuCopy, LuX, LuInfo, LuGlobe
} from 'react-icons/lu';
import { Card, Button, Table, Badge, Input } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

const CredentialManager: React.FC = () => {
  const { 
    apiKeys, revokeAPIKey, generateAPIKey, companies, 
    settings, updateSettings, addAlert 
  } = useStore();

  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [isIPModalOpen, setIsIPModalOpen] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{ companyId: string, permissions: ("products" | "inventory" | "orders" | "invoices")[] }>({ companyId: '', permissions: ['products'] });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleProvision = () => {
    if (!newKeyData.companyId) {
      addAlert({ message: 'Select a target entity for the API key.', type: 'error' });
      return;
    }
    const result: any = generateAPIKey(newKeyData.companyId, newKeyData.permissions);
    setGeneratedKey(result.key);
  };

  const copyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey);
      addAlert({ message: 'API Key copied to clipboard. Store it safely!', type: 'success' });
    }
  };

  const toggleMFA = () => {
    const currentMFA = settings.securityPolicy?.enforceBiometricMFA || false;
    updateSettings({ 
      securityPolicy: { ...settings.securityPolicy, enforceBiometricMFA: !currentMFA } 
    });
    addAlert({ message: `MFA Policy ${!currentMFA ? 'Enforced' : 'Relaxed'}`, type: 'info' });
  };

  const handleSessionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mins = parseInt(e.target.value);
    updateSettings({ 
      securityPolicy: { ...settings.securityPolicy, sessionTimeoutMinutes: mins } 
    });
    addAlert({ message: `Session Timeout updated to ${mins} minutes.`, type: 'success' });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px' }}>Credential Manager</h2>
          <p className="text-muted">Global authentication policies, API registry, and personnel access protocols.</p>
        </div>
        <Button variant="primary" className="lift shadow-glow" onClick={() => { setGeneratedKey(null); setIsProvisionModalOpen(true); }}>
          <LuPlus size={18} /> Provision API Key
        </Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        {/* API Registry */}
        <Card className="shadow-hover" style={{ padding: '2rem', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <LuKey className="text-primary" /> Enterprise API Registry
            </h3>
            <Badge variant="neutral">GATEWAY V2.1</Badge>
          </div>
          
          <Table 
            columns={[
              { 
                key: 'id', 
                header: 'CLIENT IDENTIFIER', 
                render: (k: any) => <code style={{ fontWeight: 800, fontSize: '0.8rem' }}>{k.id}</code> 
              },
              { 
                key: 'company', 
                header: 'MAPPED ENTITY', 
                render: (k: any) => <strong>{companies.find((c: any) => c.id === k.companyId)?.name || 'System Root'}</strong> 
              },
              { 
                key: 'token', 
                header: 'SECURE TOKEN', 
                render: () => <span className="text-muted" style={{ fontFamily: 'monospace' }}>sk_live_••••••••••</span> 
              },
              { 
                key: 'actions', 
                header: '', 
                render: (k: any) => (
                  <Button variant="ghost" size="sm" onClick={() => revokeAPIKey(k.id)} className="text-danger lift" style={{ fontWeight: 800 }}>
                    REVOKE
                  </Button>
                ) 
              }
            ]} 
            data={apiKeys || []}
          />
        </Card>

        {/* Security Policies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Card className="shadow-hover" style={{ padding: '2rem', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <LuLock className="text-primary" /> Global Auth Policies
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Multi-Factor Auth (MFA)</div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Force biometrics or hardware keys for all managers.</p>
                </div>
                <Button 
                  variant={settings.securityPolicy?.enforceBiometricMFA ? 'primary' : 'secondary'} 
                  size="sm" 
                  onClick={toggleMFA}
                >
                  {settings.securityPolicy?.enforceBiometricMFA ? 'ENFORCED' : 'OFF'}
                </Button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Session Duration</div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Automatic termination of inactive portal sessions.</p>
                </div>
                <select 
                  className="input" 
                  value={settings.securityPolicy?.sessionTimeoutMinutes || 60}
                  onChange={handleSessionChange}
                  style={{ width: '130px', padding: '0.5rem', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}
                >
                   <option value={30}>30 Minutes</option>
                   <option value={60}>1 Hour</option>
                   <option value={480}>8 Hours</option>
                   <option value={43200}>30 Days</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>IP Whitelisting</div>
                  <p className="text-muted" style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Restrict admin access to corporate VPN ranges.</p>
                </div>
                <Button variant="secondary" size="sm" style={{ padding: '0.5rem 1rem' }} onClick={() => setIsIPModalOpen(true)}>Configure</Button>
              </div>
            </div>
          </Card>

          <Card style={{ padding: '1.5rem', background: 'var(--primary-light)', border: '1px dashed var(--primary)', borderRadius: '20px' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <LuShield size={32} className="text-primary" />
               <div>
                  <div style={{ fontWeight: 900, fontSize: '0.9rem' }}>Security Hardening Active</div>
                  <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>All credentials are encrypted using AES-256-GCM before transport to the vault.</p>
               </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Provisioning Modal */}
      <Modal isOpen={isProvisionModalOpen} onClose={() => setIsProvisionModalOpen(false)} title="Provision API Access">
        {!generatedKey ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
              <LuInfo className="text-primary" />
              <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>Provisioning a new key will grant programmatic access to the specified resources.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Target Entity</label>
              <select 
                className="input" 
                value={newKeyData.companyId}
                onChange={(e) => setNewKeyData({ ...newKeyData, companyId: e.target.value })}
              >
                <option value="">Select Client...</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Permission Scopes</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {(['products', 'inventory', 'orders', 'invoices'] as const).map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newKeyData.permissions.includes(p)}
                      onChange={(e) => {
                        const next = e.target.checked 
                          ? [...newKeyData.permissions, p]
                          : newKeyData.permissions.filter(x => x !== p);
                        setNewKeyData({ ...newKeyData, permissions: next });
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'capitalize' }}>{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button variant="primary" style={{ width: '100%', height: '52px' }} onClick={handleProvision}>
              Generate Secure Token
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <LuKey size={32} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontWeight: 900 }}>Production Token Generated</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Store this key immediately. For security, it will not be shown again.</p>
            </div>
            
            <div style={{ 
              padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '2px dashed var(--primary)',
              fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, wordBreak: 'break-all', position: 'relative'
            }}>
              {generatedKey}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={copyKey}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'white', border: '1px solid var(--border)' }}
              >
                <LuCopy />
              </Button>
            </div>

            <Button variant="secondary" onClick={() => setIsProvisionModalOpen(false)}>Close & Finalize</Button>
          </div>
        )}
      </Modal>

      {/* IP Whitelisting Modal */}
      <Modal isOpen={isIPModalOpen} onClose={() => setIsIPModalOpen(false)} title="IP Access Restrictions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem', background: 'var(--warning-bg)', borderRadius: '12px', border: '1px solid var(--warning)' }}>
            <LuGlobe style={{ color: 'var(--warning)' }} />
            <p style={{ fontSize: '0.85rem', margin: 0, fontWeight: 600, color: '#92400e' }}>Active VPN ranges will bypass these restrictions automatically.</p>
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Allowed CIDR Ranges</label>
             <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <Input placeholder="e.g. 192.168.1.0/24" defaultValue="203.0.113.0/24" />
                <Button variant="secondary"><LuPlus /></Button>
             </div>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Badge variant="primary" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   203.0.113.0/24 <LuX size={12} style={{ cursor: 'pointer' }} />
                </Badge>
                <Badge variant="primary" style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   10.0.0.0/8 <LuX size={12} style={{ cursor: 'pointer' }} />
                </Badge>
             </div>
          </div>

          <Button variant="primary" onClick={() => { addAlert({ message: 'IP Whitelist policy updated in gateway.', type: 'success' }); setIsIPModalOpen(false); }}>
             Apply Global Policy
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CredentialManager;
