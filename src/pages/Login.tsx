import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store';
import { 
  LuShield, 
  LuQrCode, 
  LuInfo,
  LuChevronRight,
  LuChevronLeft,
  LuMail,
  LuMapPin,
  LuPhone,
  LuGlobe,
  LuSend,
  LuUsers
} from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Button, ScannerOverlay } from '../components/ui';
import './Login.css';

const Login: React.FC = () => {
  const [step, setStep] = useState(1); // 1: Corp, 2: Personnel
  const [companyIdentifier, setCompanyIdentifier] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const login = useStore((state) => state.login);
  const currentUser = useStore((state) => state.currentUser);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const loginWithQR = useStore((state) => state.loginWithQR);
  const [authError, setAuthError] = useState<string | null>(null);

  // If already logged in, redirect
  useEffect(() => {
    if (currentUser && !searchParams.get('qr')) {
      if (currentUser.role === 'admin') {
        navigate('/admin');
      } else if (currentUser.role === 'employee') {
        navigate('/employee/dashboard');
      } else {
        navigate('/portal');
      }
    }
  }, [currentUser, navigate, searchParams]);

  // Handle QR token from URL and Autofill Params
  useEffect(() => {
    const qrToken = searchParams.get('qr');
    const autoCompany = searchParams.get('company');
    const autoUser = searchParams.get('user');
    const isAuto = searchParams.get('auto') === 'true';

    if (qrToken) {
      // Use microtask to avoid reacting state changes synchronously in render
      queueMicrotask(() => setIsSubmitting(true));
      loginWithQR(qrToken).then(success => {
        setIsSubmitting(false);
        if (!success) setAuthError('Invalid or expired QR login token.');
      });
    }

    if (isAuto && autoCompany && step === 1) {
      queueMicrotask(() => {
        setCompanyIdentifier(autoCompany);
        if (autoUser) setIdentifier(autoUser);
        setStep(2);
      });
    }
  }, [searchParams, loginWithQR, step]); 


  const handleNextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (companyIdentifier.trim()) {
      setStep(2);
      setAuthError(null);
    } else {
      setAuthError('Please enter your Corporate Identity.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const success = await login(companyIdentifier, identifier, password);
    setIsSubmitting(false);
    
    if (!success) {
      setAuthError('Personnel authentication failed. Verify credentials.');
    }
  };

  const handleQRScanSuccess = (data: string) => {
    setIsScanning(false);
    setIsSubmitting(true);
    
    // Resolve token: Handle full URLs containing ?qr= or raw tokens
    let resolvedToken = data;
    try {
      if (data.includes('?qr=')) {
        const url = new URL(data);
        const urlToken = url.searchParams.get('qr');
        if (urlToken) resolvedToken = urlToken;
      }
    } catch {
      // data is not a valid URL or parsing failed, assume it is raw token
    }

    loginWithQR(resolvedToken).then(success => {
      if (!success) {
        setAuthError('Identity verification failed.');
        setIsSubmitting(false);
      }
    });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setIsSubscribing(true);
    setTimeout(() => {
      setIsSubscribing(false);
      setNewsletterEmail('');
      alert('Subscription successful! Welcome to the Pulse.');
    }, 1000);
  };

  return (
    <div className="login-immersive-wrapper">
      <div className="global-bg-nexus">
        <div className="mesh-layer" />
        <div className="mesh-layer-2" />
      </div>

      <motion.div 
        className="login-card-premium"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="login-header-immersive">
          <div className="login-brand-logo">
            <LuShield size={36} color="white" />
          </div>
          <h1>Pyramid FMS</h1>
          <p>
            {step === 1 ? 'Identify your organization to proceed' : `Accessing ${companyIdentifier.toUpperCase()} hub`}
          </p>
        </div>

        <div className="auth-step-container">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.form
                key="step1"
                onSubmit={handleNextStep}
                className="login-form-immersive"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  label="Corporate Identity"
                  type="text"
                  placeholder="Organization ID"
                  value={companyIdentifier}
                  onChange={(e) => setCompanyIdentifier(e.target.value)}
                  autoFocus
                />
                
                {authError && (
                  <div className="status-badge danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                    <LuInfo size={14} /> {authError}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="login-submit-btn"
                  style={{ width: '100%' }}
                >
                  Continue to Access <LuChevronRight size={18} />
                </Button>

                <div style={{ margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.3 }} />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Or</span>
                  <div style={{ flex: 1, height: '1px', background: 'var(--border)', opacity: 0.3 }} />
                </div>

                <button 
                  type="button" 
                  onClick={() => { setCompanyIdentifier('PYRAMID'); setStep(2); }}
                  className="btn-glass"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.875rem', borderRadius: 'var(--radius-md)', fontWeight: 600, color: 'var(--primary)' }}
                >
                  <LuUsers size={18} /> Field Workforce Access
                </button>

                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button type="button" onClick={() => setIsScanning(true)} className="qr-scan-btn-premium" style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
                    <LuQrCode size={16} /> Instant QR Authenticate
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                onSubmit={handleLogin}
                className="login-form-immersive"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="step-back-btn" onClick={() => setStep(1)}>
                  <LuChevronLeft size={16} /> Modify Identity
                </div>

                <Input
                  label="Personnel Login"
                  type="text"
                  placeholder="Username or Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoFocus
                />

                <Input
                  label="Security Access Key"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {authError && (
                  <div className="status-badge danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem' }}>
                    <LuInfo size={14} /> {authError}
                  </div>
                )}

                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  className="login-submit-btn"
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'Verifying...' : 'Authorize Terminal Access'}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="login-info-side-container">
        <div className="login-info-grid">
          <div className="info-block">
            <h3><LuGlobe /> Global Headquarters</h3>
            <p>
              Strategic command center for Pyramid Facility Management Services. 
              Empowering enterprise logistics with neural-precision control.
            </p>
            <div className="info-contact-list">
              <div className="contact-item"><LuMapPin size={14} /> 123 Enterprise Way, Mumbai, MH 400001</div>
              <div className="contact-item"><LuPhone size={14} /> +91 22 4567 8900</div>
            </div>
          </div>
          <div className="info-block">
            <h3><LuMail /> System Support</h3>
            <p>
              24/7 technical surveillance and hospitality logistics desk. 
              Connect with our system architects for escalated assistance.
            </p>
            <div className="info-contact-list">
              <div className="contact-item"><LuMail size={14} /> support@pyramidfms.com</div>
              <div className="contact-item">Hardware-backed encryption active.</div>
            </div>
          </div>
        </div>

        <div className="info-block login-newsletter-block">
          <div className="newsletter-title">
            <LuSend size={18} /> Join the Corporate Pulse
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Get real-time insights into facility optimization and system updates.
          </p>
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <input 
              type="email" 
              className="newsletter-input" 
              placeholder="Corporate email..." 
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
            />
            <button type="submit" className="newsletter-btn" disabled={isSubscribing}>
              {isSubscribing ? '...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </div>

      <ScannerOverlay 
        isOpen={isScanning} 
        onClose={() => setIsScanning(false)}
        onScanSuccess={handleQRScanSuccess}
        title="Identity Scan"
        subtitle="Align your facility badge to authenticate"
      />
    </div>
  );
};

export default Login;
