import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { Card, Button, Input, Table, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { 
  LuArrowLeft, LuSettings2, LuZap, LuBox, 
  LuDollarSign, LuUsers, LuMapPin, LuShieldCheck,
  LuBookOpen, LuPlus, LuTrash2, LuQrCode
} from 'react-icons/lu';
import { QRCodeSVG } from 'qrcode.react';

const SiteMatrix: React.FC = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const companies = useStore((state) => state.companies);
  const locations = useStore((state) => state.locations);
  const products = useStore((state) => state.products);
  const employees = useStore((state) => state.employees);
  const siteProtocols = useStore((state) => state.siteProtocols);
  const addSiteProtocol = useStore((state) => state.addSiteProtocol);
  const deleteSiteProtocol = useStore((state) => state.deleteSiteProtocol);
  const generateLocationQR = useStore((state) => state.generateLocationQR);
  const updateLocationCoordinates = useStore((state) => state.updateLocationCoordinates);

  const company = companies.find(c => c.id === companyId);
  const siteLocations = locations.filter(l => l.companyId === companyId);

  const [activeSiteId, setActiveSiteId] = useState<string | null>(siteLocations[0]?.id || null);
  const activeSite = siteLocations.find(s => s.id === activeSiteId);
  const [showProtocolModal, setShowProtocolModal] = useState(false);
  const [newProtocol, setNewProtocol] = useState({ title: '', content: '' });

  if (!company) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 className="text-danger">Company Identifier Not Found</h2>
        <Button onClick={() => navigate('/admin/enterprise-clients')}>Back to Registry</Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Button variant="ghost" onClick={() => navigate('/admin/enterprise-clients')} className="icon-btn-premium">
            <LuArrowLeft size={20} />
          </Button>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px' }}>
              Operations Matrix: {company.name}
            </h2>
            <p className="text-muted">Configure location-specific logistics, pricing, and personnel overrides.</p>
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2.5rem' }}>
        {/* Site Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', paddingLeft: '0.5rem' }}>
            Managed Sites
          </h3>
          {siteLocations.map(site => (
            <Card 
              key={site.id} 
              onClick={() => setActiveSiteId(site.id)}
              className={`lift ${activeSiteId === site.id ? 'active-site-card' : ''}`}
              style={{ 
                padding: '1.25rem', 
                cursor: 'pointer', 
                border: activeSiteId === site.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                background: activeSiteId === site.id ? 'var(--primary-light)' : 'var(--surface-glass)'
              }}
            >
              <div style={{ fontWeight: 800, color: activeSiteId === site.id ? 'var(--primary)' : 'var(--text-main)' }}>{site.name}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.25rem' }}>{site.address.substring(0, 30)}...</div>
            </Card>
          ))}
        </div>

        {/* Configuration Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {activeSite ? (
            <>
              {/* Site Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                <Card variant="premium" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="icon-box-primary"><LuUsers size={20} /></div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>{employees.filter(e => e.locationId === activeSite.id).length}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deployed Staff</div>
                  </div>
                </Card>
                <Card variant="premium" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="icon-box-secondary" style={{ background: 'var(--success-bg-light)', color: 'var(--success)' }}><LuShieldCheck size={20} /></div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>SECURED</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Site Integrity</div>
                  </div>
                </Card>
                <Card variant="premium" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="icon-box-orange"><LuSettings2 size={20} /></div>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900 }}>ACTIVE</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Config Status</div>
                  </div>
                </Card>
              </div>

              {/* Geofence & QR Identity Matrix */}
              <Card className="glass-surface" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <LuMapPin className="text-primary" /> Geofence & Identity Matrix
                  </h3>
                  <Badge variant={activeSite.qrStatus === 'active' ? 'success' : 'neutral'}>
                    {activeSite.qrStatus === 'active' ? 'SECURE QR DEPLOYED' : 'AWAITING GENERATION'}
                  </Badge>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* GPS Coordinates telemetry */}
                  <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '0.1em' }}>GPS Telemetry Locks</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <Input 
                          label="Latitude" 
                          value={activeSite.latitude || ''} 
                          onChange={(e) => updateLocationCoordinates(activeSite.id, parseFloat(e.target.value), activeSite.longitude || 0)}
                          placeholder="e.g. 19.0760" 
                          type="number"
                        />
                        <Input 
                          label="Longitude" 
                          value={activeSite.longitude || ''} 
                          onChange={(e) => updateLocationCoordinates(activeSite.id, activeSite.latitude || 0, parseFloat(e.target.value))}
                          placeholder="e.g. 72.8777" 
                          type="number"
                        />
                      </div>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => {
                          if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition((pos) => {
                              updateLocationCoordinates(activeSite.id, pos.coords.latitude, pos.coords.longitude);
                            });
                          }
                        }}
                        style={{ width: '100%', fontSize: '0.75rem' }}
                      >
                        <LuMapPin size={14} style={{ marginRight: '6px' }} /> Use My Current Location
                      </Button>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>* Locks the 100-meter operating radius for this facility.</p>
                  </div>

                  {/* QR Generator */}
                  <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    {activeSite.qrToken && activeSite.qrStatus === 'active' ? (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem' }}>
                          <QRCodeSVG 
                            className="qr-matrix-svg"
                            value={JSON.stringify({ locationId: activeSite.id, token: activeSite.qrToken, type: 'geofence_auth' })} 
                            size={120} 
                          />
                        </div>
                        <div style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: 800, background: 'rgba(59, 130, 246, 0.1)', padding: '0.4rem 1rem', borderRadius: '8px' }}>
                          TOKEN: {activeSite.qrToken.split('-')[0].toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <LuQrCode size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>No authorization matrix established.</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: 'auto' }}>
                      <Button 
                        variant="primary" 
                        onClick={() => generateLocationQR(activeSite.id)}
                        style={{ flex: 1 }}
                      >
                        {activeSite.qrToken ? 'Regenerate' : 'Establish Matrix'}
                      </Button>
                      {activeSite.qrToken && (
                        <Button 
                          variant="secondary"
                          onClick={() => {
                            const svg = document.querySelector('.qr-matrix-svg');
                            if (svg) {
                              const svgData = new XMLSerializer().serializeToString(svg);
                              const canvas = document.createElement("canvas");
                              const svgSize = 140; // Increased size for quality
                              canvas.width = svgSize;
                              canvas.height = svgSize;
                              const ctx = canvas.getContext("2d");
                              const img = new Image();
                              img.onload = () => {
                                if (ctx) {
                                  ctx.fillStyle = "white";
                                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                                  ctx.drawImage(img, 10, 10, svgSize - 20, svgSize - 20);
                                  const pngFile = canvas.toDataURL("image/png");
                                  const downloadLink = document.createElement("a");
                                  downloadLink.download = `${activeSite.name}-Site-QR.png`;
                                  downloadLink.href = `${pngFile}`;
                                  downloadLink.click();
                                }
                              };
                              img.src = "data:image/svg+xml;base64," + btoa(svgData);
                            }
                          }}
                          className="icon-btn-premium sm"
                          title="Download QR"
                        >
                          <LuQrCode size={18} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Pricing Overrides */}
              <Card className="glass-surface" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <LuDollarSign className="text-primary" /> Site-Specific Pricing
                  </h3>
                  <Badge variant="info">PREMIUM TIER OVERRIDE</Badge>
                </div>
                <Table 
                  columns={[
                    { key: 'name', header: 'PRODUCT', render: (p: any) => <strong>{p.name}</strong> },
                    { key: 'basePrice', header: 'BASE PRICE', render: (p: any) => `₹${p.price.toLocaleString()}` },
                    { key: 'override', header: 'SITE PRICE', render: (p: any) => (
                      <Input 
                        value={Math.round(p.price * 0.95)} 
                        style={{ width: '100px', padding: '0.25rem' }} 
                        className="p-0"
                      />
                    )},
                    { key: 'discount', header: 'SAVINGS', render: () => (
                      <span className="text-success" style={{ fontWeight: 800 }}>-5.00%</span>
                    ) }
                  ]}
                  data={products.slice(0, 5)}
                />
              </Card>

              {/* Resource Matrix */}
              <Card className="glass-surface" style={{ padding: '2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <LuBox className="text-secondary" /> Inventory Accessibility
                  </h3>
                  <Button variant="ghost" size="sm">Modify Rules</Button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                   {products.slice(5, 11).map(p => (
                     <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '12px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.name}</span>
                     </div>
                   ))}
                </div>
              </Card>

              {/* Personnel Assignment */}
              <Card className="glass-surface" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <LuUsers className="text-orange" /> Authorized Staff registry
                  </h3>
                  <Button variant="primary" size="sm"><LuZap size={14} /> Reassign Force</Button>
                </div>
                <Table 
                  columns={[
                    { key: 'name', header: 'STAFF MEMBER', render: (e: any) => <strong>{e.name}</strong> },
                    { key: 'role', header: 'DESIGNATION', render: (e: any) => <Badge variant="neutral">{e.role}</Badge> },
                    { key: 'status', header: 'OP STATUS', render: () => <span style={{ color: 'var(--success)', fontWeight: 800 }}>ON-DUTY</span> }
                  ]}
                  data={employees.filter(e => e.locationId === activeSite.id)}
                />
              </Card>

              {/* Site Protocols */}
              <Card className="glass-surface" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <LuBookOpen className="text-secondary" /> Facility Protocols
                  </h3>
                  <Button variant="primary" size="sm" onClick={() => setShowProtocolModal(true)}>
                    <LuPlus size={14} style={{ marginRight: '0.5rem' }} /> Add Protocol
                  </Button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {siteProtocols.filter(p => p.locationId === activeSite.id).map((protocol, i) => (
                    <div key={protocol.id} style={{ display: 'flex', gap: '1.25rem', padding: '1.25rem', borderRadius: '16px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '10px', 
                        background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontWeight: 950, fontSize: '0.85rem'
                      }}>
                        {i+1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>{protocol.title}</div>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.5 }}>{protocol.content}</p>
                      </div>
                      <button 
                        onClick={() => deleteSiteProtocol(protocol.id)}
                        className="text-white/20 hover:text-red-500 transition-colors"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', padding: 0 }}
                        title="Remove Protocol"
                      >
                        <LuTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {siteProtocols.filter(p => p.locationId === activeSite.id).length === 0 && (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', border: '1px dashed var(--border)', borderRadius: '16px' }}>
                      No active protocols defined for this site.
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <div style={{ padding: '5rem', textAlign: 'center', opacity: 0.3 }}>
              <LuMapPin size={64} style={{ marginBottom: '1.5rem' }} />
              <h3>Select a site to view the operational matrix</h3>
            </div>
          )}
        </div>
      </div>

      {/* Protocol Creation Modal */}
      {activeSite && (
        <Modal
          isOpen={showProtocolModal}
          onClose={() => setShowProtocolModal(false)}
          title={`New Protocol for ${activeSite.name}`}
          style={{ '--primary': '#3b82f6' } as any}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
            <div className="input-group">
              <label className="input-label">Protocol Title / Directive</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="e.g. Mandatory PPE Area"
                value={newProtocol.title}
                onChange={e => setNewProtocol({ ...newProtocol, title: e.target.value })}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Protocol Content / Procedure</label>
              <textarea 
                className="input-field"
                style={{ height: '120px', resize: 'none' }}
                placeholder="Enter detailed SOP regulations..."
                value={newProtocol.content}
                onChange={e => setNewProtocol({ ...newProtocol, content: e.target.value })}
              />
            </div>
            <Button 
              variant="primary" 
              className="w-full btn-lg shadow-glow"
              onClick={async () => {
                if (!newProtocol.title || !newProtocol.content) return;
                await addSiteProtocol({
                  title: newProtocol.title,
                  content: newProtocol.content,
                  locationId: activeSite.id
                });
                setShowProtocolModal(false);
                setNewProtocol({ title: '', content: '' });
              }}
            >
              Enforce Protocol
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SiteMatrix;
