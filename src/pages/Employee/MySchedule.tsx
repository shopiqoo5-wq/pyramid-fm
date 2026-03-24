import React from 'react';
import { useStore } from '../../store';
import { Card, Badge } from '../../components/ui';
import { 
  LuCalendar, LuClock, LuMapPin, LuChevronRight,
  LuShieldCheck, LuCircleAlert
} from 'react-icons/lu';

const MySchedule: React.FC = () => {
  const { currentUser, employeeShifts, locations, employees } = useStore();
  
  const employee = employees.find(e => e.userId === currentUser?.id);
  const myShifts = employeeShifts
    .filter(s => s.employeeId === employee?.id)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const formatDelta = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${diff.toFixed(1)}h`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Progress': return <Badge variant="primary" className="pulse">ACTIVE</Badge>;
      case 'Scheduled': return <Badge variant="info">UPCOMING</Badge>;
      case 'Completed': return <Badge variant="success">COMPLETED</Badge>;
      case 'Cancelled': return <Badge variant="danger">CANCELLED</Badge>;
      default: return <Badge variant="neutral">{status.toUpperCase()}</Badge>;
    }
  };

  return (
    <div className="employee-main animate-fade-in" style={{ paddingBottom: '8rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <Badge variant="info" style={{ marginBottom: '1.25rem', padding: '0.4rem 1.25rem', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.7rem' }}>
          OPERATIONAL ROSTER • Q1 2026
        </Badge>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 950, letterSpacing: '-0.04em', margin: 0, color: 'var(--text-main)' }}>My <span style={{ color: 'var(--primary)' }}>Schedule</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 700, marginTop: '0.6rem' }}>View your assigned deployments and operational slots.</p>
      </header>

      {/* Week Visualization (Mock) */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const today = new Date();
            const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday
            const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + i; // Start from Monday
            const iterDate = new Date(today.setDate(diff));
            const isToday = new Date().toDateString() === iterDate.toDateString();
            
            return (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', opacity: 0.5 }}>
                  {iterDate.toLocaleDateString([], { weekday: 'short' })}
                </div>
                <div style={{ 
                  height: '54px', 
                  borderRadius: '16px', 
                  background: isToday ? 'rgba(249, 115, 22, 0.1)' : 'var(--surface-sub)',
                  border: isToday ? '1px solid var(--primary)' : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isToday ? 'var(--primary)' : 'var(--text-sub)',
                  fontWeight: 950,
                  fontSize: '1rem',
                  boxShadow: isToday ? '0 4px 12px rgba(249, 115, 22, 0.2)' : 'none'
                }}>
                  {iterDate.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Shift List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {myShifts.map((shift) => {
          const location = locations.find(l => l.id === shift.locationId);
          return (
            <Card key={shift.id} variant="glass" style={{ padding: '1.5rem', borderRadius: '28px', border: shift.status === 'In Progress' ? '1px solid var(--primary-light)' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '18px', background: 'var(--surface-sub)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <LuCalendar size={24} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 950, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                      {new Date(shift.startTime).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      <LuClock size={14} /> {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({formatDelta(shift.startTime, shift.endTime)})
                    </div>
                  </div>
                </div>
                {getStatusBadge(shift.status)}
              </div>

              <div style={{ background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ color: 'var(--secondary)' }}><LuMapPin size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '0.95rem' }}>{location?.name || 'Site TBD'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>{location?.address || 'Deployment coordinates required'}</div>
                  </div>
                </div>
                <div style={{ color: 'var(--text-muted)' }}><LuChevronRight size={20} /></div>
              </div>

              {shift.status === 'In Progress' && (
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.85rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                  <LuShieldCheck size={16} className="text-success" />
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Biometric Verification Active</span>
                </div>
              )}
            </Card>
          );
        })}

        {myShifts.length === 0 && (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--surface-sub)', borderRadius: '32px', border: '1px dashed var(--border)' }}>
            <LuCircleAlert size={48} style={{ opacity: 0.1, marginBottom: '1.5rem' }} />
            <div style={{ fontWeight: 900, color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Scheduled Slots</div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Your roster is currently empty. Deployment awaiting command.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySchedule;
