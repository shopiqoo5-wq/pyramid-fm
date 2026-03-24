import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { 
  LuQrCode, LuDownload, LuRefreshCw, LuPalette, LuShield
} from 'react-icons/lu';
import { Card, Button, Input, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';

const CorporateLogin: React.FC = () => {
  const { 
    companies, qrLogins, generateQRToken, updateCompanyBranding, addAlert 
  } = useStore();

  const navigate = useNavigate();
  const qrRef = useRef<HTMLDivElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [brandingEdit, setBrandingEdit] = useState({ primaryColor: '#2563eb', logoUrl: '' });

  const getActiveQR = useCallback((companyId: string) => {
    return qrLogins.find(q => q.companyId === companyId && q.status === 'active');
  }, [qrLogins]);

  const handleDownloadQR = async () => {
    if (qrRef.current) {
      const canvas = await html2canvas(qrRef.current);
      const link = document.createElement('a');
      link.download = `corporate-qr-${selectedCompany?.name || 'access'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleSaveBranding = () => {
    if (!selectedCompany) return;
    updateCompanyBranding(selectedCompany.id, brandingEdit);
    addAlert({ message: `Branding synchronized for ${selectedCompany.name}`, type: 'success' });
    setIsBrandingModalOpen(false);
    setSelectedCompany(null);
  };

  const copyHubLink = (companyId: string) => {
    const token = getActiveQR(companyId)?.token;
    if (!token) {
      addAlert({ message: 'No active token found. Please regenerate.', type: 'error' });
      return;
    }
    const url = `${window.location.origin}/login?qr=${token}`;
    navigator.clipboard.writeText(url);
    addAlert({ message: 'Corporate Hub Link copied to clipboard!', type: 'success' });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px' }}>Corporate Login</h2>
          <p className="text-muted">Enterprise authentication gateways and corporate visual identity management.</p>
        </div>
        <Button variant="primary" onClick={() => navigate('/admin/security')} className="lift shadow-glow">
          <LuShield size={18} /> Authentication Security
        </Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
        {companies.map(company => {
          const activeToken = getActiveQR(company.id);
          return (
            <Card key={company.id} className="lift shadow-hover" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border)', background: 'var(--surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '18px', 
                  background: company.branding?.primaryColor || 'var(--primary-light)', 
                  color: company.branding?.primaryColor ? '#fff' : 'var(--primary)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {company.branding?.logoUrl ? (
                    <img src={company.branding.logoUrl} style={{ width: '40px', height: '40px', objectFit: 'contain' }} alt="Logo" />
                  ) : (
                    <LuShield size={32} />
                  )}
                </div>
                <span className={`status-badge ${company.status === 'active' ? 'success' : 'warning'}`}>
                  {company.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 900 }}>{company.name}</h3>
                <p className="text-muted" style={{ fontSize: '0.85rem' }}>GST: {company.gstNumber}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
                <div style={{ 
                  background: 'var(--surface-hover)', padding: '1rem', borderRadius: '14px', 
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center', 
                  justifyContent: 'space-between' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <LuQrCode size={20} className="text-primary" />
                     <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>QR Login Protocol</span>
                  </div>
                  {activeToken ? (
                    <Badge variant="success">ACTIVE</Badge>
                  ) : (
                    <Badge variant="neutral">INACTIVE</Badge>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Button variant="secondary" onClick={() => { setSelectedCompany(company); setIsQRModalOpen(true); }} className="lift">
                    <LuQrCode size={16} /> View Badge
                  </Button>
                  <Button variant="secondary" onClick={() => { 
                    setSelectedCompany(company); 
                    setBrandingEdit({ primaryColor: company.branding?.primaryColor || '#2563eb', logoUrl: company.branding?.logoUrl || '' }); 
                    setIsBrandingModalOpen(true); 
                  }} className="lift">
                    <LuPalette size={16} /> Theme Matrix
                  </Button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Button variant="ghost" onClick={() => copyHubLink(company.id)} style={{ color: 'var(--primary)', fontWeight: 800, justifyContent: 'flex-start' }} className="lift">
                    <LuDownload size={16} /> Copy Hub Access Link
                  </Button>

                  <Button variant="ghost" onClick={() => { generateQRToken(company.id); addAlert({ message: 'Identity Token Regenerated', type: 'info' }); }} style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.75rem', justifyContent: 'flex-start' }} className="lift">
                    <LuRefreshCw size={14} /> Regenerate Global Token
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* QR Badge Modal */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} title="Corporate Identity Token">
        {selectedCompany && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2.5rem', padding: '1rem' }}>
            <div ref={qrRef} className="id-card-preview" style={{ 
              width: '340px', height: '500px', background: 'white', borderRadius: '28px', 
              boxShadow: '0 30px 60px rgba(0,0,0,0.12)', padding: '2.5rem', display: 'flex', 
              flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden',
              border: '1px solid #e1e8f0'
            }}>
              {/* Card Header Strip */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '90px', background: selectedCompany.branding?.primaryColor || 'var(--primary)', opacity: 0.08 }} />
              
              <div style={{ 
                width: '88px', height: '88px', borderRadius: '24px', 
                background: selectedCompany.branding?.primaryColor || 'var(--primary)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, marginBottom: '2rem',
                boxShadow: `0 8px 20px ${selectedCompany.branding?.primaryColor || 'var(--primary)'}44`
              }}>
                {selectedCompany.branding?.logoUrl ? (
                  <img src={selectedCompany.branding.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '12px' }} />
                ) : (
                  <LuShield size={44} color="white" />
                )}
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem', color: '#1e293b', letterSpacing: '-0.02em' }}>{selectedCompany.name}</h2>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '2.5rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Corporate Access Gateway</p>

              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '24px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                <QRCodeSVG value={`${window.location.origin}/login?qr=${getActiveQR(selectedCompany.id)?.token}`} size={160} />
              </div>

              <div style={{ marginTop: 'auto', textAlign: 'center', width: '100%', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#94a3b8', marginBottom: '0.25rem' }}>Authorized Terminal</div>
                <div style={{ fontWeight: 900, color: 'var(--primary)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>PYRAMID FM NETWORK</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '340px' }}>
              <Button variant="secondary" onClick={() => { generateQRToken(selectedCompany.id); addAlert({ message: 'Identity Token Rotated', type: 'info' }); }} style={{ flex: 1, height: '52px', borderRadius: '16px' }}>
                <LuRefreshCw /> Rotate
              </Button>
              <Button variant="primary" onClick={handleDownloadQR} style={{ flex: 1, height: '52px', borderRadius: '16px' }}>
                <LuDownload /> Export PNG
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Branding Modal */}
      <Modal isOpen={isBrandingModalOpen} onClose={() => setIsBrandingModalOpen(false)} title="Corporate Identity Matrix">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 900, marginBottom: '0.75rem', color: 'var(--text-sub)' }}>CORE BRAND COLOR</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <div style={{ 
                 width: '64px', height: '64px', borderRadius: '16px', 
                 background: brandingEdit.primaryColor, border: '4px solid var(--surface-hover)',
                 boxShadow: 'var(--shadow-sm)'
               }} />
               <div style={{ flex: 1 }}>
                  <Input value={brandingEdit.primaryColor} onChange={e => setBrandingEdit({...brandingEdit, primaryColor: e.target.value})} placeholder="#000000" />
               </div>
               <input type="color" value={brandingEdit.primaryColor} onChange={e => setBrandingEdit({...brandingEdit, primaryColor: e.target.value})} style={{ width: '0', height: '0', visibility: 'hidden', position: 'absolute' }} id="colorPicker" />
               <Button variant="secondary" onClick={() => document.getElementById('colorPicker')?.click()}>Select</Button>
            </div>
          </div>

          <Input label="CORPORATE LOGO URL (SVG/PNG)" value={brandingEdit.logoUrl} onChange={e => setBrandingEdit({...brandingEdit, logoUrl: e.target.value})} placeholder="https://cdn.brand.com/logo.svg" />
          
          <div style={{ padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
             <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 900 }}>Real-time Preview</h4>
             <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: '1rem' }}>This theme will be dynamically injected into the client's custom portal experience.</p>
             <div style={{ height: '40px', background: brandingEdit.primaryColor, borderRadius: '8px', opacity: 0.8 }} />
          </div>

          <Button variant="primary" onClick={handleSaveBranding} className="lift" style={{ height: '56px', fontSize: '1rem' }}>
            Synchronize Theme Matrix
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default CorporateLogin;
