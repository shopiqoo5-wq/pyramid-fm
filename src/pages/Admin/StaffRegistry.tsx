import React, { useState } from 'react';
import { useStore } from '../../store';
import { 
  LuSearch, LuPlus, LuUser, 
  LuSparkles, LuRefreshCw, LuShield, LuTrash2
} from 'react-icons/lu';
import { Card, Button, Input, Table } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';

const StaffRegistry: React.FC = () => {
  const { 
    users, companies, addUser, updateUser, 
    bulkAddUsers, resetPassword, updateUserFaceImage, deleteUser 
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [biometricUrl, setBiometricUrl] = useState('');
  const [bulkData, setBulkData] = useState('');
  const [newUser, setNewUser] = useState({ 
    name: '', email: '', role: 'client_staff' as any, 
    companyId: '', username: '', password: '' 
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.companyId) return;
    addUser({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      companyId: newUser.companyId,
      phone: ''
    });
    setIsUserModalOpen(false);
    setNewUser({ name: '', email: '', role: 'client_staff', companyId: '', username: '', password: '' });
  };

  const handleBulkImport = () => {
    if (!bulkData) return;
    const rows = bulkData.split('\n').filter(r => r.trim());
    const newUsersData = rows.map(r => {
      const [name, email, role] = r.split(',').map(s => s.trim());
      return { 
        name, 
        email, 
        role: (role || 'client_staff') as any,
        companyId: companies[0]?.id || '',
        phone: ''
      };
    });
    bulkAddUsers(companies[0]?.id || '', newUsersData);
    setIsBulkModalOpen(false);
    setBulkData('');
    alert('Bulk provisioning complete.');
  };

  const handleSaveBiometrics = () => {
    if (!selectedUser || !biometricUrl) return;
    updateUserFaceImage(selectedUser.id, biometricUrl);
    setIsBiometricModalOpen(false);
    setBiometricUrl('');
    setSelectedUser(null);
  };

  const columns = [
    { 
      key: 'name', 
      header: 'Personnel Identity', 
      render: (u: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '10px', 
            background: 'var(--primary-light)', color: 'var(--primary)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontWeight: 800, fontSize: '0.9rem' 
          }}>
            {u.name.charAt(0)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{u.name}</span>
            <span className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</span>
          </div>
        </div>
      )
    },
    { 
      key: 'companyId', 
      header: 'Corporate Mapping', 
      render: (u: any) => <span style={{ fontWeight: 600 }}>{companies.find((c: any) => c.id === u.companyId)?.name}</span> 
    },
    { 
      key: 'role', 
      header: 'Access Level', 
      render: (u: any) => <span className="status-badge info" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>{u.role.toUpperCase()}</span> 
    },
    { 
      key: 'status', 
      header: 'Auth State', 
      render: (u: any) => (
        <span className={`status-badge ${u.status === 'active' ? 'success' : 'warning'}`}>
          {u.status.toUpperCase()}
        </span>
      ) 
    },
    { 
      key: 'actions', 
      header: '', 
      render: (u: any) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="ghost" onClick={() => { setSelectedUser(u); setBiometricUrl(u.faceImageUrl || ''); setIsBiometricModalOpen(true); }} className="lift" style={{ border: '1px solid var(--border)', color: u.faceImageUrl ? 'var(--success)' : 'var(--text-muted)' }}><LuSparkles size={16} /></Button>
          <Button size="sm" variant="ghost" onClick={() => { const p = resetPassword(u.id); alert(`New Access Key: ${p}\n\nPlease communicate this key securely to the user.`); }} className="lift" style={{ border: '1px solid var(--border)' }}><LuRefreshCw size={16} /></Button>
          <Button size="sm" variant="ghost" onClick={() => updateUser(u.id, { status: u.status === 'active' ? 'inactive' : 'active' })} className="lift" style={{ border: '1px solid var(--border)' }}><LuShield size={16} /></Button>
          <Button size="sm" variant="ghost" onClick={() => { if (window.confirm(`Are you sure you want to remove ${u.name} from the registry?`)) deleteUser(u.id); }} className="lift text-danger" style={{ opacity: 0.6 }}><LuTrash2 size={16} /></Button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px' }}>Staff Registry</h2>
          <p className="text-muted">High-fidelity workforce management and biometric identity enrollment.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="secondary" onClick={() => setIsBulkModalOpen(true)} className="lift">
            <LuPlus size={18} /> Bulk Onboarding
          </Button>
          <Button variant="primary" onClick={() => setIsUserModalOpen(true)} className="lift shadow-glow">
            <LuPlus size={18} /> Provision Staff
          </Button>
        </div>
      </header>

      <Card className="glass-surface" style={{ padding: '1.25rem', borderRadius: '16px' }}>
        <div className="search-box">
          <LuSearch className="search-icon" size={22} />
          <input 
            type="text" 
            placeholder="Search personnel by name, email, or corporate ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
        <Table columns={columns} data={filteredUsers} />
      </Card>

      {/* Provision Staff Modal */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title="Initialize Personnel Protocol">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Full Legal Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            <Input label="Primary Registry Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>Corporate Mapping</label>
              <select 
                className="input" 
                value={newUser.companyId} 
                onChange={e => setNewUser({...newUser, companyId: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px' }}
              >
                <option value="">Select Employer...</option>
                {companies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'block' }}>Access Tier</label>
              <select 
                className="input" 
                value={newUser.role} 
                onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px' }}
              >
                <option value="client_staff">Client Staff</option>
                <option value="facility_manager">Facility Manager</option>
                <option value="procurement_manager">Procurement Manager</option>
              </select>
            </div>
          </div>
          <Button variant="primary" onClick={handleCreateUser} className="lift" style={{ marginTop: '1rem' }}>Authorize Entry</Button>
        </div>
      </Modal>

      {/* Bulk Onboarding Modal */}
      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="Mass Registry Manifest">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <p className="text-muted" style={{ fontSize: '0.85rem' }}>Paste comma-separated personnel data: `Name, Email, Role` (one per line).</p>
          <textarea 
            style={{ 
              width: '100%', height: '200px', padding: '1.25rem', borderRadius: '16px', 
              background: 'var(--surface-hover)', border: '1px solid var(--border)', 
              color: 'var(--text-main)', fontFamily: 'monospace' 
            }}
            placeholder="John Doe, john@example.com, client_manager"
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
          />
          <Button variant="primary" onClick={handleBulkImport} className="lift">Deploy Collective Registry</Button>
        </div>
      </Modal>

      {/* Biometric Registry Modal */}
      <Modal isOpen={isBiometricModalOpen} onClose={() => setIsBiometricModalOpen(false)} title="Biometric Identity Enrollment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
          <div style={{ 
            width: '140px', height: '140px', borderRadius: '50%', background: 'var(--surface-hover)', 
            margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            overflow: 'hidden', border: '3px solid var(--primary-light)', padding: '4px'
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden' }}>
              {biometricUrl ? (
                <img src={biometricUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Biometric Ref" />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-hover)' }}>
                   <LuUser size={64} className="text-muted" style={{ opacity: 0.2 }} />
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 style={{ margin: 0, fontWeight: 900 }}>Enroll {selectedUser?.name}</h4>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Supply a high-resolution reference image for neural matching.</p>
          </div>
          <Input 
            label="Neural Reference Map (Image URL)" 
            value={biometricUrl} 
            onChange={e => setBiometricUrl(e.target.value)} 
            placeholder="https://identity.ai/v1/faces/..." 
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="ghost" onClick={() => setBiometricUrl(`https://i.pravatar.cc/300?u=${selectedUser?.id}`)} style={{ flex: 1 }}>Generate Mock</Button>
            <Button variant="primary" onClick={handleSaveBiometrics} style={{ flex: 2 }} className="lift">Register Signature</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StaffRegistry;
