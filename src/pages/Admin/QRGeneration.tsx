import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  LuPrinter, 
  LuRefreshCw, 
  LuMapPin, 
  LuShieldCheck, 
  LuInfo,
  LuSearch
} from 'react-icons/lu';
import { Button, Badge } from '../../components/ui';

const QRGeneration: React.FC<{ isTab?: boolean }> = ({ isTab }) => {
  const locations = useStore(state => state.locations);
  const generateLocationQR = useStore(state => state.generateLocationQR);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(locations[0]?.id || null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  const qrValue = selectedLocation?.qrToken 
    ? `pyramid-fm-punch:${selectedLocation.qrToken}:${selectedLocation.id}` 
    : '';

  return (
    <div className="qr-gen-container animate-fade-in" style={{ 
      display: 'grid', 
      gridTemplateColumns: '350px 1fr', 
      gap: '2rem',
      height: isTab ? 'calc(100vh - 350px)' : 'calc(100vh - 200px)',
      minHeight: '600px'
    }}>
      {/* Sidebar: Location List */}
      <div className="glass-surface no-print" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <LuMapPin className="text-primary" size={20} />
            <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem' }}>Select Site</h3>
          </div>
          <div className="search-box" style={{ background: 'var(--bg-color)' }}>
            <LuSearch size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search sites..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }} className="hide-scrollbar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredLocations.map(loc => (
              <motion.button
                key={loc.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedLocationId(loc.id)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: selectedLocationId === loc.id ? 'var(--primary)' : 'var(--border)',
                  background: selectedLocationId === loc.id ? 'var(--primary-glow)' : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}
              >
                <div style={{ 
                  fontWeight: 800, 
                  color: selectedLocationId === loc.id ? 'var(--primary)' : 'var(--text-main)',
                  fontSize: '0.95rem'
                }}>
                  {loc.name}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {loc.address}
                </div>
                {loc.qrToken && (
                  <Badge variant="success" style={{ marginTop: '0.5rem', alignSelf: 'flex-start', fontSize: '0.6rem' }}>
                    SECURE TOKEN ACTIVE
                  </Badge>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content: QR View & Actions */}
      <div className="display-area" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {selectedLocation ? (
          <>
            {/* Action Bar */}
            <div className="glass-surface no-print" style={{ 
              padding: '1.5rem 2rem', 
              borderRadius: '24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              border: '1px solid var(--border)'
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-main)', margin: 0 }}>
                  {selectedLocation.name}
                </h2>
                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {selectedLocation.address}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button 
                  variant="secondary" 
                  onClick={() => generateLocationQR(selectedLocation.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <LuRefreshCw size={18} />
                  <span>Regenerate Token</span>
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handlePrint}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <LuPrinter size={18} />
                  <span>Print Site Poster</span>
                </Button>
              </div>
            </div>

            {/* Poster Preview */}
            <div className="poster-workspace hide-scrollbar" style={{ 
              flex: 1, 
              display: 'flex', 
              justifyContent: 'center', 
              background: 'var(--surface-hover)', 
              borderRadius: '32px', 
              padding: '3rem',
              overflowY: 'auto',
              border: '1px solid var(--border)'
            }}>
              {/* This is the printable part */}
              <div 
                id="printable-poster"
                className="site-qr-poster"
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  background: '#fff',
                  padding: '40mm 20mm',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.1)',
                  borderRadius: '4px',
                  color: '#000',
                  position: 'relative'
                }}
              >
                {/* Print Styles */}
                <style dangerouslySetInnerHTML={{ __html: `
                  @media print {
                    body * { visibility: hidden; }
                    #printable-poster, #printable-poster * { visibility: visible; }
                    #printable-poster { 
                      position: fixed; 
                      left: 0; top: 0; width: 100%; height: 100%; 
                      padding: 20mm; margin: 0; box-shadow: none; border: none;
                    }
                    .no-print { display: none !important; }
                  }
                `}} />

                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <div style={{ 
                    width: '80px', height: '80px', background: '#2563eb', color: '#fff', 
                    borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '48px', fontWeight: 900, margin: '0 auto 20px auto'
                  }}>
                    P
                  </div>
                  <h1 style={{ fontSize: '42px', fontWeight: 900, letterSpacing: '-2px', margin: 0 }}>PYRAMID FM</h1>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '4px', marginTop: '4px' }}>
                    Secured Site Operations
                  </div>
                </div>

                <div style={{ 
                  padding: '30px', border: '2px solid #e2e8f0', borderRadius: '40px', background: '#f8fafc',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px', width: '100%'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: '#3b82f6', textTransform: 'uppercase', marginBottom: '8px' }}>Active Duty Station</div>
                    <div style={{ fontSize: '32px', fontWeight: 950, letterSpacing: '-1px' }}>{selectedLocation.name}</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#64748b', marginTop: '4px' }}>{selectedLocation.address}</div>
                  </div>

                  <div style={{ 
                    padding: '30px', background: '#fff', borderRadius: '30px', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0'
                  }}>
                    {qrValue ? (
                      <QRCodeCanvas 
                        value={qrValue} 
                        size={320}
                        level="H"
                        includeMargin={true}
                        imageSettings={{
                          src: "https://raw.githubusercontent.com/lucide-react/lucide/main/icons/shield-check.svg",
                          x: undefined,
                          y: undefined,
                          height: 48,
                          width: 48,
                          excavate: true,
                        }}
                      />
                    ) : (
                      <div style={{ width: 320, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 800 }}>
                        TOKEN PENDING GENERATION
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 950, marginBottom: '12px' }}>SCAN TO ATTEND</div>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: '#475569', fontWeight: 600 }}>
                      Open the Pyramid FM Field Service app, select "SECURE SCAN" from your dashboard, and point your camera at this QR code to authenticate your presence on-site.
                    </p>
                  </div>
                </div>

                <div style={{ 
                  marginTop: 'auto', width: '100%', borderTop: '2px dashed #cbd5e1', 
                  paddingTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '12px' }}>
                      <LuShieldCheck size={24} style={{ color: '#0f172a' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>AUTH STATUS</div>
                      <div style={{ fontSize: '14px', fontWeight: 950 }}>ENCRYPTED PROTOCOL 2.0</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#64748b' }}>VALIDATION DATE</div>
                    <div style={{ fontSize: '14px', fontWeight: 950 }}>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</div>
                  </div>
                </div>

                <div style={{ 
                  position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center',
                  fontSize: '10px', fontWeight: 800, color: '#94a3b8', letterSpacing: '2px'
                }}>
                  PROPERTY OF PYRAMID FACILITY MANAGEMENT SOLUTIONS • INTERNAL USE ONLY
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="glass-surface" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '32px' }}>
            <div style={{ textAlign: 'center', maxWidth: '400px' }}>
              <LuInfo size={48} style={{ color: 'var(--primary)', marginBottom: '1.5rem', opacity: 0.5 }} />
              <h3 style={{ fontSize: '1.5rem', fontWeight: 950, color: 'var(--text-main)' }}>No Site Selected</h3>
              <p style={{ color: 'var(--text-muted)', fontWeight: 700, lineHeight: 1.6 }}>
                Select a duty station from the sidebar to generate its unique, encrypted punch-in QR code.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGeneration;
