import React, { useState } from 'react';
import { useStore } from '../../store';
import { motion } from 'framer-motion';
import { 
  LuUsers, LuUserPlus, LuMapPin, 
  LuSearch, LuCheck, LuX,
  LuLayoutGrid, LuList, LuArrowRight, LuShieldCheck
} from 'react-icons/lu';
import { Button, Input, Modal, Badge, Card } from '../../components/ui';
import './TeamManagement.css';

const TeamManagement: React.FC = () => {
  const { users, currentUser, locations, inviteCorporateUser, updateUser } = useStore();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const [inviteData, setInviteData] = useState({
    name: '',
    email: '',
    role: 'client_staff' as any,
    locationId: ''
  });

  const myTeam = users.filter(u => u.companyId === currentUser?.companyId);
  const myLocations = locations.filter(l => l.companyId === currentUser?.companyId);

  const filteredTeam = myTeam.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInvite = async () => {
    if (!inviteData.name || !inviteData.email) return;
    await inviteCorporateUser(currentUser!.companyId!, inviteData);
    setIsInviteModalOpen(false);
    setInviteData({ name: '', email: '', role: 'client_staff', locationId: '' });
  };

  const toggleUserStatus = (userId: string, currentStatus: string) => {
    updateUser(userId, { status: currentStatus === 'active' ? 'inactive' : 'active' });
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'client_manager': return <LuShieldCheck size={14} />;
      case 'procurement_manager': return <LuLayoutGrid size={14} />;
      default: return <LuUsers size={14} />;
    }
  };

  return (
    <div className="team-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div className="icon-box-premium sm">
              <LuUsers size={20} />
            </div>
            <Badge variant="info" style={{ borderRadius: '6px', fontWeight: 900, fontSize: '0.65rem' }}>ENTERPRISE UNIT</Badge>
          </div>
          <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Personnel Governance</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>Manage organizational access, site assignments, and procurement authority.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div className="search-wrap-premium" style={{ width: '300px' }}>
              <LuSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search teammates..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
           <Button variant="primary" onClick={() => setIsInviteModalOpen(true)} className="lift" style={{ height: '48px', padding: '0 1.5rem', borderRadius: '14px' }}>
             <LuUserPlus size={18} /> Provision User
           </Button>
        </div>
      </div>

      <div className="team-header-stats">
        {[
          { label: 'Total Workforce', value: myTeam.length, icon: LuUsers, color: 'var(--primary)' },
          { label: 'Active Sessions', value: myTeam.filter(u => u.status === 'active').length, icon: LuCheck, color: 'var(--success)' },
          { label: 'Deactivated', value: myTeam.filter(u => u.status === 'inactive').length, icon: LuX, color: 'var(--danger)' },
          { label: 'Assigned Sites', value: myLocations.length, icon: LuMapPin, color: 'var(--info)' }
        ].map((stat, i) => (
          <div key={i} className="team-stat-card lift-sm">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="team-stat-label">{stat.label}</span>
              <stat.icon size={18} style={{ color: stat.color, opacity: 0.6 }} />
            </div>
            <div className="team-stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      <Card className="user-inventory-card" style={{ padding: 0 }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-hover)' }}>
           <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>Teammate Directory</span>
           <div className="toggle-group-premium">
              <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><LuList size={16} /></button>
              <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><LuLayoutGrid size={16} /></button>
           </div>
        </div>

        <div className="user-list">
          {filteredTeam.map((member, idx) => {
            const memberLocation = locations.find(l => l.id === member.locationId);
            return (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="user-row-premium"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '48px 1.5fr 1fr 1fr 1fr 100px', 
                  alignItems: 'center', 
                  padding: '1.25rem 1.5rem',
                  borderBottom: idx === filteredTeam.length - 1 ? 'none' : '1px solid var(--border)'
                }}
              >
                <div className="user-avatar-placeholder">
                  {member.name.charAt(0)}
                </div>
                <div>
                   <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{member.name}</div>
                   <div className="text-muted" style={{ fontSize: '0.75rem' }}>{member.email}</div>
                </div>
                <div>
                   <span className={`role-tag ${member.role.split('_')[1] || 'staff'}`}>
                     {getRoleIcon(member.role)}
                     {member.role.replace('_', ' ')}
                   </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <LuMapPin size={14} className="text-muted" />
                   <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{memberLocation?.name || 'Global Access'}</span>
                </div>
                <div>
                   <Badge variant={member.status === 'active' ? 'success' : 'danger'}>
                     {member.status === 'active' ? 'Authorized' : 'Suspended'}
                   </Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                   <button className="icon-btn-premium sm" onClick={() => toggleUserStatus(member.id, member.status)}>
                     <LuLayoutGrid size={16} />
                   </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <Modal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
        title="Provision Organizational Access"
      >
        <div className="invite-form">
          <div className="access-control-preview">
            <div style={{ fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <LuShieldCheck size={16} color="var(--primary)" /> Security Intelligence
            </div>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>
              New users will receive a cryptographic enrollment link via email. 
              Default passwords are generated using 256-bit entropy.
            </p>
          </div>

          <Input 
            label="Full Legal Name" 
            placeholder="e.g. Rahul Sharma" 
            value={inviteData.name}
            onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
          />
          <Input 
            label="Corporate Email Address" 
            placeholder="r.sharma@company.com" 
            value={inviteData.email}
            onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="label">Access Role</label>
              <select 
                className="select-premium"
                value={inviteData.role}
                onChange={(e) => setInviteData({...inviteData, role: e.target.value})}
              >
                <option value="client_staff">Standard Staff</option>
                <option value="procurement_manager">Procurement Manager</option>
                <option value="client_manager">System Manager</option>
              </select>
            </div>
            <div className="form-group">
              <label className="label">Site Restriction</label>
              <select 
                className="select-premium"
                value={inviteData.locationId}
                onChange={(e) => setInviteData({...inviteData, locationId: e.target.value})}
              >
                <option value="">Full Portfolio Access</option>
                {myLocations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Button 
              variant="primary" 
              onClick={handleInvite} 
              style={{ width: '100%', height: '52px', borderRadius: '16px', fontWeight: 800 }}
            >
              Verify & Issue Invitation <LuArrowRight size={18} style={{ marginLeft: '0.5rem' }} />
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamManagement;
