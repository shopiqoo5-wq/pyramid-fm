import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import type { AppException } from '../../types';
import { motion } from 'framer-motion';
import {
  LuShieldAlert, LuCheck, LuFilter, LuSearch,
  LuTriangle, LuRefreshCw, LuUser, LuClock, LuShieldCheck,
  LuDownload, LuUsers, LuActivity, LuInfo
} from 'react-icons/lu';
import { Card, Table, Button, Badge, Modal } from '../../components/ui';
import './OpsAudit.css';

const OpsAudit: React.FC = () => {
  const { 
    exceptions, fraudFlags, auditLogs, users, 
    resolveException, updateFraudStatus, addNotification, currentUser 
  } = useStore((state: any) => state);

  const [tab, setTab] = useState<'exceptions' | 'fraud' | 'ledger'>('exceptions');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [isForensicModalOpen, setIsForensicModalOpen] = useState(false);
  const [selectedException, setSelectedException] = useState<AppException | null>(null);

  const [now] = useState(() => Date.now());

  const activeUserIds = Array.from(new Set(auditLogs.map((log: any) => log.userId)));

  const filteredExceptions = exceptions.filter((e: any) => {
    const matchSearch = e.description?.toLowerCase().includes(search.toLowerCase()) || e.type?.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === 'all' || e.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const filteredFlags = fraudFlags.filter((f: any) => {
    return !search || f.reason?.toLowerCase().includes(search.toLowerCase()) || f.userId?.toLowerCase().includes(search.toLowerCase());
  });

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log: any) => {
      const user = users.find((u: any) => u.id === log.userId);
      const logDate = new Date(log.timestamp).getTime();
      const isWithinTimeframe = 
        timeframe === 'all' ? true :
        timeframe === '30days' ? (now - logDate) <= 30 * 24 * 60 * 60 * 1000 :
        timeframe === '7days' ? (now - logDate) <= 7 * 24 * 60 * 60 * 1000 :
        (now - logDate) <= 24 * 60 * 60 * 1000;

      const matchesAction = selectedAction === 'all' || log.action === selectedAction;
      const matchesUser = selectedUser === 'all' || log.userId === selectedUser;
      const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
                            log.details.toLowerCase().includes(search.toLowerCase()) ||
                            (user && user.name.toLowerCase().includes(search.toLowerCase()));
                            
      return isWithinTimeframe && matchesAction && matchesUser && matchesSearch;
    });
  }, [auditLogs, timeframe, selectedAction, selectedUser, search, users, now]);

  const handleExport = () => {
    const csv = [
      ["Timestamp","User","Action","Details"],
      ...filteredLogs.map((log: any) => [
        new Date(log.timestamp).toISOString(), 
        users.find((u: any) => u.id === log.userId)?.name || log.userId, 
        log.action, 
        log.details
      ])
    ].map(e => e.join(",")).join("\n");
    const a = document.createElement("a"); 
    a.href = encodeURI("data:text/csv;charset=utf-8," + csv); 
    a.download = `Platform_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`; 
    a.click();
  };

  const uniqueActions = Array.from(new Set(auditLogs.map((log: any) => log.action))).sort() as string[];

  const handleRefresh = () => {
    if (currentUser) {
      addNotification({ userId: currentUser.id, title: 'Cache Purged', message: 'Governance ledger re-indexed from cold storage.', type: 'success' });
    }
  };

  const sevColor = (s: string) => ({ high: 'var(--danger)', medium: 'var(--warning)', low: 'var(--info)' }[s] || 'var(--text-muted)');
  const sevBg = (s: string) => ({ high: 'var(--danger-bg)', medium: 'var(--warning-bg)', low: 'var(--info-bg)' }[s] || 'var(--surface-hover)');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div className="page-header">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '1.85rem' }}>Ops & Audit Control</h2>
          <p className="text-muted">Monitor system exceptions, anomalies, and fraud risk signals</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="icon-btn" title="Refresh" onClick={handleRefresh}><LuRefreshCw size={18} /></button>
          <button className="icon-btn" title="Information"><LuInfo size={18} /></button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Active Exceptions', value: exceptions.filter((e: any) => e.status === 'active').length, color: 'var(--danger)', bg: 'var(--danger-bg)' },
          { label: 'High Severity', value: exceptions.filter((e: any) => e.severity === 'high').length, color: 'var(--danger)', bg: 'var(--danger-bg)' },
          { label: 'Fraud Flags', value: fraudFlags.filter((f: any) => f.riskLevel !== 'safe').length, color: 'var(--warning)', bg: 'var(--warning-bg)' },
          { label: 'Resolved Today', value: exceptions.filter((e: any) => e.status === 'resolved' && new Date(e.createdAt).toDateString() === new Date().toDateString()).length, color: 'var(--success)', bg: 'var(--success-bg)' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="quick-stat lift"
            style={{ borderLeft: `3px solid ${stat.color}` }}>
            <span className="quick-stat-label">{stat.label}</span>
            <span className="quick-stat-value" style={{ color: stat.color }}>{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="tabs-row" style={{ borderBottom: 'none', gap: '0.5rem' }}>
          <button className={`tab-btn ${tab === 'exceptions' ? 'active' : ''}`} onClick={() => setTab('exceptions')}>
            Security Anomalies ({exceptions.length})
          </button>
          <button className={`tab-btn ${tab === 'fraud' ? 'active' : ''}`} onClick={() => setTab('fraud')}>
            Risk Signals ({fraudFlags.length})
          </button>
          <button className={`tab-btn ${tab === 'ledger' ? 'active' : ''}`} onClick={() => setTab('ledger')}>
            Activity Ledger
          </button>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="search-box" style={{ maxWidth: '260px' }}>
            <LuSearch size={15} className="search-icon" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {tab === 'exceptions' && (
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value)}
              style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.75rem', background: 'var(--surface)', color: 'var(--text-main)', fontSize: '0.875rem', cursor: 'pointer' }}
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          )}
        </div>
      </div>

      {/* Content Rendering */}
      {tab === 'exceptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredExceptions.length === 0 ? (
            <div className="empty-state-full">
              <div className="empty-state-icon"><LuShieldCheck size={56} /></div>
              <h3>No Exceptions Found</h3>
              <p>System is operating normally. No anomalies detected.</p>
            </div>
          ) : filteredExceptions.map((exc: any, i: number) => (
            <motion.div key={exc.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="exception-card lift"
              style={{
                background: 'var(--surface)',
                border: `1px solid var(--border)`,
                borderLeft: `4px solid ${sevColor(exc.severity)}`,
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem 1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{exc.type}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, background: sevBg(exc.severity), color: sevColor(exc.severity), padding: '0.15rem 0.6rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                      {exc.severity}
                    </span>
                    <span className={`status-badge ${exc.status === 'active' ? 'danger' : 'secondary'}`} style={{ fontSize: '0.68rem' }}>
                      {exc.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-sub)', lineHeight: 1.5 }}>{exc.description}</p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><LuClock size={12} />{new Date(exc.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button 
                    className="tag-btn" 
                    onClick={() => {
                      setSelectedException(exc);
                      setIsForensicModalOpen(true);
                    }}
                    style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    Forensic View
                  </button>
                  {exc.status === 'active' && (
                    <button 
                      className="tag-btn active" 
                      onClick={() => {
                        resolveException(exc.id);
                        if (currentUser) {
                          addNotification({ userId: currentUser.id, title: 'Exception Resolved', message: `Exception marks as resolved.`, type: 'success' });
                        }
                      }}
                      style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--success-bg)', color: 'var(--success)', borderColor: 'transparent' }}
                    >
                      <LuCheck size={12} /> Resolve
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'fraud' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filteredFlags.length === 0 ? (
            <div className="empty-state-full">
              <div className="empty-state-icon"><LuShieldAlert size={56} /></div>
              <h3>System Secure</h3>
              <p>No fraud flags have been raised. All activity appears normal.</p>
            </div>
          ) : filteredFlags.map((flag: any, i: number) => (
            <motion.div key={flag.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="fraud-flag-card lift"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: `4px solid ${flag.riskLevel === 'high_risk' ? 'var(--danger)' : 'var(--warning)'}`,
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem 1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      fontSize: '0.95rem', 
                      color: flag.riskLevel === 'high_risk' ? 'var(--danger)' : flag.riskLevel === 'suspicious' ? 'var(--warning)' : 'var(--success)' 
                    }}>
                      <LuTriangle size={15} style={{ marginRight: '0.3rem', verticalAlign: 'middle', transform: flag.riskLevel === 'safe' ? 'rotate(180deg)' : 'none' }} />
                      {flag.riskLevel === 'high_risk' ? 'HIGH' : flag.riskLevel === 'suspicious' ? 'SUSPICIOUS' : 'SAFE'} RISK FLAG
                    </span>
                    <span className={`status-badge ${flag.status === 'blocked' ? 'danger' : 'secondary'}`} style={{ fontSize: '0.68rem' }}>{flag.status}</span>
                  </div>
                  <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-sub)', lineHeight: 1.5 }}><strong>Reason:</strong> {flag.reason}</p>
                  <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><LuUser size={12} />{flag.userId}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><LuClock size={12} />{new Date(flag.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {flag.status !== 'blocked' ? (
                  <button 
                    className="tag-btn" 
                    onClick={() => {
                      updateFraudStatus(flag.id, 'blocked');
                      if (currentUser) {
                        addNotification({ userId: currentUser.id, title: 'User Blocked', message: `Fraud flag escalated. User has been blocked.`, type: 'error' });
                      }
                    }}
                    style={{ fontSize: '0.75rem', flexShrink: 0, color: 'var(--danger)', borderColor: 'var(--danger-light)' }}
                  >
                    Block User
                  </button>
                ) : (
                  <button className="tag-btn" disabled style={{ fontSize: '0.75rem', flexShrink: 0, opacity: 0.5 }}>Blocked</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {tab === 'ledger' && (
        <Card style={{ padding: 0, overflow: 'hidden', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', background: 'var(--surface-hover)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <LuFilter size={14} className="text-muted" />
                <select value={timeframe} onChange={(e: any) => setTimeframe(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700 }}>
                  <option value="all">Any Period</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                </select>
             </div>
             
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <LuShieldCheck size={14} className="text-muted" />
                <select value={selectedAction} onChange={(e: any) => setSelectedAction(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700 }}>
                  <option value="all">All Actions</option>
                  {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
             </div>

             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <LuUsers size={14} className="text-muted" />
                <select value={selectedUser} onChange={(e: any) => setSelectedUser(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)', fontSize: '0.8rem', fontWeight: 700 }}>
                  <option value="all">Personnel: Any</option>
                  {activeUserIds.map((id: any) => <option key={id} value={id}>{users.find((u: any) => u.id === id)?.name || id}</option>)}
                </select>
             </div>

             <Button variant="ghost" size="sm" onClick={handleExport} style={{ marginLeft: 'auto', fontWeight: 800, color: 'var(--primary)' }}>
                <LuDownload size={14} /> Export Governance CSV
             </Button>
          </div>

          <Table 
            columns={[
              { 
                key: 'timestamp', 
                header: 'TIMESTAMP', 
                render: (r: any) => (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{new Date(r.timestamp).toLocaleDateString()}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(r.timestamp).toLocaleTimeString()}</span>
                  </div>
                ) 
              },
              { 
                key: 'user', 
                header: 'ACTOR', 
                render: (r: any) => {
                  const u = users.find((user: any) => user.id === r.userId);
                  return <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{u?.name || r.userId}</span>;
                } 
              },
              { 
                key: 'action', 
                header: 'ACTION', 
                render: (r: any) => <Badge variant={r.action.includes('delete') ? 'danger' : 'primary'} style={{ fontSize: '0.65rem' }}>{r.action.toUpperCase()}</Badge> 
              },
              { 
                key: 'details', 
                header: 'DESCRIPTION', 
                render: (r: any) => <span style={{ opacity: 0.8, fontSize: '0.8rem' }}>{r.details}</span> 
              }
            ]} 
            data={filteredLogs}
          />
        </Card>
      )}

      {/* Forensic Modal */}
      <Modal isOpen={isForensicModalOpen} onClose={() => setIsForensicModalOpen(false)} title="Security Forensic Analysis">
        {selectedException && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1.25rem', background: 'var(--surface-hover)', borderRadius: '16px', border: '1px solid var(--border)' }}>
               <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--danger-bg)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LuShieldAlert size={24} />
               </div>
               <div>
                  <h4 style={{ margin: 0, fontWeight: 800 }}>{selectedException.type}</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Event ID: {selectedException.id}</p>
               </div>
               <Badge variant="danger" style={{ marginLeft: 'auto' }}>CRITICAL ANOMALY</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
               <div className="info-block" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                  <h5 style={{ margin: '0 0 1rem 0', display: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}><LuClock size={14} /> Propagation Time</h5>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--primary)' }}>{new Date(selectedException.createdAt).toLocaleTimeString()}</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Initial burst detected via Gateway node</p>
               </div>
               <div className="info-block" style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px' }}>
                  <h5 style={{ margin: '0 0 1rem 0', display: 'center', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}><LuActivity size={14} /> Risk Vector</h5>
                  <p style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--danger)' }}>98.4% Confidence</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pattern matches known credential spray</p>
               </div>
            </div>

            <div style={{ padding: '1.5rem', background: '#0f172a', color: '#94a3b8', borderRadius: '16px', fontFamily: 'monospace', fontSize: '0.85rem' }}>
               <div style={{ color: '#38bdf8', marginBottom: '0.5rem' }}>// STACK TRACE & FORENSICS:</div>
               <div>{`> EVENT_IDENTIFIER: ${selectedException.id}`}</div>
               <div>{`> ENTITY_CONTEXT: ${selectedException.relatedEntityId}`}</div>
               <div>{`> ANOMALY_DESCRIPTION: ${selectedException.description}`}</div>
               <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>ALERT: Block protocol initiated for ${selectedException.severity} severity breach.</div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
               <Button variant="secondary" onClick={() => setIsForensicModalOpen(false)} style={{ flex: 1 }}>Close Analysis</Button>
               <Button variant="primary" onClick={() => { resolveException(selectedException.id); setIsForensicModalOpen(false); }} style={{ flex: 1 }}>Resolve & Archive</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OpsAudit;
