import React, { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button, Table, Badge } from '../../components/ui';
import { 
  LuShieldCheck,
  LuTriangle,
  LuCheck,
  LuExternalLink,
  LuMapPin,
  LuActivity,
  LuQrCode,
  LuSearch,
  LuFilter
} from 'react-icons/lu';
import { Modal } from '../../components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';

interface BiometricMatchesProps {
  isTab?: boolean;
}

const BiometricMatches: React.FC<BiometricMatchesProps> = ({ isTab = false }) => {
  const { attendanceRecords, employees, locations, approveAttendance, flagAttendance } = useStore((state: any) => state);
  
  const [filter, setFilter] = useState<'all' | 'flagged' | 'verified'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const filteredLogs = attendanceRecords.filter((r: any) => {
    const employee = employees.find((e: any) => e.id === r.employeeId);
    const matchesSearch = (employee?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (r.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || r.timestamp.startsWith(dateFilter);
    const matchesStatus = filter === 'all' || r.status === filter;
    
    return matchesSearch && matchesDate && matchesStatus;
  });

  const columns = [
    {
      key: 'staff',
      header: 'Staff Member',
      render: (r: any) => {
        const employee = employees.find((e: any) => e.id === r.employeeId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '12px', 
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '0.9rem'
            }}>
              {employee?.name.charAt(0) || 'E'}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{employee?.name || 'Unknown Staff'}</div>
              <div className="text-muted" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Badge variant="neutral" style={{ padding: '0 4px', fontSize: '0.65rem' }}>ID</Badge>
                {(r.employeeId || '').slice(0, 12)}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'location',
      header: 'Node Location',
      render: (r: any) => {
        const loc = locations.find((l: any) => l.id === r.locationId);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--surface-hover)' }}>
              <LuMapPin size={14} className="text-primary" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{loc?.name || 'Gateway Alpha'}</span>
          </div>
        );
      }
    },
    {
      key: 'biometric',
      header: 'Facial Match Score',
      render: (r: any) => {
        const score = r.metadata?.faceMatchScore || 100;
        const color = score >= 90 ? 'var(--success)' : score >= 70 ? 'var(--warning)' : 'var(--error)';
        return (
          <div style={{ minWidth: '140px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem' }}>
              <span style={{ fontWeight: 900, color: color }}>{score}% AUTHENTIC</span>
              {r.status === 'verified' ? <LuShieldCheck size={16} color="var(--success)" /> : <LuTriangle size={16} color="var(--error)" />}
            </div>
            <div style={{ height: '6px', background: 'var(--surface-hover)', borderRadius: '3px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${score}%` }}
                style={{ height: '100%', background: color }} 
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'analysis',
      header: 'AI Classification',
      render: (r: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LuActivity size={12} className="text-info" />
            <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{r.metadata?.workTag || 'General Activity'}</span>
          </div>
          <div className="text-muted" style={{ fontSize: '0.65rem' }}>
            Confidence Level: **{r.metadata?.confidenceScore || 100}%**
          </div>
        </div>
      )
    },
    {
      key: 'timestamp',
      header: 'Temporal Trace',
      render: (r: any) => (
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: 700 }}>{new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(r.timestamp).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Audit Actions',
      render: (r: any) => (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="ghost" size="sm" onClick={() => {
            setSelectedRecord(r);
            setIsEvidenceModalOpen(true);
          }} className="lift">
            <LuExternalLink size={18} />
          </Button>
          {(r.status === 'flagged' || r.status === 'rejected') ? (
            <Button variant="ghost" size="sm" style={{ color: 'var(--success)' }} onClick={() => approveAttendance(r.id)} className="lift">
              <LuCheck size={20} />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" style={{ color: 'var(--error)' }} onClick={() => flagAttendance(r.id, 'Manual Review Required')} className="lift">
               <LuTriangle size={18} />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {!isTab && (
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px' }}>
              Biometric Audit Trace
            </h2>
            <p className="text-muted">Forensic verification of facial authenticity and real-time AI work-tagging logs.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <Button variant="secondary" onClick={() => setIsQRModalOpen(true)} className="lift">
              <LuQrCode size={18} /> Provision Gateway QR
            </Button>
            <Button variant="primary" className="lift shadow-glow">
              Export Audit Logs
            </Button>
          </div>
        </header>
      )}

      {/* Control Bar */}
      <Card style={{ padding: '1.25rem', borderRadius: '20px', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--surface)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
          <LuSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            className="input" 
            placeholder="Search by name, ID or neural signature..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '3rem', width: '100%', height: '48px', borderRadius: '15px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--surface-hover)', padding: '0.4rem', borderRadius: '14px' }}>
          {(['all', 'flagged', 'verified'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              style={{ 
                padding: '0.6rem 1.25rem', border: 'none', borderRadius: '10px',
                background: filter === t ? 'var(--primary)' : 'transparent',
                color: filter === t ? 'white' : 'var(--text-muted)',
                fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                textTransform: 'uppercase'
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative' }}>
          <LuFilter style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
          <input 
            type="date" 
            className="input" 
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            style={{ width: '180px', height: '48px', paddingLeft: '2.5rem', borderRadius: '15px', background: 'var(--surface-hover)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
          />
        </div>
      </Card>

      <Card style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
        <Table columns={columns} data={filteredLogs} />
      </Card>

      {/* QR Provisioning Modal */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} title="Registry Attendance Gateway">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', display: 'block', color: 'var(--text-sub)' }}>SELECT TARGET FACILITY</label>
            <select 
              className="input" 
              style={{ width: '100%', padding: '1rem', borderRadius: '14px', background: 'var(--surface-hover)' }}
              onChange={(e) => setSelectedLocation(locations.find((l: any) => l.id === e.target.value))}
            >
              <option value="">Choose Node...</option>
              {locations.map((l: any) => <option key={l.id} value={l.id}>{l.name} - {l.address}</option>)}
            </select>
          </div>

          <AnimatePresence>
            {selectedLocation && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ textAlign: 'center' }}>
                <div style={{ background: 'white', padding: '2.5rem', borderRadius: '32px', display: 'inline-block', boxShadow: 'var(--shadow-2xl)', marginBottom: '2rem' }}>
                  <QRCodeSVG value={`att:${selectedLocation.id}`} size={220} />
                </div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 900, fontSize: '1.4rem' }}>{selectedLocation.name}</h3>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>Node Protocol: `att:{selectedLocation.id}`</p>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button variant="secondary" onClick={() => window.print()} style={{ flex: 1, height: '50px' }}>Print Label</Button>
                  <Button variant="primary" onClick={() => setIsQRModalOpen(false)} style={{ flex: 1, height: '50px' }}>Confirm Provisioning</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Modal>

      {/* Evidence Viewer Modal */}
      <Modal isOpen={isEvidenceModalOpen} onClose={() => setIsEvidenceModalOpen(false)} title="Biometric Evidence Forensics">
        {selectedRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ width: '100%', aspectRatio: '16/9', background: 'var(--surface-hover)', borderRadius: '24px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border)' }}>
              {selectedRecord.metadata?.imageUrl ? (
                <img src={selectedRecord.metadata.imageUrl} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <LuShieldCheck size={64} style={{ opacity: 0.1 }} />
                </div>
              )}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                 <Badge variant={(selectedRecord.metadata?.faceMatchScore || 100) >= 90 ? 'success' : 'warning'}>
                    {(selectedRecord.metadata?.faceMatchScore || 100)}% Match
                 </Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-sub)', marginBottom: '0.75rem' }}>NEURAL SIGNATURE</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--text-main)' }}>{selectedRecord.metadata?.faceMatchScore || 100}%</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Authenticity Verified</div>
              </div>
              <div style={{ padding: '1.5rem', borderRadius: '20px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-sub)', marginBottom: '0.75rem' }}>AI INTENT TAG</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 950, color: 'var(--primary)' }}>{selectedRecord.metadata?.confidenceScore || 100}%</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>Classification Confidence</div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--text-sub)', marginBottom: '0.75rem', display: 'block' }}>AUDIT TAG (OVERRIDE)</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select 
                  className="input" 
                  value={selectedRecord.metadata?.workTag || ''}
                  onChange={(e) => useStore.getState().updateAttendanceTag(selectedRecord.id, e.target.value)}
                  style={{ flex: 1, height: '52px', borderRadius: '15px' }}
                >
                  <option value="Cleaning completed">Facility Sanitation</option>
                  <option value="Stock arranged">Inventory Logistics</option>
                  <option value="Delivery completed">Outbound Dispatch</option>
                  <option value="Maintenance activity">Technical Maintenance</option>
                  <option value="General Duty">Standard Operations</option>
                </select>
                <Button variant="primary" onClick={() => setIsEvidenceModalOpen(false)} style={{ padding: '0 2rem' }}>VERIFY TRACE</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BiometricMatches;
