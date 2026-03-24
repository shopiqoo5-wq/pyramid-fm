import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { LuLogOut, LuUser, LuClock, LuHistory, LuShieldCheck, LuCalendarPlus } from 'react-icons/lu';
import { Badge } from '../ui';
import { useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import '../../pages/Employee/Employee.css';

const EmployeeLayout: React.FC = () => {
  const { currentUser, logout, employees, companies, locations } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [showProfile, setShowProfile] = React.useState(false);

  // Get employee details
  const employee = employees.find((e: any) => e.userId === currentUser?.id);
  const company = companies.find((c: any) => c.id === employee?.companyId);
  const siteLocation = locations.find((l: any) => l.id === employee?.locationId);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!currentUser || currentUser.role !== 'employee') {
    navigate('/login');
    return null;
  }

  return (
    <div className="employee-app-container">
      {/* Dynamic Top Bar for Employee */}
      <header className="employee-header">
        <div className="brand-pill">
          <div className="brand-icon-sm" style={{ boxShadow: '0 8px 16px rgba(249, 115, 22, 0.4)' }}>P</div>
          <span className="brand-text-sm" style={{ fontSize: '1.25rem', fontWeight: 950 }}>Operations <span style={{ color: 'var(--primary)', opacity: 0.8 }}>Center</span></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', opacity: 0.6 }}>
            <span style={{ fontSize: '0.6rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Workforce Portal</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-main)' }}>{currentUser.name}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="icon-btn-premium sm danger"
            title="Logout"
            style={{ borderRadius: '14px', width: '40px', height: '40px' }}
          >
            <LuLogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="employee-main">
        <Outlet />
      </main>

      {/* Profile Overlay */}
      <AnimatePresence>
        {showProfile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="scanner-overlay-immersive"
            style={{ padding: '2rem' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                <div style={{ width: '92px', height: '92px', borderRadius: '36px', background: 'linear-gradient(135deg, var(--primary), var(--primary-h))', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 950, color: '#fff', boxShadow: '0 20px 40px var(--primary-glow)', border: '1px solid var(--border)' }}>
                  {currentUser.name.charAt(0)}
                </div>
                <h2 style={{ fontSize: '2.25rem', fontWeight: 950, marginBottom: '0.25rem', letterSpacing: '-0.04em', color: 'var(--text-main)' }}>{currentUser.name}</h2>
                <Badge variant="primary" style={{ padding: '0.4rem 1.25rem', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.1)', color: 'var(--primary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.7rem' }}>
                  {employee?.role || 'Staff Member'}
                </Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '28px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 950, opacity: 0.4, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.1em', color: 'var(--text-main)' }}>Operating Department</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>{company?.name || 'Pyramid Operations Center'}</span>
                </div>

                <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '28px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 950, opacity: 0.4, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.1em', color: 'var(--text-main)' }}>Deployed Facility</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--primary)' }}>{siteLocation?.name || 'Assigned Site'}</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '0.4rem' }}>{siteLocation?.address || 'Verified Operational Area'}</p>
                </div>

                <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '28px', border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 950, opacity: 0.4, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem', letterSpacing: '0.1em', color: 'var(--text-main)' }}>Service Credential</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-sub)', background: 'var(--bg-color)', padding: '0.4rem 1rem', borderRadius: '12px', display: 'inline-block' }}> {employee?.id.toUpperCase().slice(0, 12)}... </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowProfile(false)}
              className="btn-primary"
              style={{ width: '100%', height: '64px', borderRadius: '24px', fontWeight: 950, fontSize: '1.2rem', background: 'var(--primary)', boxShadow: '0 15px 35px var(--primary-glow)', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              Return to Operations
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Tab Bar for Mobile */}
      <nav className="mobile-bottom-nav" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
        <button 
          onClick={() => { setShowProfile(false); navigate('/employee/dashboard'); }}
          className={`nav-tab-field ${!showProfile && location.pathname === '/employee/dashboard' ? 'active' : ''}`}
        >
          <LuClock size={20} />
          <span style={{ fontSize: '10px' }}>{t('nav.dashboard')}</span>
        </button>
        <button 
          onClick={() => { setShowProfile(false); navigate('/employee/history'); }}
          className={`nav-tab-field ${!showProfile && location.pathname === '/employee/history' ? 'active' : ''}`}
        >
          <LuHistory size={20} />
          <span style={{ fontSize: '10px' }}>{t('nav.history')}</span>
        </button>
        <button 
          onClick={() => { setShowProfile(false); navigate('/employee/protocols'); }}
          className={`nav-tab-field ${!showProfile && location.pathname === '/employee/protocols' ? 'active' : ''}`}
        >
          <LuShieldCheck size={20} />
          <span style={{ fontSize: '10px' }}>{t('nav.protocols')}</span>
        </button>
        <button 
          onClick={() => { setShowProfile(false); navigate('/employee/time-off'); }}
          className={`nav-tab-field ${!showProfile && location.pathname === '/employee/time-off' ? 'active' : ''}`}
        >
          <LuCalendarPlus size={20} />
          <span style={{ fontSize: '10px' }}>{t('nav.timeOff')}</span>
        </button>
        <button 
          onClick={() => { setShowProfile(false); navigate('/employee/settings'); }}
          className={`nav-tab-field ${!showProfile && location.pathname === '/employee/settings' ? 'active' : ''}`}
        >
          <LuUser size={20} />
          <span style={{ fontSize: '10px' }}>{t('nav.settings')}</span>
        </button>
      </nav>
    </div>
  );
};

export default EmployeeLayout;
