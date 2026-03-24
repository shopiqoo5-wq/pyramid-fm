import React, { useState } from 'react';
import { useStore } from '../../store';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, Button } from '../../components/ui';
import { LuMoon, LuSun, LuGlobe, LuLogOut, LuUser } from 'react-icons/lu';

const EmployeeSettings: React.FC = () => {
  const { currentUser, setLanguage, logout } = useStore();
  const { language } = useTranslation();
  const [isDark, setIsDark] = useState(() => document.documentElement.getAttribute('data-theme') === 'dark');

  const toggleTheme = () => {
    const next = isDark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pf-theme', next);
    setIsDark(!isDark);
  };

  return (
    <div className="employee-main animate-fade-in" style={{ paddingBottom: '8rem' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 950, letterSpacing: '-0.04em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Terminal <span style={{ color: 'var(--primary)' }}>Control</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>
          Manage your operative profile and interface preferences.
        </p>
      </header>

      <Card variant="glass" style={{ padding: '1.5rem', borderRadius: '28px', border: '1px solid var(--border)', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'var(--primary-glow)', color: 'white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--primary-light)' }}>
            {currentUser?.faceImageUrl ? (
               <img src={currentUser.faceImageUrl} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
               <LuUser size={28} />
            )}
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 950, color: 'var(--text-main)', margin: 0 }}>{currentUser?.name || 'Operative'}</h3>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 800, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deployment Status: Active</div>
          </div>
        </div>
      </Card>

      <Card variant="glass" style={{ padding: '2rem', borderRadius: '32px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h4 style={{ fontSize: '0.75rem', fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--primary)', margin: 0 }}>Interface Calibration</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--surface-hover)', borderRadius: '22px', border: '1px solid var(--border-strong)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <LuGlobe style={{ color: 'var(--primary)' }} size={20} />
              <span style={{ fontSize: '1rem', fontWeight: 850, color: 'var(--text-main)' }}>Global Locale</span>
           </div>
           <select 
             value={language}
             onChange={(e) => setLanguage(e.target.value as any)}
             style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontWeight: 900, outline: 'none', cursor: 'pointer', textAlign: 'right', fontSize: '1rem' }}
           >
             <option value="en">English (US)</option>
             <option value="hi">हिंदी (IN)</option>
             <option value="mr">मराठी (IN)</option>
           </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--surface-hover)', borderRadius: '22px', border: '1px solid var(--border-strong)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {isDark ? <LuMoon style={{ color: 'var(--primary)' }} size={20} /> : <LuSun style={{ color: 'var(--primary)' }} size={20} />}
              <span style={{ fontSize: '1rem', fontWeight: 850, color: 'var(--text-main)' }}>Chromatic Mode</span>
           </div>
           <button 
             onClick={toggleTheme}
             style={{ padding: '0.6rem 1.25rem', borderRadius: '14px', background: 'var(--primary)', color: 'white', fontWeight: 900, fontSize: '0.75rem', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
             className="lift shadow-glow"
           >
              {isDark ? 'Light' : 'Dark'}
           </button>
        </div>
      </Card>

      <Button variant="danger" onClick={() => logout()} className="lift btn-lg shadow-glow" style={{ width: '100%', height: '64px', borderRadius: '24px', fontSize: '1.2rem', fontWeight: 950, marginTop: '2.5rem' }}>
         <LuLogOut size={22} style={{ marginRight: '10px' }} /> TERMINATE SESSION
      </Button>

    </div>
  );
};

export default EmployeeSettings;
