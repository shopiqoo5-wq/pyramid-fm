import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { 
  LuSearch, 
  LuPlus, 
  LuPen, 
  LuTrash2, 
  LuCheck, 
  LuQrCode,
  LuBanknote,
  LuUsers,
  LuSettings2,
  LuBadgeCheck,
  LuMessageSquare,
  LuTimer,
  LuShieldAlert,
  LuDna,
  LuMapPin
} from 'react-icons/lu';
import { Card, Button, Input, Table, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';

const AdminClients: React.FC = () => {
  const navigate = useNavigate();
  const companies = useStore(state => state.companies);
  const users = useStore(state => state.users);
  const addCompany = useStore(state => state.addCompany);
  const updateCompany = useStore(state => state.updateCompany);
  const deleteCompany = useStore(state => state.deleteCompany);
  const addUser = useStore(state => state.addUser);
  const products = useStore(state => state.products);
  const clientPricing = useStore(state => state.clientPricing);
  const setClientPrice = useStore(state => state.setClientPrice);
  const settings = useStore(state => state.settings);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isIntelModalOpen, setIsIntelModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'clients' | 'registry'>('clients');
  
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [editingClient, setEditingClient] = useState<any>(null);
  
  // Custom Pricing Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // User Generation State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole] = useState<'client_staff' | 'client_manager' | 'procurement_manager'>('client_staff');
  const [generatedCredentials, setGeneratedCredentials] = useState<{email: string, pass: string} | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const [newClient, setNewClient] = useState({
    name: '', gstNumber: '', pointOfContact: '', pocEmail: '', creditLimit: 0
  });

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return <Badge variant="success">ACTIVE</Badge>;
      case 'onboarding': return <Badge variant="warning">ONBOARDING</Badge>;
      case 'suspended': return <Badge variant="danger">SUSPENDED</Badge>;
      default: return <Badge variant="neutral">{status?.toUpperCase() || 'UNKNOWN'}</Badge>;
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = () => {
    if (!newClient.name || !newClient.gstNumber) return alert('Name and GST Number are required.');
    addCompany({
      name: newClient.name,
      gstNumber: newClient.gstNumber,
      pointOfContact: newClient.pointOfContact,
      creditLimit: newClient.creditLimit,
      availableCredit: newClient.creditLimit,
      status: 'active'
    });
    setIsAddModalOpen(false);
    setNewClient({ name: '', gstNumber: '', pointOfContact: '', pocEmail: '', creditLimit: 0 });
  };

  const handleOpenEdit = (company: any) => {
    setEditingClient({ ...company });
    setIsEditModalOpen(true);
  };

  const handleUpdateClient = () => {
    if (!editingClient.name || !editingClient.gstNumber) return alert('Name and GST Number are required.');
    updateCompany(editingClient.id, {
      name: editingClient.name,
      gstNumber: editingClient.gstNumber,
      pointOfContact: editingClient.pointOfContact,
      creditLimit: editingClient.creditLimit,
      availableCredit: editingClient.availableCredit
    });
    setIsEditModalOpen(false);
    setEditingClient(null);
  };

  const handleDeleteClient = () => {
    if (editingClient && window.confirm(`Are you sure you want to completely remove ${editingClient.name}? This action cannot be undone.`)) {
      deleteCompany(editingClient.id);
      setIsEditModalOpen(false);
      setEditingClient(null);
    }
  };

  const handleOpenUsers = (company: any) => {
    setSelectedCompany(company);
    setIsUsersModalOpen(true);
  };

  const handleOpenPricing = (company: any) => {
    setSelectedCompany(company);
    setIsPricingModalOpen(true);
  };

  const handleOpenIntel = (company: any) => {
    setSelectedCompany(company);
    setIsIntelModalOpen(true);
  };

  const handleUpdatePricing = () => {
    if (selectedCompany) {
      updateCompany(selectedCompany.id, {
        pricingTier: selectedCompany.pricingTier,
        discountMultiplier: selectedCompany.discountMultiplier
      });
      setIsPricingModalOpen(false);
      setSelectedCompany(null);
    }
  };

  const handleOpenQR = (company: any) => {
    setSelectedCompany(company);
    setIsQRModalOpen(true);
  };

  const handleAddCustomPrice = () => {
    if (selectedCompany && selectedProductId && customPrice) {
      setClientPrice(selectedCompany.id, selectedProductId, Number(customPrice));
      setSelectedProductId('');
      setCustomPrice('');
    }
  };

  const handleGenerateCredentials = () => {
    if (!selectedCompany || !newUserName || !newUserEmail) return alert('Name and Email are required.');
    const securePassword = 'PyramidFM24!';
    addUser({
      name: newUserName,
      email: newUserEmail.toLowerCase(),
      role: newUserRole,
      companyId: selectedCompany.id,
      phone: ''
    });
    setGeneratedCredentials({
      email: newUserEmail.toLowerCase(),
      pass: securePassword
    });
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleCopyCredentials = () => {
    if (generatedCredentials) {
      const text = `Pyramid FM Portal Credentials\nLogin URL: https://portal.pyramidfm.com/login\nEmail: ${generatedCredentials.email}\nPassword: ${generatedCredentials.pass}`;
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    }
  };

  const companyCustomPrices = selectedCompany 
    ? clientPricing.filter(p => p.companyId === selectedCompany.id)
    : [];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Clients & Accounts</h2>
          <p className="text-muted">Managed corporate CRM for service level agreements, custom pricing, and user roles.</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="lift">
          <LuPlus size={18} /> Onboard New Client
        </Button>
      </div>

      <div className="glass-surface" style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <button 
          className={`tab-btn-premium ${activeView === 'clients' ? 'active' : ''}`} 
          onClick={() => setActiveView('clients')}
          style={{ flex: 1 }}
        >
          <LuUsers size={18} /> CLIENT DIRECTORY
        </button>
        <button 
          className={`tab-btn-premium ${activeView === 'registry' ? 'active' : ''}`} 
          onClick={() => setActiveView('registry')}
          style={{ flex: 1 }}
        >
          <LuMessageSquare size={18} /> USER ACTIVITY HUB
        </button>
      </div>

      {/* Filter Bar */}
      <Card className="glass-surface" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <LuSearch className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder={activeView === 'clients' ? "Search accounts by name or GSTIN..." : "Search personnel by name or email..."} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeView === 'registry' && (
            <Badge variant="info" style={{ padding: '0.8rem 1.25rem', borderRadius: '12px' }}>
              TOTAL ENROLLED: {users.length}
            </Badge>
          )}
        </div>
      </Card>

      {/* Conditional Content */}
      {activeView === 'clients' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '1.5rem' }}>
          <AnimatePresence>
            {filteredCompanies.map((company, idx) => {
              const clientUsers = users.filter(u => u.companyId === company.id);
              const utilization = Math.round(((company.creditLimit || 0) - (company.availableCredit || 0)) / (company.creditLimit || 1) * 100);
              return (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="glass-surface lift" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
                    {utilization > 80 && (
                      <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--danger)', color: 'white', fontSize: '0.6rem', fontWeight: 900, padding: '2px 10px', borderRadius: '0 0 0 8px', letterSpacing: '1px' }}>
                        CREDIT ALERT
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                          {company.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{company.name}</h3>
                            {getStatusBadge(company.status)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            <LuBadgeCheck size={14} className="text-success" /> Verified Client
                          </div>
                        </div>
                      </div>
                      <button 
                        className="icon-btn-premium sm primary" 
                        onClick={() => navigate(`/admin/site-matrix/${company.id}`)} 
                        title="Site Matrix"
                        style={{ background: 'var(--secondary)', color: 'white' }}
                      >
                        <LuMapPin size={18} />
                      </button>
                      <button 
                        className="icon-btn-premium sm primary" 
                        onClick={() => handleOpenIntel(company)} 
                        title="Client Intel"
                      >
                        <LuDna size={18} />
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--surface-hover)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                      <div>
                        <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Account POC</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{company.pointOfContact}</div>
                      </div>
                      <div onClick={() => handleOpenUsers(company)} style={{ cursor: 'pointer' }}>
                        <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Personnel</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {clientUsers.length} <LuUsers size={14} />
                        </div>
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.4rem', color: 'var(--text-muted)' }}>
                           <span>Credit Absorption</span>
                           <span style={{ fontWeight: 800, color: utilization > 80 ? 'var(--danger)' : 'var(--text-main)' }}>{utilization}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, utilization)}%` }}
                            style={{ height: '100%', background: utilization > 80 ? 'var(--danger)' : 'var(--primary)', boxShadow: '0 0 8px var(--primary-light)' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: 'auto' }}>
                      <button 
                        className="icon-btn-premium sm" 
                        onClick={() => handleOpenEdit(company)}
                        style={{ borderRadius: '10px', height: '36px', gap: '0.4rem', width: 'auto' }}
                      >
                        <LuPen size={14} /> <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>Profile</span>
                      </button>
                      <button 
                        className="icon-btn-premium sm" 
                        onClick={() => handleOpenPricing(company)}
                        style={{ borderRadius: '10px', height: '36px', gap: '0.4rem', width: 'auto' }}
                      >
                        <LuBanknote size={14} /> <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>Pricing</span>
                      </button>
                      <button 
                        className="icon-btn-premium sm" 
                        onClick={() => handleOpenQR(company)}
                        style={{ borderRadius: '10px', height: '36px', gap: '0.4rem', width: 'auto' }}
                      >
                        <LuQrCode size={14} /> <span style={{ fontSize: '0.7rem', fontWeight: 800 }}>Login</span>
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="glass-surface" style={{ padding: '1.5rem', borderRadius: '24px' }}>
          <Table 
            columns={[
              { 
                key: 'name', 
                header: 'Personnel Name', 
                render: (u: any) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700 }}>{u.name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>{u.email}</div>
                    </div>
                  </div>
                )
              },
              { 
                key: 'company', 
                header: 'Company / Organization', 
                render: (u: any) => {
                  const company = companies.find(c => c.id === u.companyId);
                  return (
                    <div>
                       <div style={{ fontWeight: 600 }}>{company?.name || 'System Admin'}</div>
                       <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{company?.companyCode || '—'}</div>
                    </div>
                  );
                }
              },
              { 
                key: 'role', 
                header: 'Authorization Level', 
                render: (u: any) => <Badge variant={u.role.includes('manager') ? 'info' : 'neutral'}>{u.role.replace('_', ' ').toUpperCase()}</Badge> 
              },
              { 
                key: 'activity', 
                header: 'Last Authentication', 
                render: (u: any) => (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: u.status === 'active' ? 'var(--success)' : 'var(--text-muted)' }}>
                    <LuTimer size={14} />
                    <span style={{ fontSize: '0.85rem' }}>{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never Recorded'}</span>
                  </div>
                )
              },
              {
                key: 'actions',
                header: '',
                render: (u: any) => (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="icon-btn-premium sm" onClick={() => { setSelectedCompany(companies.find(c => c.id === u.companyId)); setIsUsersModalOpen(true); }}><LuSettings2 size={14} /></button>
                  </div>
                )
              }
            ]}
            data={users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))}
          />
        </Card>
      )}

      {/* Modals */}
      
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Onboard New Corporate Client">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input label="Company Full Name" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} placeholder="e.g. Acme Tech Solutions" />
          <Input label="Registered GST Number" value={newClient.gstNumber} onChange={e => setNewClient({...newClient, gstNumber: e.target.value})} placeholder="22AAAAA0000A1Z5" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Point of Contact" value={newClient.pointOfContact} onChange={e => setNewClient({...newClient, pointOfContact: e.target.value})} placeholder="Full name" />
            <Input label="POC Work Email" type="email" value={newClient.pocEmail} onChange={e => setNewClient({...newClient, pocEmail: e.target.value})} placeholder="email@company.com" />
          </div>
          <Input label="Allocated Credit Limit (₹)" type="number" value={newClient.creditLimit} onChange={e => setNewClient({...newClient, creditLimit: Number(e.target.value)})} />
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateClient} style={{ flex: 1 }}>Dispatch Enrollment</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Client Profile">
        {editingClient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input label="Company Name" value={editingClient.name} onChange={e => setEditingClient({...editingClient, name: e.target.value})} />
            <Input label="GST Number" value={editingClient.gstNumber} onChange={e => setEditingClient({...editingClient, gstNumber: e.target.value})} />
            <Input label="Point of Contact" value={editingClient.pointOfContact} onChange={e => setEditingClient({...editingClient, pointOfContact: e.target.value})} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Credit Limit (₹)" type="number" value={editingClient.creditLimit || 0} onChange={e => setEditingClient({...editingClient, creditLimit: Number(e.target.value)})} />
              <Input label="Available Credit (₹)" type="number" value={editingClient.availableCredit || 0} onChange={e => setEditingClient({...editingClient, availableCredit: Number(e.target.value)})} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <Button variant="ghost" onClick={handleDeleteClient} style={{ color: 'var(--danger)', padding: 0 }}>
                <LuTrash2 size={16} /> Delete Account
              </Button>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Discard</Button>
                <Button variant="primary" onClick={handleUpdateClient}>Save Changes</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {selectedCompany && (
        <Modal isOpen={isIntelModalOpen} onClose={() => setIsIntelModalOpen(false)} title={`Account Intel — ${selectedCompany.name}`} className="modal-glass">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Debt Aging */}
              <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><LuShieldAlert color="var(--danger)" /> Financial Health (Debt Aging)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  {[
                    { label: 'Current', val: '₹' + Math.round((selectedCompany.creditLimit - selectedCompany.availableCredit) * 0.7).toLocaleString(), color: 'var(--success)' },
                    { label: '1-15 Days', val: '₹' + Math.round((selectedCompany.creditLimit - selectedCompany.availableCredit) * 0.2).toLocaleString(), color: 'var(--warning)' },
                    { label: '16-30 Days', val: '₹0', color: 'var(--danger)' },
                    { label: '30+ Days', val: '₹0', color: 'var(--danger-glow)' }
                  ].map(bucket => (
                    <div key={bucket.label} style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border)' }}>
                      <div className="text-muted" style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase' }}>{bucket.label}</div>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: bucket.color }}>{bucket.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Communication Log */}
              <div>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.6rem' }}><LuMessageSquare color="var(--primary)" /> Interaction Intel</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '16px' }}>
                     <div style={{ background: 'var(--primary)', width: '4px', borderRadius: '2px' }} />
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                           <strong style={{ fontSize: '0.85rem' }}>Contractual Expansion Discussion</strong>
                           <span className="text-muted" style={{ fontSize: '0.7rem' }}>Mar 18, 2024</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Client requested additional facilities onboarding in Pune region. SLA for pricing delivery set for EOD Wednesday.</p>
                     </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', background: 'var(--surface-hover)', padding: '1.25rem', borderRadius: '16px' }}>
                     <div style={{ background: 'var(--warning)', width: '4px', borderRadius: '2px' }} />
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                           <strong style={{ fontSize: '0.85rem' }}>Payment Delay Investigation</strong>
                           <span className="text-muted" style={{ fontSize: '0.7rem' }}>Mar 12, 2024</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Discussed credit limit spike. Client pointed to internal ERP migration. Temporary waiver granted.</p>
                     </div>
                  </div>
                  <Button variant="secondary" style={{ borderStyle: 'dashed', borderRadius: '12px' }}>
                    <LuPlus size={16} /> Add Strategy Note
                  </Button>
                </div>
              </div>

              <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '18px', border: '1px solid var(--primary-border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <LuTimer size={32} color="var(--primary)" />
                 <div>
                    <h5 style={{ margin: 0, fontWeight: 800 }}>Strategic Relation Timeline</h5>
                    <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem' }}>Onboarded 14 months ago. Platinum tier eligibility in 2 months based on volume.</p>
                 </div>
              </div>
            </div>
        </Modal>
      )}

      {selectedCompany && (
        <Modal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} title={`Contract Pricing: ${selectedCompany.name}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'var(--primary-light)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--primary-border)' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><LuSettings2 size={18} /> Tier & Baseline</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Primary Tier</label>
                  <select 
                    className="input"
                    value={selectedCompany.pricingTier || 'standard'} 
                    onChange={(e) => setSelectedCompany({ ...selectedCompany, pricingTier: e.target.value })}
                    style={{ background: 'var(--surface)', color: 'var(--text-main)', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', width: '100%' }}
                  >
                    {Object.entries(settings.pricingTiers).map(([name, discount]) => (
                      <option key={name} value={name}>
                        {name.charAt(0).toUpperCase() + name.slice(1)} ({discount.global}% Off)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Disc. Multiplier</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={selectedCompany.discountMultiplier || ''} 
                    onChange={(e) => setSelectedCompany({ ...selectedCompany, discountMultiplier: parseFloat(e.target.value) || undefined })} 
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 1rem 0' }}>Negotiated SKU Rates</h4>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <select className="input" style={{ flex: 1 }} value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                  <option value="">Choose item...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (₹{p.basePrice})</option>)}
                </select>
                <Input type="number" placeholder="Fixed ₹" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} style={{ width: '120px' }} />
                <Button variant="primary" onClick={handleAddCustomPrice} disabled={!selectedProductId || !customPrice}><LuPlus /></Button>
              </div>

              {companyCustomPrices.length > 0 && (
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <Table 
                    columns={[
                      { key: 'name', header: 'Product', render: (cp: any) => products.find(p => p.id === cp.productId)?.name },
                      { key: 'rate', header: 'Contract Rate', render: (cp: any) => <strong className="text-primary">₹{cp.negotiatedPrice}</strong> },
                      { key: 'del', header: '', render: () => <Button variant="ghost" size="sm" style={{ color: 'var(--danger)' }}><LuTrash2 size={14} /></Button> }
                    ]}
                    data={companyCustomPrices}
                  />
                </div>
              )}
            </div>

            <Button variant="primary" onClick={handleUpdatePricing} className="lift" style={{ width: '100%' }}>Finalize Contract Pricing</Button>
          </div>
        </Modal>
      )}

      {selectedCompany && (
        <Modal isOpen={isUsersModalOpen} onClose={() => { setIsUsersModalOpen(false); setGeneratedCredentials(null); }} title={`Users: ${selectedCompany.name}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
              <Table 
                columns={[
                  { key: 'name', header: 'Personnel', render: (u: any) => <span style={{ fontWeight: 600 }}>{u.name}</span> },
                  { key: 'role', header: 'Access', render: (u: any) => <Badge variant="info" style={{ fontSize: '0.7rem' }}>{u.role.split('_')[1] || u.role}</Badge> },
                  { 
                    key: 'face', 
                    header: 'Biometric ID', 
                    render: (u: any) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {u.faceImageUrl ? (
                          <div style={{ position: 'relative' }}>
                            <img src={u.faceImageUrl} alt="Face" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--primary)' }} />
                            <div style={{ position: 'absolute', bottom: -2, right: -2, width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', border: '1px solid white' }} />
                          </div>
                        ) : (
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <LuUsers size={12} className="text-muted" />
                          </div>
                        )}
                        <Button variant="ghost" size="sm" style={{ padding: '2px 4px', fontSize: '0.6rem' }} onClick={() => {
                          const url = prompt('Enter Face ID Image URL (Simulated Upload):', u.faceImageUrl || '');
                          if (url) useStore.getState().updateUserFaceImage(u.id, url);
                        }}>
                          {u.faceImageUrl ? 'Update' : 'Register'}
                        </Button>
                      </div>
                    )
                  },
                  { key: 'email', header: 'ID' }
                ]}
                data={users.filter(u => u.companyId === selectedCompany.id)}
              />
            </div>

            <Card style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h4 style={{ margin: 0 }}>Provision New Account</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input label="Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                <Input label="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
              </div>
              <Button variant="primary" onClick={handleGenerateCredentials} disabled={!newUserName || !newUserEmail}>Issue Credentials</Button>
            </Card>

            {generatedCredentials && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--success-bg)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--success)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--success)', marginBottom: '0.5rem' }}>Login Issued</div>
                    <div style={{ fontSize: '0.9rem' }}>Pass: <code>{generatedCredentials.pass}</code></div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleCopyCredentials}>{isCopied ? 'Copied!' : 'Copy Info'}</Button>
                </div>
              </motion.div>
            )}
          </div>
        </Modal>
      )}

      {selectedCompany && (
        <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} title="Facility Login Badge">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '1rem' }}>
            <div className="glass-surface" style={{ padding: '2.5rem', borderRadius: '24px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>{selectedCompany.name}</h3>
              <Badge variant="info" style={{ marginBottom: '2rem', padding: '0.5rem 1rem' }}>MASTER ACCESS TOKEN</Badge>
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', display: 'inline-block' }}>
                {(() => {
                  const masterUser = users.find(u => u.companyId === selectedCompany.id && (u.role === 'client_manager' || u.role === 'procurement_manager'));
                  const loginUrl = `${window.location.origin}/login?company=${selectedCompany.companyCode || selectedCompany.id}&user=${masterUser?.email || ''}&auto=true`;
                  return <QRCodeSVG value={loginUrl} size={200} />;
                })()}
              </div>
              <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '2rem' }}>Scan to autofill master credentials</p>
            </div>
            <Button variant="primary" onClick={() => window.print()} className="lift"><LuCheck /> Print Access Badge</Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminClients;
