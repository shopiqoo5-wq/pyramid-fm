import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuSearch,
  LuCommand,
  LuPackage,
  LuUser,
  LuSettings,
  LuLayoutDashboard,
  LuHistory,
  LuShield,
  LuLifeBuoy,
  LuKey,
  LuQrCode,
  LuActivity,
  LuClipboardList,
  LuTruck,
  LuFileText,
  LuBuilding
} from 'react-icons/lu';
import { useStore } from '../store';

const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();
  const { products, currentUser, companies } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) return setResults([]);

    const q = query.toLowerCase();
    const searchResults: any[] = [];

    // Navigation
    let navItems = [
      { id: 'nav-1', type: 'navigation', label: 'Dashboard', icon: <LuLayoutDashboard />, path: currentUser?.role === 'admin' ? '/admin' : '/portal' },
      { id: 'nav-2', type: 'navigation', label: 'Product Catalog', icon: <LuPackage />, path: '/portal/catalog' },
      { id: 'nav-3', type: 'navigation', label: 'Order History', icon: <LuHistory />, path: currentUser?.role === 'admin' ? '/admin/orders' : '/portal/orders' },
      { id: 'nav-4', type: 'navigation', label: 'System Settings', icon: <LuSettings />, path: currentUser?.role === 'admin' ? '/admin/settings' : '/portal/settings' },
    ];

    if (currentUser?.role === 'admin') {
      navItems = [
        ...navItems,
        { id: 'nav-adm-1', type: 'navigation', label: 'Staff Registry', icon: <LuUser />, path: '/admin/staff-registry' },
        { id: 'nav-adm-2', type: 'navigation', label: 'Platform Security', icon: <LuShield />, path: '/admin/security' },
        { id: 'nav-adm-3', type: 'navigation', label: 'Corporate Login (QR)', icon: <LuQrCode />, path: '/admin/corporate-login' },
        { id: 'nav-adm-4', type: 'navigation', label: 'Helpdesk Terminal', icon: <LuLifeBuoy />, path: '/admin/helpdesk' },
        { id: 'nav-adm-5', type: 'navigation', label: 'System Health Pulse', icon: <LuActivity />, path: '/admin/system-health' },
        { id: 'nav-adm-6', type: 'navigation', label: 'Enterprise Clients', icon: <LuBuilding />, path: '/admin/enterprise-clients' },
        { id: 'nav-adm-7', type: 'navigation', label: 'Credential Manager', icon: <LuKey />, path: '/admin/credential-manager' },
        { id: 'nav-adm-8', type: 'navigation', label: 'Biometric Matches', icon: <LuShield />, path: '/admin/biometric-matches' },
        { id: 'nav-adm-9', type: 'navigation', label: 'Attendance Report', icon: <LuClipboardList />, path: '/admin/attendance-report' },
      ];
    } else {
      navItems = [
        ...navItems,
        { id: 'nav-prt-1', type: 'navigation', label: 'Support Hub', icon: <LuLifeBuoy />, path: '/portal/support' },
        { id: 'nav-prt-2', type: 'navigation', label: 'Compliance Vault', icon: <LuFileText />, path: '/portal/compliance-vault' },
        { id: 'nav-prt-3', type: 'navigation', label: 'Biometric Attendance', icon: <LuShield />, path: '/portal/scan' },
        { id: 'nav-prt-4', type: 'navigation', label: 'Order Tracking', icon: <LuTruck />, path: '/portal/tracking' },
      ];
    }

    navItems.forEach(item => {
       if (item.label.toLowerCase().includes(q)) searchResults.push(item);
    });

    // Products
    products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .slice(0, 5)
      .forEach(p => searchResults.push({ id: p.id, type: 'product', label: p.name, subLabel: p.sku, icon: <LuPackage />, path: `/portal/catalog?q=${p.sku}` }));

    // Clients (Admin only)
    if (currentUser?.role === 'admin') {
       companies.filter(c => c.name.toLowerCase().includes(q))
         .slice(0, 3)
         .forEach(c => searchResults.push({ id: c.id, type: 'client', label: c.name, subLabel: c.contactEmail || c.gstNumber, icon: <LuUser />, path: `/admin/clients` }));
    }

    setResults(searchResults);
  }, [query, products, currentUser, companies]);

  const handleSelect = (item: any) => {
    navigate(item.path);
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ 
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
              backdropFilter: 'blur(4px)', zIndex: 9999 
            }} 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            style={{ 
              position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)',
              width: '90%', maxWidth: '640px', background: 'var(--surface)', 
              borderRadius: '20px', border: '1px solid var(--border)',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', zIndex: 10000,
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <LuSearch className="text-muted" size={20} />
              <input 
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Type a command or search..."
                style={{ 
                   flex: 1, border: 'none', background: 'transparent', 
                   padding: '1rem', outline: 'none', fontSize: '1.1rem',
                   color: 'var(--text-main)'
                }}
              />
              <div style={{ padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>ESC</div>
            </div>

            <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
              {results.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                   {results.map((item, i) => (
                     <div 
                       key={i} 
                       onClick={() => handleSelect(item)}
                       className="lift"
                       style={{ 
                          display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem',
                          borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s',
                          background: 'transparent'
                       }}
                       onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                       onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                     >
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                           {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                           <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.label}</div>
                           {item.subLabel && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.subLabel}</div>}
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.type}</div>
                     </div>
                   ))}
                </div>
              ) : query ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                   No results found for "{query}"
                </div>
              ) : (
                <div style={{ padding: '1rem' }}>
                   <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Quick Actions</div>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      {[
                        { label: 'Go to Settings', path: currentUser?.role === 'admin' ? '/admin/settings' : '/portal/settings', icon: <LuSettings /> },
                        { label: 'View Profile', path: '/portal/settings', icon: <LuUser /> },
                        { label: 'My Orders', path: '/portal/orders', icon: <LuHistory /> },
                        { label: 'Browse Catalog', path: '/portal/catalog', icon: <LuPackage /> },
                      ].map((action, i) => (
                        <div 
                          key={i}
                          onClick={() => handleSelect(action)}
                          style={{ 
                            padding: '0.75rem', borderRadius: '12px', background: 'var(--surface-hover)', 
                            border: '1px solid var(--border)', cursor: 'pointer', 
                            display: 'flex', alignItems: 'center', gap: '0.75rem' 
                          }}
                        >
                           <span style={{ color: 'var(--primary)' }}>{action.icon}</span>
                           <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{action.label}</span>
                        </div>
                      ))}
                   </div>
                </div>
              )}
            </div>

            <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid var(--border)', background: 'var(--surface-hover)', display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <kbd style={{ padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '4px', background: 'white' }}>↵</kbd>
                  <span>to select</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <kbd style={{ padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '4px', background: 'white' }}>↑↓</kbd>
                  <span>to navigate</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
                  <LuCommand size={12} />
                  <span>K to Toggle</span>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
