import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { Card, Badge, Button, Input } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { 
  LuCalendarCheck, LuSearch,
  LuCheck, LuX, LuMessageSquare
} from 'react-icons/lu';

interface LeaveApprovalsProps {
  isTab?: boolean;
}

const LeaveApprovals: React.FC<LeaveApprovalsProps> = ({ isTab }) => {
  const timeOffRequests = useStore(state => state.timeOffRequests);
  const employees = useStore(state => state.employees);
  const updateTimeOffStatus = useStore(state => state.updateTimeOffStatus);
  const locations = useStore(state => state.locations);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [remarkText, setRemarkText] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  const filteredRequests = timeOffRequests.filter(req => {
    const emp = employees.find(e => e.id === req.employeeId);
    const matchesSearch = emp?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleAction = () => {
    if (!processingId) return;
    updateTimeOffStatus(
      processingId, 
      actionType === 'approve' ? 'approved' : 'rejected', 
      remarkText || undefined
    );
    setProcessingId(null);
    setRemarkText('');
  };

  return (
    <div className={!isTab ? "admin-container animate-fade-in" : "animate-fade-in"} style={{ padding: isTab ? 0 : '2rem' }}>
      {!isTab && (
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Badge variant="primary" style={{ marginBottom: '1rem' }}>HR OPERATIONS COMMAND</Badge>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Leave & Absences
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>Global triage board for field operative time-off requests.</p>
          </div>
        </header>
      )}

      <Card style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: '12px', padding: '0 1rem', border: '1px solid var(--border)', flex: 1, minWidth: '300px' }}>
            <LuSearch size={18} color="var(--text-muted)" />
            <Input 
              placeholder="Search operative name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', boxShadow: 'none', fontWeight: 600 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--surface-hover)', padding: '0.35rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
            {['pending', 'approved', 'rejected', 'all'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as any)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '10px',
                  background: statusFilter === status ? 'var(--primary)' : 'transparent',
                  color: statusFilter === status ? '#fff' : 'var(--text-sub)',
                  textTransform: 'uppercase',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: statusFilter === status ? 'var(--shadow-md)' : 'none'
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <AnimatePresence>
          {filteredRequests.map(req => {
            const emp = employees.find(e => e.id === req.employeeId);
            const loc = locations.find(l => l.id === emp?.locationId);
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Card style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{ 
                        width: '56px', height: '56px', borderRadius: '16px', 
                        background: 'var(--primary-glow)', color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1.4rem', border: '1px solid var(--primary-light)'
                      }}>
                        {emp?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>{emp?.name}</h3>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                          {loc?.name || 'Unassigned Location'}
                        </p>
                      </div>
                    </div>
                    <div>
                      {req.status === 'pending' && <Badge variant="warning" style={{ fontWeight: 900 }}>AWAITING TRIAGE</Badge>}
                      {req.status === 'approved' && <Badge variant="success" style={{ fontWeight: 900 }}>AUTHORIZED</Badge>}
                      {req.status === 'rejected' && <Badge variant="neutral" style={{ fontWeight: 900, opacity: 0.6 }}>DECLINED</Badge>}
                    </div>
                  </div>

                  <div style={{ background: 'var(--surface-hover)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem', flex: 1, border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Request Type</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{req.type.toUpperCase()} LEAVE</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Deployment Hiatus</span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>{req.startDate} — {req.endDate}</span>
                    </div>
                    <div style={{ borderTop: '1px dotted var(--border)', paddingTop: '1.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
                        <LuMessageSquare size={14} /> Personnel Justification
                      </span>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 500, fontStyle: 'italic' }}>
                        "{req.reason || 'No specific reason documented.'}"
                      </p>
                    </div>
                    {req.adminRemarks && (
                       <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                         <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem', display: 'block' }}>
                           HR Decision Intelligence
                         </span>
                         <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-sub)', lineHeight: 1.5, fontWeight: 600 }}>{req.adminRemarks}</p>
                       </div>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <Button 
                        variant="secondary" 
                        style={{ flex: 1, height: '48px', fontWeight: 800, color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                        onClick={() => {
                          setProcessingId(req.id);
                          setActionType('reject');
                        }}
                      >
                        <LuX size={18} style={{ marginRight: '0.5rem' }} /> DECLINE
                      </Button>
                      <Button 
                        variant="primary" 
                        style={{ flex: 1, height: '48px', fontWeight: 900 }}
                        onClick={() => {
                          setProcessingId(req.id);
                          setActionType('approve');
                        }}
                      >
                        <LuCheck size={18} style={{ marginRight: '0.5rem' }} /> AUTHORIZE
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {filteredRequests.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '6rem 2rem', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface-hover)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
            }}>
              <LuCalendarCheck size={40} style={{ opacity: 0.3, color: 'var(--text-muted)' }} />
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Active Requests</h3>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>The leave triage queue is currently empty for this filter.</p>
          </div>
        )}
      </div>

      {processingId && (
        <Modal 
          isOpen={true} 
          onClose={() => setProcessingId(null)}
          title={actionType === 'approve' ? 'Authorize Deployment Hiatus' : 'Decline Absence Request'}
        >
          <div style={{ padding: '0.5rem' }}>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-sub)', fontWeight: 500, lineHeight: 1.6 }}>
              {actionType === 'approve' 
                ? 'You are about to authorize this organizational absence. This will be reflected in the regional shift roster and payroll processing.' 
                : 'You are declining this absence request. A clear justification must be provided for the field operative.'}
            </p>
            <div style={{ marginBottom: '2rem' }}>
              <Input 
                label="DECISION REMARKS / JUSTIFICATION"
                placeholder="e.g. Approved as per medical documentation..."
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                style={{ fontWeight: 600 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setProcessingId(null)} style={{ fontWeight: 700 }}>Cancel Triage</Button>
              <Button 
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                onClick={handleAction}
                style={{ minWidth: '160px', fontWeight: 900 }}
              >
                Confirm {actionType === 'approve' ? 'Authorization' : 'Decline'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LeaveApprovals;
