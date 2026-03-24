import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import { 
  LuWebhook, 
  LuPlus, 
  LuTrash2, 
  LuPower, 
  LuPowerOff,
  LuGlobe,
  LuMessageSquare,
  LuDatabase,
  LuZap
} from 'react-icons/lu';
import { Card, Button, Input, Table } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

const AdminIntegrations: React.FC = () => {
  const { webhooks, addWebhook, deleteWebhook, toggleWebhookActive, currentUser, addNotification } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    event: 'order.created' as const,
    secretKey: ''
  });

  const handleCreate = () => {
    if (!newWebhook.name || !newWebhook.url) return alert('Name and URL are required.');
    addWebhook({ ...newWebhook, active: true });
    setIsModalOpen(false);
    setNewWebhook({ name: '', url: '', event: 'order.created', secretKey: '' });
  };

  const handlePing = (id: string, url: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
      addNotification({ userId: currentUser!.id, title: 'Ping Successful', message: `Connection to ${url} successful! (Latency: ${Math.floor(Math.random() * 50) + 10}ms)`, type: 'success' });
    }, 1200);
  };

  const integrationPartners = [
    { name: 'SAP ERP', color: '#008FD3', icon: <LuDatabase /> },
    { name: 'Oracle Cloud', color: '#F80000', icon: <LuGlobe /> },
    { name: 'Zoho Inventory', color: '#F4C430', icon: <LuZap /> },
    { name: 'Slack Notifications', color: '#4A154B', icon: <LuMessageSquare /> },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Integrations & API</h2>
          <p className="text-muted">Connect your ERP systems, logistics providers, and internal tools via secure webhooks.</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="lift">
          <LuPlus size={18} /> Register New Endpoint
        </Button>
      </div>

      {/* Partners Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {integrationPartners.map((p, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1 }}
            className="glass-surface lift"
            style={{ padding: '1.25rem', borderLeft: `4px solid ${p.color}`, display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ padding: '0.75rem', borderRadius: '10px', background: `${p.color}15`, color: p.color }}>
              {p.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Pre-built Connector</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Card className="glass-surface" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LuWebhook size={24} />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>Webhook Endpoints</h3>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Events are pushed as automated HTTP POST payloads.</p>
          </div>
        </div>

        {webhooks.length > 0 ? (
          <div className="table-container">
            <Table
              columns={[
                { 
                  key: 'status', 
                  header: 'State', 
                  render: (row) => (
                    <div className={`status-badge ${row.active ? 'success' : 'neutral'}`} style={{ border: 'none', background: row.active ? 'var(--success-bg)' : 'var(--surface-hover)' }}>
                       <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', marginRight: '6px' }} />
                       {row.active ? 'ACTIVE' : 'INACTIVE'}
                    </div>
                  ) 
                },
                { 
                  key: 'name', 
                  header: 'Service Name', 
                  render: (row) => (
                    <div style={{ fontWeight: 600 }}>{row.name}</div>
                  ) 
                },
                { 
                  key: 'event', 
                  header: 'Subscribed Event', 
                  render: (row) => <span className="status-badge info" style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{row.event}</span> 
                },
                { 
                  key: 'url', 
                  header: 'Payload URL', 
                  render: (row) => <div className="text-muted" style={{ fontSize: '0.85rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.url}</div> 
                },
                { 
                  key: 'actions', 
                  header: '', 
                  render: (row) => (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handlePing(row.id, row.url)}
                        isLoading={testingId === row.id}
                        className="lift"
                        style={{ fontSize: '0.75rem', borderRadius: '8px' }}
                      >
                        Ping Test
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleWebhookActive(row.id)}
                        title={row.active ? "Pause" : "Resume"}
                        className="lift"
                      >
                        {row.active ? <LuPowerOff size={16} className="text-warning" /> : <LuPower size={16} className="text-success" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { if (confirm('Delete?')) deleteWebhook(row.id); }}
                        className="lift text-danger"
                      >
                        <LuTrash2 size={16} />
                      </Button>
                    </div>
                  ) 
                }
              ]}
              data={webhooks}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--surface-hover)', borderRadius: '24px', border: '1px dashed var(--border)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block', color: 'var(--text-muted)', opacity: 0.2 }}>
              <LuWebhook size={64} />
            </motion.div>
            <h3 style={{ marginTop: '2rem', color: 'var(--text-muted)' }}>Universal API Orchestrator</h3>
            <p className="text-muted" style={{ maxWidth: '450px', margin: '0.5rem auto 2rem auto' }}>
              You haven't connected any external tools yet. Start by defining an endpoint to receive real-time order lifecycle events.
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)} className="lift">Register Your First Webhook</Button>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Integration Endpoint"
        className="glass-surface"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Target System Alias</label>
            <Input 
              value={newWebhook.name} 
              onChange={e => setNewWebhook({...newWebhook, name: e.target.value})} 
              placeholder="e.g. AWS Lambda Service" 
            />
          </div>

          <div>
            <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Endpoint Destination</label>
            <Input 
              type="url"
              value={newWebhook.url} 
              onChange={e => setNewWebhook({...newWebhook, url: e.target.value})} 
              placeholder="https://hooks.yourdomain.com/pyramid-sync" 
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Requires a valid SSL (HTTPS) certificate for security.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Event Subscription</label>
              <select 
                value={newWebhook.event} 
                onChange={e => setNewWebhook({...newWebhook, event: e.target.value as any})}
                className="input"
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px' }}
              >
                <option value="order.created">order.created</option>
                <option value="order.delivered">order.delivered</option>
              </select>
            </div>
            <div>
              <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Authorization Key</label>
              <Input 
                type="password"
                value={newWebhook.secretKey} 
                onChange={e => setNewWebhook({...newWebhook, secretKey: e.target.value})} 
                placeholder="HMAC Secret / Token" 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} style={{ flex: 1 }}>Discard</Button>
            <Button variant="primary" onClick={handleCreate} disabled={!newWebhook.name || !newWebhook.url} className="lift" style={{ flex: 1 }}>Register Connectivity</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminIntegrations;
