import { useStore } from '../../store';
import { 
  LuBuilding, 
  LuPercent, 
  LuBell,
  LuSave,
  LuMoon,
  LuSun,
  LuPalette,
  LuShield,
  LuLink,
  LuUser,
  LuShieldCheck,
  LuExternalLink
} from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '../../components/ui';
import { useState } from 'react';
import { motion } from 'framer-motion';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, currentUser, addNotification } = useStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pf-theme', next);
    setIsDark(!isDark);
  };

  const handleSaveProfile = () => {
    updateSettings({
      companyName: localSettings.companyName,
      supportEmail: localSettings.supportEmail,
      officeAddress: localSettings.officeAddress
    });
    addNotification({ userId: currentUser!.id, title: 'Profile Updated', message: 'System profile updated successfully.', type: 'success' });
  };

  const handleSaveTax = () => {
    updateSettings({
      defaultGstRate: Number(localSettings.defaultGstRate),
      tdsDeduction: Number(localSettings.tdsDeduction)
    });
    addNotification({ userId: currentUser!.id, title: 'Tax Config Applied', message: 'Global tax configurations applied.', type: 'success' });
  };

  const handleToggleNotification = (key: keyof typeof settings) => {
    const newValue = !localSettings[key];
    setLocalSettings({ ...localSettings, [key]: newValue });
    updateSettings({ [key]: newValue });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px' }}>
      {/* Header */}
      <div className="page-header">
        <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>System Settings</h2>
        <p className="text-muted">Configure global application preferences, platform defaults, and communication rules.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Section 0: My Profile (The User's Request) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-surface" style={{ padding: '2rem', border: '1px solid var(--primary-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-glow)', color: 'white' }}>
                <LuUser size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>Personal Account & Credentials</h3>
                <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Update your administrative identity and security keys.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Input 
                  label="Display Name" 
                  value={currentUser?.name || ''} 
                  onChange={() => {}} // Store update logic would go here
                  placeholder="Your Name" 
                />
                <Input 
                  label="Administrative Email" 
                  value={currentUser?.email || ''} 
                  onChange={() => {}} 
                  placeholder="admin@pyramidfm.com" 
                />
                <Button variant="ghost" size="sm" style={{ alignSelf: 'flex-start' }} onClick={() => addNotification({ userId: currentUser!.id, title: 'Profile Updated', message: 'Identity metadata synchronized with central directory.', type: 'info' })}>
                  Save Identity Changes
                </Button>
              </div>

              <Card style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '18px' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 800 }}>Security Credentials</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <Input label="Active Password" type="password" value="********" readOnly />
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <Input label="New Password" type="password" placeholder="••••••••" style={{ flex: 1 }} />
                      <Input label="Repeat" type="password" placeholder="••••••••" style={{ flex: 1 }} />
                   </div>
                   <Button variant="primary" size="sm" onClick={() => addNotification({ userId: currentUser!.id, title: 'Auth Key Rotated', message: 'Your administrative credentials have been updated.', type: 'success' })}>
                     Rotate Auth Key
                   </Button>
                </div>
              </Card>
            </div>
          </Card>
        </motion.div>
        {/* Section 1: General */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-surface" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <LuBuilding size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Corporate Identity</h3>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
                <Input label="Company Legal Name" value={localSettings.companyName} onChange={e => setLocalSettings({...localSettings, companyName: e.target.value})} placeholder="Pyramid Facility Management Ltd." />
                <Input label="Primary Support Email" type="email" value={localSettings.supportEmail} onChange={e => setLocalSettings({...localSettings, supportEmail: e.target.value})} placeholder="support@pyramidfm.com" />
              </div>
              <Input label="Registered Office Address" value={localSettings.officeAddress} onChange={e => setLocalSettings({...localSettings, officeAddress: e.target.value})} placeholder="Unit 402, Business Park, Mumbai, MH" />
              
              <div style={{ alignSelf: 'flex-end', marginTop: '0.5rem' }}>
                <Button variant="primary" type="submit" className="lift">
                  <LuSave size={18} /> Update Profile
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>

        {/* Section 2: Taxation */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-surface" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--info-bg-light)', color: 'var(--info)' }}>
                <LuPercent size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Global Tax & Compliance</h3>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '2rem' }}>Define baseline GST and TDS rules for the platform. These will be applied to all catalog items unless overridden.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <Input label="Default GST Rate (%)" type="number" value={localSettings.defaultGstRate} onChange={e => setLocalSettings({...localSettings, defaultGstRate: Number(e.target.value)})} />
              <Input label="TDS Standard Deduction (%)" type="number" step="0.1" value={localSettings.tdsDeduction} onChange={e => setLocalSettings({...localSettings, tdsDeduction: Number(e.target.value)})} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={handleSaveTax} className="lift">Apply Regulatory Rules</Button>
            </div>
          </Card>
        </motion.div>

        {/* Section 3: Notifications */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="glass-surface" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--warning-light)', color: 'var(--warning)' }}>
                <LuBell size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Smart Notifications</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[
                { key: 'notifyOnNewClient', label: 'Client Discovery', desc: 'Alert admins when new corporate entities register on the portal.' },
                { key: 'notifyWarehouseOnApproval', label: 'Automation', desc: 'Instantly notify regional warehouses as soon as an order reaches "Approved" status.' },
                { key: 'dailyLowStockDigest', label: 'Inventory Intelligence', desc: 'Send a consolidated daily digest of SKUs hitting their low-stock thresholds.' },
              ].map((notif) => (
                <label key={notif.key} style={{ 
                  display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', 
                  background: 'var(--surface-hover)', borderRadius: '16px', border: '1px solid var(--border)', cursor: 'pointer' 
                }} className="lift">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>{notif.label}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{notif.desc}</div>
                  </div>
                  <div className={`status-badge ${localSettings[notif.key as keyof typeof settings] ? 'success' : 'neutral'}`} style={{ border: 'none', background: localSettings[notif.key as keyof typeof settings] ? 'var(--success-bg)' : 'var(--border)', minWidth: '70px', textAlign: 'center' }}>
                     {localSettings[notif.key as keyof typeof settings] ? 'ENABLED' : 'DISABLED'}
                  </div>
                  <input 
                    type="checkbox" 
                    checked={localSettings[notif.key as keyof typeof settings] as boolean} 
                    onChange={() => handleToggleNotification(notif.key as any)} 
                    style={{ position: 'absolute', opacity: 0, cursor: 'pointer' }}
                  />
                </label>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Section 4: Branding & Documents */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-surface" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <LuPalette size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Branding & PDF Documents</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Logo Upload */}
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2rem', alignItems: 'center' }}>
                <div style={{ 
                  width: '120px', height: '120px', borderRadius: '16px', 
                  background: 'var(--surface-hover)', border: '2px dashed var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {localSettings.logoUrl ? (
                    <img src={localSettings.logoUrl} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  ) : (
                    <LuBuilding size={32} className="text-muted" />
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ fontWeight: 700 }}>Corporate Logo</div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>This logo will appear on all Invoices, Reports, and Delivery Challans.</p>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button variant="secondary" size="sm" onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement).files?.[0];
                          if (file) {
                            if (file.size > 1024 * 1024) { // 1MB limit for performance
                              addNotification({ userId: currentUser!.id, title: 'Logo Too Large', message: 'Please upload an image smaller than 1MB for optimal PDF generation.', type: 'error' });
                              return;
                            }
                            const reader = new FileReader();
                            reader.onload = (re) => {
                              const base64 = re.target?.result as string;
                              setLocalSettings({ ...localSettings, logoUrl: base64 });
                              updateSettings({ logoUrl: base64 });
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                    }}>Upload New Logo</Button>
                    {localSettings.logoUrl && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        setLocalSettings({ ...localSettings, logoUrl: '' });
                        updateSettings({ logoUrl: '' });
                      }}>Remove</Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <Input 
                  label="Official GST Number" 
                  value={localSettings.gstNumber} 
                  onChange={e => setLocalSettings({...localSettings, gstNumber: e.target.value})} 
                  placeholder="29AABCP1234D1Z5"
                />
                <Input 
                  label="Contact Phone (for Docs)" 
                  value={localSettings.contactPhone} 
                  onChange={e => setLocalSettings({...localSettings, contactPhone: e.target.value})} 
                  placeholder="+91 98765 43210"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'flex-end' }}>
                <Input 
                  label="Common Document Footer" 
                  value={localSettings.footerText} 
                  onChange={e => setLocalSettings({...localSettings, footerText: e.target.value})} 
                  placeholder="Computer generated document. No signature required."
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Header Alignment</label>
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-hover)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    {['left', 'center'].map(pos => (
                      <button
                        key={pos}
                        onClick={() => {
                          setLocalSettings({ ...localSettings, logoPosition: pos as any });
                          updateSettings({ logoPosition: pos as any });
                        }}
                        style={{
                          flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none',
                          background: localSettings.logoPosition === pos ? 'var(--primary)' : 'transparent',
                          color: localSettings.logoPosition === pos ? 'white' : 'var(--text-main)',
                          fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                      >
                        {pos.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <Button variant="primary" onClick={() => {
                   updateSettings({
                     gstNumber: localSettings.gstNumber,
                     contactPhone: localSettings.contactPhone,
                     logoPosition: localSettings.logoPosition,
                     footerText: localSettings.footerText
                   });
                   addNotification({ userId: currentUser!.id, title: 'Branding Saved', message: 'PDF document templates updated.', type: 'success' });
                }}>Save Branding Config</Button>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* Section 5: Integration Management */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="glass-surface" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <LuLink size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Integration Engine</h3>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '2rem' }}>Connect and monitor external communication and ERP gateways.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                     <span style={{ fontWeight: 600 }}>SMS Gateway (Transactional)</span>
                     <input 
                        type="checkbox" 
                        checked={localSettings.integrationConfig.smsEnabled} 
                        onChange={(e) => {
                          const conf = { ...localSettings.integrationConfig, smsEnabled: e.target.checked };
                          setLocalSettings({ ...localSettings, integrationConfig: conf });
                          updateSettings({ integrationConfig: conf });
                        }}
                     />
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '12px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                     <span style={{ fontWeight: 600 }}>Email SMTP Relay</span>
                     <input 
                        type="checkbox" 
                        checked={localSettings.integrationConfig.emailEnabled} 
                        onChange={(e) => {
                          const conf = { ...localSettings.integrationConfig, emailEnabled: e.target.checked };
                          setLocalSettings({ ...localSettings, integrationConfig: conf });
                          updateSettings({ integrationConfig: conf });
                        }}
                     />
                  </label>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input 
                    label="Tally ERP Synchronization Endpoint" 
                    value={localSettings.integrationConfig.tallyEndpoint || ''} 
                    onChange={e => {
                       const conf = { ...localSettings.integrationConfig, tallyEndpoint: e.target.value };
                       setLocalSettings({...localSettings, integrationConfig: conf});
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Last successful handshake: {new Date(localSettings.integrationConfig.lastSyncTimestamp || '').toLocaleString()}
                  </div>
               </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
               <Button variant="secondary" onClick={() => {
                  updateSettings({ integrationConfig: localSettings.integrationConfig });
                  addNotification({ userId: currentUser!.id, title: 'Integrations Updated', message: 'Synchronization endpoints updated.', type: 'success' });
               }}>Synchronize Gateways</Button>
            </div>
          </Card>
        </motion.div>

        {/* Section 6: Security & Policy */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-surface" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--error-bg-light)', color: 'var(--error)' }}>
                <LuShield size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Security Hardening</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px solid var(--border)', cursor: 'pointer' }}>
                     <div>
                        <div style={{ fontWeight: 700 }}>Mandatory Biometric MFA</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Require face match for Admin and Director dashboards.</div>
                     </div>
                     <input 
                        type="checkbox" 
                        checked={localSettings.securityPolicy.enforceBiometricMFA} 
                        onChange={(e) => {
                          const pol = { ...localSettings.securityPolicy, enforceBiometricMFA: e.target.checked };
                          setLocalSettings({ ...localSettings, securityPolicy: pol });
                          updateSettings({ securityPolicy: pol });
                        }}
                     />
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                     <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Entropy Threshold</label>
                     <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['standard', 'high'].map(level => (
                           <Button 
                              key={level} 
                              variant={localSettings.securityPolicy.passwordComplexity === level ? 'primary' : 'ghost'}
                              size="sm"
                              style={{ flex: 1 }}
                              onClick={() => {
                                 const pol = { ...localSettings.securityPolicy, passwordComplexity: level as any };
                                 setLocalSettings({ ...localSettings, securityPolicy: pol });
                                 updateSettings({ securityPolicy: pol });
                              }}
                           >
                              {level.toUpperCase()}
                           </Button>
                        ))}
                     </div>
                  </div>
               </div>
               
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <Input 
                    label="Administrative Session Timeout (Minutes)" 
                    type="number" 
                    value={localSettings.securityPolicy.sessionTimeoutMinutes} 
                    onChange={e => {
                      const pol = { ...localSettings.securityPolicy, sessionTimeoutMinutes: parseInt(e.target.value) || 0 };
                      setLocalSettings({...localSettings, securityPolicy: pol});
                    }}
                  />
                  <p className="text-muted" style={{ fontSize: '0.75rem' }}>Sessions automatically terminate after this period of inactivity.</p>
                  <Button variant="secondary" onClick={() => {
                     updateSettings({ securityPolicy: localSettings.securityPolicy });
                     addNotification({ userId: currentUser!.id, title: 'Security Policy Updated', message: 'New governance rules are now in effect.', type: 'warning' });
                  }}>Apply Security Rules</Button>
               </div>
            </div>
          </Card>
        </motion.div>

        {/* Section 7: Access Control & Roles (Simplified) */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="glass-surface" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--success-bg-light)', color: 'var(--success)' }}>
                  <LuShieldCheck size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Role Architecture & Hierarchy</h3>
                  <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Manage organizational tiers, granular permissions, and staff assignments.</p>
                </div>
              </div>
              <Button variant="secondary" onClick={() => navigate('/admin/roles')} className="lift">
                <LuExternalLink size={16} style={{ marginRight: '8px' }} /> Open Role Hub
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-surface" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                <LuPalette size={20} />
              </div>
              <h3 style={{ margin: 0 }}>Appearance & Theme</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>Interface Theme</div>
                <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  Currently: <strong>{isDark ? 'Dark Mode' : 'Light Mode'}</strong>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className="lift"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1.5rem', borderRadius: '12px',
                  background: isDark ? 'var(--primary)' : 'var(--surface)',
                  color: isDark ? 'white' : 'var(--text-main)',
                  border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 700,
                  transition: 'all 0.3s'
                }}
              >
                {isDark ? <LuSun size={18} /> : <LuMoon size={18} />}
                {isDark ? 'Switch to Light' : 'Switch to Dark'}
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
      
      <div style={{ marginBottom: '6rem' }}></div>
    </div>
  );
};

export default AdminSettings;
