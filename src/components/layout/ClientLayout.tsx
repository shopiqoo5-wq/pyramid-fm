import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import {
  LuLayoutDashboard,
  LuShoppingCart,
  LuHistory,
  LuLogOut,
  LuRotateCcw,
  LuFileText,
  LuBuilding,
  LuCheck,
  LuZap,
  LuRepeat,
  LuActivity,
  LuShield,
  LuTruck,
  LuSettings,
  LuLifeBuoy,
  LuUsers
} from 'react-icons/lu';
import TopBar from './TopBar';
import CommandPalette from '../CommandPalette';
import './Layout.css';

const ClientLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);
  const companies = useStore(state => state.companies);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && sidebarOpen) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userCompany = companies.find(c => c.id === currentUser?.companyId);

  React.useEffect(() => {
    if (userCompany?.branding?.primaryColor) {
      document.documentElement.style.setProperty('--primary', userCompany.branding.primaryColor);
      const color = userCompany.branding.primaryColor;
      document.documentElement.style.setProperty('--primary-hover', color + 'ee'); 
    }
    if (userCompany?.name) {
      document.title = `${userCompany.name} | Pyramid FM Portal`;
    }
    return () => {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--primary-hover');
      document.title = 'Pyramid FM Portal';
    };
  }, [userCompany]);

   interface NavItem {
     name: string;
     path: string;
     icon: React.ReactNode;
   }

   interface NavSection {
     title: string;
     items: NavItem[];
   }
 
   let sections: NavSection[] = [];
   const role = currentUser?.role;
 
   if (role === 'finance') {
     sections = [
       {
         title: 'Financials',
         items: [
           { name: 'Dashboard', path: '/portal', icon: <LuLayoutDashboard size={20} /> },
           { name: 'Invoices & Docs', path: '/portal/invoices', icon: <LuFileText size={20} /> },
           { name: 'Analytics', path: '/portal/reports', icon: <LuActivity size={20} /> }
         ]
       },
       {
         title: 'Operations',
         items: [
           { name: 'My Orders', path: '/portal/orders', icon: <LuHistory size={20} /> },
           { name: 'Returns', path: '/portal/returns', icon: <LuRotateCcw size={20} /> },
           { name: 'Support', path: '/portal/support', icon: <LuLifeBuoy size={20} /> }
         ]
       }
     ];
   } else if (role === 'client_staff') {
     sections = [
       {
         title: 'Main',
         items: [
           { name: 'Dashboard', path: '/portal', icon: <LuLayoutDashboard size={20} /> },
           { name: 'Browse Catalog', path: '/portal/catalog', icon: <LuShoppingCart size={20} /> },
           { name: 'Quick Order', path: '/portal/quick-order', icon: <LuZap size={20} /> },
           { name: 'Cart', path: '/portal/cart', icon: <LuShoppingCart size={20} /> }
         ]
       },
       {
         title: 'Duties',
         items: [
           { name: 'Biometric Attendance', path: '/portal/attendance', icon: <LuShield size={20} /> }
         ]
       },
       {
         title: 'Activity',
         items: [
           { name: 'My Orders', path: '/portal/orders', icon: <LuHistory size={20} /> },
           { name: 'Returns', path: '/portal/returns', icon: <LuRotateCcw size={20} /> },
           { name: 'Support', path: '/portal/support', icon: <LuLifeBuoy size={20} /> }
         ]
       }
     ];
   } else {
     sections = [
       {
         title: 'Core Services',
         items: [
           { name: 'Dashboard', path: '/portal', icon: <LuLayoutDashboard size={20} /> },
           { name: 'Browse Catalog', path: '/portal/catalog', icon: <LuShoppingCart size={20} /> },
           { name: 'Quick Order', path: '/portal/quick-order', icon: <LuZap size={20} /> },
           { name: 'Cart', path: '/portal/cart', icon: <LuShoppingCart size={20} /> },
           { name: 'Approvals', path: '/portal/approvals', icon: <LuCheck size={20} /> }
         ]
       },
       {
         title: 'Supply Chain',
         items: [
           { name: 'My Orders', path: '/portal/orders', icon: <LuHistory size={20} /> },
           { name: 'Order Tracking', path: '/portal/tracking', icon: <LuTruck size={20} /> },
           { name: 'Recurring Plans', path: '/portal/subscriptions', icon: <LuRepeat size={20} /> },
           { name: 'Returns', path: '/portal/returns', icon: <LuRotateCcw size={20} /> }
         ]
       },
       {
         title: 'Security & Nodes',
         items: [
           { name: 'Biometric Attendance', path: '/portal/attendance', icon: <LuShield size={20} /> },
           { name: 'Office Locations', path: '/portal/locations', icon: <LuBuilding size={20} /> },
           { name: 'Staff Management', path: '/portal/team', icon: <LuUsers size={20} /> },
           { name: 'Compliance Vault', path: '/portal/compliance-vault', icon: <LuFileText size={20} /> }
         ]
       },
       {
         title: 'Administration',
         items: [
           { name: 'Analytics', path: '/portal/reports', icon: <LuActivity size={20} /> },
           { name: 'Invoices', path: '/portal/invoices', icon: <LuFileText size={20} /> },
           { name: 'Agreements & SLAs', path: '/portal/agreements', icon: <LuFileText size={20} /> },
           { name: 'Support / Helpdesk', path: '/portal/support', icon: <LuLifeBuoy size={20} /> },
           { name: 'Settings', path: '/portal/settings', icon: <LuSettings size={20} /> }
         ]
       }
     ];
   }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="app-container">
      <div className="global-bg-nexus">
        <div className="mesh-layer" />
        <div className="mesh-layer-2" />
      </div>
      <CommandPalette />
      
      <div 
        className={`sidebar-overlay ${sidebarOpen && isMobile ? 'active' : ''}`} 
        onClick={() => setSidebarOpen(false)} 
      />
      
      <motion.aside 
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            {userCompany?.branding?.logoUrl ? (
              <img src={userCompany.branding.logoUrl} alt="Logo" style={{ width: '36px', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div className="logo-icon-sm">P</div>
            )}
            {sidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="logo-text"
              >
                {userCompany?.name || 'Pyramid FM'}
              </motion.span>
            )}
          </div>
        </div>

         <motion.nav 
           className="sidebar-nav"
           variants={containerVariants}
           initial="hidden"
           animate="visible"
         >
           {sections.map((section, idx) => (
             <div key={idx} className="sidebar-section" style={{ marginBottom: '1.5rem' }}>
               {sidebarOpen && (
                 <div style={{ padding: '0 1.5rem', marginBottom: '0.5rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', opacity: 0.6 }}>
                   {section.title}
                 </div>
               )}
               {section.items.map((item) => (
                 <motion.div key={item.path} variants={itemVariants}>
                   <NavLink
                     to={item.path}
                     end={item.path === '/portal'}
                     className={({ isActive }: { isActive: boolean }) => `nav-item ${isActive ? 'active' : ''}`}
                   >
                     <div className="nav-icon">{item.icon}</div>
                     {sidebarOpen && <span className="nav-text">{item.name}</span>}
                   </NavLink>
                 </motion.div>
               ))}
             </div>
           ))}
         </motion.nav>

        <div className="sidebar-footer">
          {sidebarOpen ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="user-profile-card"
              onClick={() => navigate('/portal/settings')}
            >
              <div className="user-avatar-sm">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-info-text">
                <span className="user-name-text">{currentUser?.name}</span>
                <span className="user-role-label">{userCompany?.name || 'Corporate'}</span>
              </div>
            </motion.div>
          ) : (
            <div className="user-avatar-sm" style={{ margin: '0 auto' }}>
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
          )}
          
          <button className="logout-button" onClick={handleLogout} title="Sign Out">
            <LuLogOut size={18} />
            {sidebarOpen && <span>Logout Session</span>}
          </button>
        </div>
      </motion.aside>

      <motion.main 
        className="main-content"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <header className="topbar glass-surface" style={{ backdropFilter: 'blur(12px)', background: 'rgba(var(--surface-rgb), 0.7)' }}>
          <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
        </header>

        <div className="content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              style={{ minHeight: '100%', paddingBottom: '2rem', width: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
};

export default ClientLayout;
