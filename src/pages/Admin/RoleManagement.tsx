import React, { useState } from 'react';

import { useStore } from '../../store';
import { 
  LuPlus, LuTrash2, LuUsers, LuLock, 
  LuSettings, LuShield, LuCheck, LuInfo
} from 'react-icons/lu';
import { Card, Table, Button, Badge, Input } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import type { CustomRole } from '../../types';

interface RoleManagementProps {
  isTab?: boolean;
}

const RoleManagement: React.FC<RoleManagementProps> = ({ isTab = false }) => {
  const { customRoles, employees, addCustomRole, updateCustomRole, deleteCustomRole, addNotification, currentUser } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [newRole, setNewRole] = useState<Omit<CustomRole, 'id'>>({
    name: '',
    description: '',
    permissions: [],
    isSystem: false
  });

  const availablePermissions = [
    { id: 'inventory.view', label: 'View Inventory', category: 'Operations' },
    { id: 'inventory.manage', label: 'Manage Stock', category: 'Operations' },
    { id: 'orders.view', label: 'View Orders', category: 'Commerce' },
    { id: 'orders.approve', label: 'Approve Orders', category: 'Commerce' },
    { id: 'workforce.view', label: 'View Staff', category: 'HR' },
    { id: 'workforce.manage', label: 'Staff Onboarding', category: 'HR' },
    { id: 'attendance.view', label: 'View Attendance', category: 'HR' },
    { id: 'attendance.approve', label: 'Approve Overrides', category: 'HR' },
    { id: 'scheduling.manage', label: 'Shift Scheduling', category: 'Operations' },
    { id: 'reports.view', label: 'View Analytics', category: 'Forensics' },
    { id: 'security.manage', label: 'System Security', category: 'Governance' }
  ];

  const handleSave = async () => {
    if (!newRole.name) return;
    
    if (editingRole) {
      await updateCustomRole(editingRole.id, newRole);
      addNotification({ userId: currentUser?.id || '', title: 'Role Updated', message: `Hierarchy for ${newRole.name} synchronized.`, type: 'success' });
    } else {
      await addCustomRole(newRole);
      addNotification({ userId: currentUser?.id || '', title: 'Role Created', message: `New administrative tier ${newRole.name} initialized.`, type: 'success' });
    }
    
    setShowModal(false);
    setEditingRole(null);
    setNewRole({ name: '', description: '', permissions: [], isSystem: false });
  };

  const togglePermission = (permId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const resetForm = () => {
    setNewRole({ name: '', description: '', permissions: [], isSystem: false });
    setEditingRole(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {!isTab && (
        <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 950, letterSpacing: '-1.5px' }}>
              Role Architecture
            </h2>
            <p className="text-muted">Define organizational hierarchies and granular permission matrices for field and admin staff.</p>
          </div>
        </header>
      )}

      {/* Inline Architect Section */}
      <Card style={{ padding: '2rem', border: '1px solid var(--border)' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary)', color: 'white' }}>
               <LuPlus size={20} />
            </div>
            <div>
               <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.4rem', color: 'var(--text-main)' }}>Architect New Organizational Role</h3>
               <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-sub)', fontWeight: 500 }}>Configure designation and granular security clearance level for the personnel hierarchy.</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <Input 
                  label="ROLE DESIGNATION" 
                  placeholder="e.g. Senior Site Supervisor" 
                  value={newRole.name} 
                  onChange={e => setNewRole({...newRole, name: e.target.value})}
                  style={{ fontWeight: 600 }}
               />
               <div className="input-group">
                  <label className="input-label" style={{ fontWeight: 800, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hierarchy Description</label>
                  <textarea 
                     className="input-field"
                     style={{ height: '120px', resize: 'none', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem', fontSize: '0.95rem' }}
                     placeholder="Define operational boundaries and core responsibilities for this tier..."
                     value={newRole.description}
                     onChange={e => setNewRole({...newRole, description: e.target.value})}
                  />
               </div>
               
               <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
                  <Button variant="secondary" onClick={resetForm} style={{ flex: 1, height: '52px', fontWeight: 700 }}>Clear Workspace</Button>
                  <Button variant="primary" onClick={handleSave} disabled={!newRole.name} style={{ flex: 2, height: '52px', fontWeight: 800 }}>
                     Initialize Role Architecture
                  </Button>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <LuLock className="text-primary" size={20} />
                  <span style={{ fontWeight: 900, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-main)' }}>Permissions Matrix</span>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.75rem' }}>
                  {availablePermissions.map(perm => {
                     const isSelected = newRole.permissions.includes(perm.id);
                     return (
                        <div 
                           key={perm.id}
                           onClick={() => togglePermission(perm.id)}
                           className="lift"
                           style={{ 
                              padding: '1rem', 
                              borderRadius: '16px', 
                              background: isSelected ? 'var(--primary-glow)' : 'var(--surface)',
                              border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              transition: 'all 0.2s ease'
                           }}
                        >
                           <div style={{ 
                              width: '22px', height: '22px', borderRadius: '6px', 
                              border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, 
                              background: isSelected ? 'var(--primary)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s'
                           }}>
                              {isSelected && <LuCheck size={12} color="white" strokeWidth={3} />}
                           </div>
                           <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{perm.label}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: '2px' }}>{perm.category}</div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <Table
            columns={[
              { key: 'name', header: 'DESIGNATION', render: (role: CustomRole) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    padding: '0.6rem', borderRadius: '10px', 
                    background: role.isSystem ? 'var(--primary-light)' : 'var(--surface-hover)', 
                    color: role.isSystem ? 'var(--primary)' : 'var(--text-muted)' 
                  }}>
                    <LuShield size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, color: 'var(--text-main)' }}>{role.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>{role.description || 'No description provided.'}</div>
                  </div>
                </div>
              )},
              { key: 'permissions', header: 'PERMISSIONS', render: (role: CustomRole) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {(role.permissions || []).length > 0 ? (
                    (role.permissions || []).slice(0, 3).map(p => {
                      if (typeof p !== 'string' || !p) return null;
                      const label = p.includes('.') ? p.split('.')[1] : p;
                      return (
                        <Badge key={p} variant="neutral" style={{ fontSize: '10px', background: 'var(--surface-hover)', border: '1px solid var(--border)' }}>
                          {(label || '').toString().replace('_', ' ').toUpperCase()}
                        </Badge>
                      );
                    })
                  ) : <span className="text-muted" style={{ fontSize: '0.75rem' }}>No rights assigned</span>}
                  {(role.permissions || []).length > 3 && (
                    <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 700 }}>+{(role.permissions || []).length - 3} More</span>
                  )}
                </div>
              )},
              { key: 'staff', header: 'HEADCOUNT', render: (role: CustomRole) => {
                const count = employees.filter(e => e.role === role.name).length;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
                    <LuUsers size={14} className="text-primary" /> {count} Personnel
                  </div>
                );
              }},
              { key: 'status', header: 'TYPE', render: (role: CustomRole) => (
                <Badge variant={role.isSystem ? 'primary' : 'neutral'}>
                  {role.isSystem ? 'SYSTEM' : 'CUSTOM'}
                </Badge>
              )},
              { key: 'actions', header: '', render: (role: CustomRole) => (
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setEditingRole(role);
                    setNewRole({ ...role });
                    setShowModal(true);
                  }}>
                    <LuSettings size={16} />
                  </Button>
                  {!role.isSystem && (
                    <Button variant="ghost" size="sm" onClick={() => deleteCustomRole(role.id)} style={{ color: 'var(--danger)' }}>
                      <LuTrash2 size={16} />
                    </Button>
                  )}
                </div>
              )}
            ]}
            data={customRoles}
          />
        </Card>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingRole(null); setNewRole({ name: '', description: '', permissions: [], isSystem: false }); }}
        title={editingRole ? 'Edit Role Architecture' : 'Architect New Tier'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input 
              label="Designation Name" 
              placeholder="e.g. Regional Supervisor" 
              value={newRole.name} 
              onChange={e => setNewRole({...newRole, name: e.target.value})}
              disabled={editingRole?.isSystem}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Scope Description</label>
              <textarea 
                className="bg-surface-hover border border-border rounded-xl p-3 text-main outline-none focus:border-primary transition-all"
                rows={3}
                placeholder="Define the operational boundaries and responsibilities..."
                value={newRole.description}
                onChange={e => setNewRole({...newRole, description: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LuLock className="text-primary" size={18} />
              <h4 style={{ margin: 0, fontWeight: 900 }}>Permissions Matrix</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {availablePermissions.map(perm => {
                const isSelected = newRole.permissions.includes(perm.id);
                return (
                  <label 
                    key={perm.id} 
                    className="lift"
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '1rem', 
                      padding: '1rem', background: isSelected ? 'var(--primary-glow)' : 'var(--surface-hover)', 
                      borderRadius: '12px', border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: '20px', height: '20px', borderRadius: '6px', 
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border)'}`, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isSelected ? 'var(--primary)' : 'transparent',
                    }}>
                      {isSelected && <LuCheck size={12} color="white" strokeWidth={3} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>{perm.label}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{perm.category}</div>
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isSelected} 
                      onChange={() => togglePermission(perm.id)} 
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" style={{ flex: 2 }} onClick={handleSave} disabled={!newRole.name}>
              {editingRole ? 'Synchronize Matrix' : 'Initialize Hierarchy'}
            </Button>
          </div>
        </div>
      </Modal>

      <Card style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem', background: 'var(--info-bg)', border: '1px solid var(--info)', borderRadius: '16px' }}>
        <div style={{ padding: '0.75rem', borderRadius: '12px', background: 'white', color: 'var(--info)', boxShadow: 'var(--shadow-sm)', display: 'flex' }}>
          <LuInfo size={24} />
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 900, color: 'var(--text-main)' }}>Hierarchical Governance</h4>
          <p style={{ fontSize: '0.875rem', margin: 0, lineHeight: 1.6, color: 'var(--text-sub)', fontWeight: 500 }}>
            Custom roles allow you to tailor the platform for specific organizational needs. Once a role is created, it becomes available in the <strong>Personnel Roster</strong> for assignment. SYSTEM roles represent core platform functions and their designations cannot be modified.
          </p>
        </div>
      </Card>

      <div style={{ marginBottom: '6rem' }}></div>
    </div>
  );
};

export default RoleManagement;
