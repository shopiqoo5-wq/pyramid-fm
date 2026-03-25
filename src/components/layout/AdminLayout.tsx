import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import { 
  LuLayoutDashboard, 
  LuUsers, 
  LuSettings,
  LuLogOut,
  LuShoppingCart,
  LuBriefcase,
  LuSignature,
  LuTrendingUp,
  LuWebhook,
  LuWarehouse,
  LuPackagePlus,
  LuShieldCheck,
  LuRotateCcw,
  LuPackage,
  LuBox,
  LuClipboardList,
  LuBadgeCheck,
  LuListOrdered,
  LuTag,
  LuKey,
  LuQrCode,
  LuActivity,
  LuTruck,
  LuFileText,
  LuShieldAlert,
  LuShield,
  LuMap,
  LuClock,
  LuImage,
  LuCalculator,
  LuCalendar,
  LuListTodo
} from 'react-icons/lu';
import TopBar from './TopBar';
import CommandPalette from '../CommandPalette';
import './Layout.css';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  const currentUser = useStore(state => state.currentUser);
  const logout = useStore(state => state.logout);
  const checkLowStock = useStore(state => state.checkLowStock);
  
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
    if (isMobile && sidebarOpen) {
      queueMicrotask(() => setSidebarOpen(false));
    }
  }, [location.pathname, isMobile, sidebarOpen]);

  useEffect(() => {
    if (currentUser?.role === 'admin') checkLowStock();
  }, [currentUser?.role, checkLowStock]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  interface NavSection {
    title: string;
    items: { name: string; path: string; icon: React.ReactNode }[];
  }

  const sections: NavSection[] = [
    {
      title: 'Command Center',
      items: [
        { name: 'Dashboard',        path: '/admin',            icon: <LuLayoutDashboard size={20} /> },
        { name: 'Ops Command',      path: '/admin/ops-command', icon: <LuMap size={20} className="text-primary" /> },
        { name: 'Analytics',        path: '/admin/analytics',  icon: <LuTrendingUp size={20} /> },
        { name: 'Pulse (Health)',   path: '/admin/system-health', icon: <LuActivity size={20} /> },
        { name: 'Operations Audit', path: '/admin/ops-audit',  icon: <LuClipboardList size={20} /> }
      ]
    },
    {
      title: 'Supply Chain',
      items: [
        { name: 'Fulfillment',      path: '/admin/orders',             icon: <LuShoppingCart size={20} /> },
        { name: 'Returns',          path: '/admin/returns',            icon: <LuRotateCcw size={20} /> },
        { name: 'Master Catalog',   path: '/admin/products',           icon: <LuPackage size={20} /> },
        { name: 'Product Kits',     path: '/admin/bundles',            icon: <LuPackagePlus size={20} /> },
        { name: 'Inventory Logs',   path: '/admin/inventory',          icon: <LuWarehouse size={20} /> },
        { name: 'Stock Control',    path: '/admin/inventory-control',  icon: <LuBox size={20} /> }
      ]
    },
    {
      title: 'Corporate CRM',
      items: [
        { name: 'Clients',          path: '/admin/clients',         icon: <LuUsers size={20} /> },
        { name: 'Finance',          path: '/admin/finance',         icon: <LuBriefcase size={20} /> },
        { name: 'Invoices',         path: '/admin/invoices',        icon: <LuFileText size={20} /> },
        { name: 'Contracts',        path: '/admin/contracts',       icon: <LuSignature size={20} /> },
        { name: 'Pricing Tiers',    path: '/admin/pricing-tiers',   icon: <LuTag size={20} /> },
        { name: 'Custom SKU Pricing', path: '/admin/custom-pricing', icon: <LuSettings size={20} /> }
      ]
    },
    {
      title: 'Operations Workforce',
      items: [
        { name: 'Personnel Roster',   path: '/admin/workforce/roster',   icon: <LuUsers size={20} /> },
        { name: 'Global Shift Roster', path: '/admin/workforce/scheduling', icon: <LuCalendar size={20} /> },
        { name: 'Activity Timeline',  path: '/admin/workforce/activity',   icon: <LuClock size={20} /> },
        { name: 'Work Evidence QA',   path: '/admin/workforce/reports',    icon: <LuImage size={20} /> },
        { name: 'Task Assignments',   path: '/admin/workforce/assignments', icon: <LuListTodo size={20} /> },
        { name: 'Role Architecture',  path: '/admin/workforce/roles',       icon: <LuShieldCheck size={20} /> },
        { name: 'Site QR Codes',      path: '/admin/workforce/qr-gen',      icon: <LuQrCode size={20} /> },
        { name: 'Leave & Absences',   path: '/admin/workforce/leave',      icon: <LuCalendar size={20} /> }
      ]
    },
    {
      title: 'Logistics & Infrastructure',
      items: [
        { name: 'Control Matrix',      path: '/admin/logistics',          icon: <LuTruck size={20} /> },
        { name: 'Enterprise Entities', path: '/admin/enterprise-clients', icon: <LuShield size={20} /> },
        { name: 'System Terminal',     path: '/admin/helpdesk',           icon: <LuTag size={20} /> }
      ]
    },
    {
      title: 'Forensics & Payroll',
      items: [
        { name: 'Biometric Matches',  path: '/admin/workforce/biometrics', icon: <LuShieldCheck size={20} /> },
        { name: 'Timesheet Overrides', path: '/admin/workforce/timesheets',        icon: <LuClock size={20} /> },
        { name: 'Payroll Processing', path: '/admin/payroll',           icon: <LuCalculator size={20} /> },
        { name: 'Forensic Reports',   path: '/admin/attendance-report', icon: <LuClipboardList size={20} /> }
      ]
    },
    {
      title: 'Security',
      items: [
        { name: 'Platform Security',  path: '/admin/security',           icon: <LuShieldAlert size={20} /> },
        { name: 'Corporate Login',    path: '/admin/corporate-login',    icon: <LuQrCode size={20} /> },
        { name: 'Credential Manager', path: '/admin/credential-manager', icon: <LuKey size={20} /> },
        { name: 'Integrations',       path: '/admin/webhooks',            icon: <LuWebhook size={20} /> },
        { name: 'Platform Audit',     path: '/admin/ops-audit',           icon: <LuListOrdered size={20} /> }
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Compliance',       path: '/admin/compliance', icon: <LuBadgeCheck size={20} /> },
        { name: 'System Settings',  path: '/admin/settings',   icon: <LuSettings size={20} /> }
      ]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
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
            <div className="logo-icon-sm">P</div>
            {sidebarOpen && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="logo-text">
                Pyramid FM Admin
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
                <div style={{
                  padding: '0 1.5rem', marginBottom: '0.5rem', fontSize: '0.65rem',
                  fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px',
                  color: 'var(--text-muted)', opacity: 0.6
                }}>
                  {section.title}
                </div>
              )}
              {section.items.map(item => (
                <motion.div key={item.path} variants={itemVariants}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/admin'}
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
            >
              <div className="user-avatar-sm">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="user-info-text">
                <span className="user-name-text">{currentUser?.name}</span>
                <span className="user-role-label">Administrator</span>
              </div>
            </motion.div>
          ) : (
            <div className="user-avatar-sm" style={{ margin: '0 auto' }}>
              {currentUser?.name?.charAt(0) || 'A'}
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
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
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

export default AdminLayout;
