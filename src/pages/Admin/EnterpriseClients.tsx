import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { 
  LuShield, LuMapPin, LuPlus, LuTrash2, LuSearch, LuPencil, LuBuilding, LuPhone, LuActivity
} from 'react-icons/lu';
import { Card, Button, Input, Table, Badge } from '../../components/ui';
import { Modal } from '../../components/ui/Modal';
import type { Company, Location } from '../../types';

const EnterpriseClients: React.FC = () => {
  const navigate = useNavigate();
  const { 
    companies, locations, addCompany, updateCompany, deleteCompany, 
    addLocation, updateLocation, deleteLocation 
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  
  // Company Modal State
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState({ 
    name: '', gstNumber: '', pointOfContact: '', contactEmail: '', contactPhone: '', creditLimit: 100000 
  });

  // Location Modal State
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [locationForm, setLocationForm] = useState({ 
    name: '', address: '', state: '', contactPerson: '', contactPhone: '', monthlyBudget: 50000 
  });

  const filteredCompanies = companies.filter((c: Company) => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.gstNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLocations = locations.filter((l: Location) => {
    const company = companies.find(c => c.id === l.companyId);
    return l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           (company?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
  });

  const openCompanyModal = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setCompanyForm({
        name: company.name,
        gstNumber: company.gstNumber,
        pointOfContact: company.pointOfContact,
        contactEmail: company.contactEmail || '',
        contactPhone: company.contactPhone || '',
        creditLimit: company.creditLimit || 100000
      });
    } else {
      setEditingCompany(null);
      setCompanyForm({ name: '', gstNumber: '', pointOfContact: '', contactEmail: '', contactPhone: '', creditLimit: 100000 });
    }
    setIsCompanyModalOpen(true);
  };

  const openLocationModal = (companyId: string, location?: Location) => {
    setSelectedCompanyId(companyId);
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        name: location.name,
        address: location.address,
        state: location.state || '',
        contactPerson: location.contactPerson || '',
        contactPhone: location.contactPhone || '',
        monthlyBudget: location.monthlyBudget || 50000
      });
    } else {
      setEditingLocation(null);
      setLocationForm({ name: '', address: '', state: '', contactPerson: '', contactPhone: '', monthlyBudget: 50000 });
    }
    setIsLocationModalOpen(true);
  };

  const handleCompanySubmit = () => {
    if (!companyForm.name) return;
    if (editingCompany) {
      updateCompany(editingCompany.id, { ...companyForm });
    } else {
      addCompany({
        ...companyForm,
        status: 'active',
        availableCredit: companyForm.creditLimit,
        gstNumber: companyForm.gstNumber, // Explicit mapping to ensure type safety
        pointOfContact: companyForm.pointOfContact
      });
    }
    setIsCompanyModalOpen(false);
  };

  const handleLocationSubmit = () => {
    if (!locationForm.name || !selectedCompanyId) return;
    if (editingLocation) {
      updateLocation(editingLocation.id, { ...locationForm });
    } else {
      addLocation({
        ...locationForm,
        companyId: selectedCompanyId,
        currentMonthSpend: 0,
        qrStatus: 'active'
      });
    }
    setIsLocationModalOpen(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-1.5px' }}>Enterprise Entity Registry</h2>
          <p className="text-muted">Certified corporate database and site specification architecture.</p>
        </div>
        <Button variant="primary" onClick={() => openCompanyModal()} className="lift shadow-glow">
          <LuPlus size={18} /> Register Certified Entity
        </Button>
      </header>

      <Card style={{ padding: '1.25rem', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: '12px', padding: '0 1rem', border: '1px solid var(--border)' }}>
          <LuSearch size={22} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Search corporate entities, registry identifiers, or site designations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', padding: '1rem', border: 'none', background: 'transparent', 
              fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', outline: 'none'
            }}
          />
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
        {filteredCompanies.map((company: Company) => (
          <Card key={company.id} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               <div style={{ 
                 width: '64px', height: '64px', borderRadius: '18px', 
                 background: 'var(--primary-glow)', color: 'var(--primary)', 
                 display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem',
                 border: '1px solid var(--primary-light)'
               }}>
                 <LuShield />
               </div>
               <div style={{ display: 'flex', gap: '0.5rem' }}>
                 <Badge variant={company.status === 'active' ? 'success' : 'warning'} style={{ fontWeight: 900 }}>{company.status.toUpperCase()}</Badge>
                 <Button size="sm" variant="ghost" onClick={() => openCompanyModal(company)} style={{ borderRadius: '10px' }}><LuPencil size={16} /></Button>
               </div>
            </div>
            
            <div>
              <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>{company.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Registry</span>
                <span className="text-primary" style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: 'monospace' }}>{company.gstNumber}</span>
              </div>
            </div>

            <div style={{ background: 'var(--surface-hover)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                    <LuMapPin size={16} />
                    <span>{locations.filter((l: Location) => l.companyId === company.id).length} Active Sites</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-sub)' }}>
                    <LuActivity size={16} />
                    <span>₹{(company.creditLimit || 0).toLocaleString()} limit</span>
                  </div>
               </div>
               <div style={{ borderTop: '1px dotted var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                   <LuBuilding size={14} className="text-muted" />
                   <span>{company.pointOfContact}</span>
                 </div>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
               <Button variant="primary" size="sm" className="lift" style={{ flex: 1.5, fontWeight: 900 }} onClick={() => openLocationModal(company.id)}>
                 <LuPlus size={14} style={{ marginRight: '0.5rem' }} /> Add Site
               </Button>
               <Button variant="ghost" size="sm" className="lift" style={{ border: '1px solid var(--border)', fontWeight: 800 }} onClick={() => navigate(`/admin/site-matrix/${company.id}`)}>
                 <LuActivity size={14} style={{ marginRight: '0.5rem' }} /> Matrix
               </Button>
               <Button variant="secondary" size="sm" onClick={() => { if(confirm('Purge entity data from encrypted registry?')) deleteCompany(company.id); }} style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)', fontWeight: 800 }}>
                 <LuTrash2 size={16} />
               </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)', borderRadius: '24px' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
               <LuMapPin className="text-primary" size={20} /> Global Site Specifications
             </h3>
             <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Centralized auditing of all certified operational gateways.</p>
           </div>
           <Badge variant="primary" style={{ fontWeight: 900 }}>{filteredLocations.length} ENTRIES</Badge>
        </div>
        <Table 
          columns={[
            { key: 'name', header: 'SITE SPECIFICATION', render: (l: Location) => (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 900, color: 'var(--text-main)' }}>{l.name}</span>
                <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{l.address}</span>
              </div>
            )},
            { key: 'companyId', header: 'OWNER ENTITY', render: (l: Location) => (
              <Badge variant="neutral" style={{ fontWeight: 800, textTransform: 'uppercase' }}>
                {companies.find((c: Company) => c.id === l.companyId)?.name || 'ORPHANED'}
              </Badge>
            ) },
            { key: 'contact', header: 'SITE PERSONNEL', render: (l: Location) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LuBuilding size={12} className="text-muted" /> {l.contactPerson}
                </span>
                <span className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <LuPhone size={12} /> {l.contactPhone}
                </span>
              </div>
            )},
            { key: 'actions', header: '', render: (l: Location) => (
              <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                <Button size="sm" variant="ghost" onClick={() => openLocationModal(l.companyId, l)} className="lift"><LuPencil size={16} /></Button>
                <Button size="sm" variant="ghost" onClick={() => { if(confirm('Permanently decommission site?')) deleteLocation(l.id); }} style={{ color: 'var(--danger)', opacity: 0.6 }} className="lift"><LuTrash2 size={16} /></Button>
              </div>
            )}
          ]} 
          data={filteredLocations}
        />
      </Card>

      {/* Entity Modal */}
      <Modal 
        isOpen={isCompanyModalOpen} 
        onClose={() => setIsCompanyModalOpen(false)} 
        title={editingCompany ? 'Modify Enterprise Profile' : 'Register Certified Enterprise Entity'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
          <Input 
            label="CERTIFIED ENTITY NAME" 
            placeholder="e.g. Reliance Logistics Ltd."
            value={companyForm.name} 
            onChange={e => setCompanyForm({...companyForm, name: e.target.value})} 
            style={{ fontWeight: 700 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input 
              label="REGISTRY IDENTIFIER (GST/TAX)" 
              placeholder="Ex: 29AABCP1234D1Z5"
              value={companyForm.gstNumber} 
              onChange={e => setCompanyForm({...companyForm, gstNumber: e.target.value})} 
              style={{ fontWeight: 700 }}
            />
            <Input 
              label="CREDIT AUTHORIZATION (₹)" 
              type="number"
              value={companyForm.creditLimit} 
              onChange={e => setCompanyForm({...companyForm, creditLimit: Number(e.target.value)})} 
              style={{ fontWeight: 700 }}
            />
          </div>
          <Input 
            label="PRIMARY GATEWAY PERSONNEL" 
            placeholder="Name of primary contact"
            value={companyForm.pointOfContact} 
            onChange={e => setCompanyForm({...companyForm, pointOfContact: e.target.value})} 
            style={{ fontWeight: 700 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input 
              label="COMMUNICATION ENDPOINT (EMAIL)" 
              placeholder="ops@client.com"
              value={companyForm.contactEmail} 
              onChange={e => setCompanyForm({...companyForm, contactEmail: e.target.value})} 
              style={{ fontWeight: 700 }}
            />
            <Input 
              label="TELEMETRY CONTACT (PHONE)" 
              placeholder="+91 XXXXX XXXXX"
              value={companyForm.contactPhone} 
              onChange={e => setCompanyForm({...companyForm, contactPhone: e.target.value})} 
              style={{ fontWeight: 700 }}
            />
          </div>
          <Button 
            variant="primary" 
            onClick={handleCompanySubmit} 
            className="w-full btn-lg shadow-glow"
            style={{ marginTop: '1rem', height: '56px', fontWeight: 900 }}
          >
            {editingCompany ? 'Commit Enterprise Updates' : 'Authorize Global Entity'}
          </Button>
        </div>
      </Modal>

      {/* Location Modal */}
      <Modal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        title={editingLocation ? 'Reconfigure Site Specifications' : 'Codify Local Site Specification'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1rem 0' }}>
          <Input 
            label="SITE DESIGNATION NAME" 
            placeholder="e.g. Navi Mumbai Fulfillment Hub"
            value={locationForm.name} 
            onChange={e => setLocationForm({...locationForm, name: e.target.value})} 
            style={{ fontWeight: 700 }}
          />
          <Input 
            label="PHYSICAL DEPLOYMENT ADDRESS" 
            placeholder="Full geographic address"
            value={locationForm.address} 
            onChange={e => setLocationForm({...locationForm, address: e.target.value})} 
            style={{ fontWeight: 700 }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input 
              label="OPERATIONAL STATE/REGION" 
              placeholder="e.g. Maharashtra"
              value={locationForm.state} 
              onChange={e => setLocationForm({...locationForm, state: e.target.value})} 
              style={{ fontWeight: 700 }}
            />
            <Input 
              label="MONTHLY OPERATIONAL BUDGET (₹)" 
              type="number"
              value={locationForm.monthlyBudget} 
              onChange={e => setLocationForm({...locationForm, monthlyBudget: Number(e.target.value)})} 
              style={{ fontWeight: 700 }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Input 
              label="SITE COMMANDER NAME" 
              placeholder="Primary site responsible"
              value={locationForm.contactPerson} 
              onChange={e => setLocationForm({...locationForm, contactPerson: e.target.value})} 
              style={{ fontWeight: 700 }}
            />
            <Input 
              label="COMMAND LINE (PHONE)" 
              placeholder="+91 XXXXX XXXXX"
              value={locationForm.contactPhone} 
              onChange={e => setLocationForm({...locationForm, contactPhone: e.target.value})} 
              style={{ fontWeight: 700 }}
            />
          </div>
          <Button 
            variant="primary" 
            onClick={handleLocationSubmit} 
            className="w-full btn-lg shadow-glow"
            style={{ marginTop: '1rem', height: '56px', fontWeight: 900 }}
          >
            {editingLocation ? 'Synchronize Site Parameters' : 'Authorize Local Gateway'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default EnterpriseClients;
