import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Button, PhotoUpload } from '../../components/ui';
import { 
  LuCamera, 
  LuScanLine, 
  LuCheck, 
  LuTriangle,
  LuLogOut,
  LuLogIn,
  LuSignature,
  LuShieldCheck,
  LuZap
} from 'react-icons/lu';
import { motion, AnimatePresence } from 'framer-motion';
import type { VerificationResult, ClassificationResult } from '../../services/aiService';
import { aiService } from '../../services/aiService';
import './PortalAttendance.css';

const AttendanceTerminal: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser, locations, recordAttendance } = useStore((state: any) => state);
  
  const locationId = searchParams.get('locationId') || 'l1';
  const location = locations.find((l: any) => l.id === locationId);

  const [step, setStep] = useState<'action' | 'photo' | 'analysis' | 'result'>('action');
  const [action, setAction] = useState<'check-in' | 'check-out' | 'work_update' | null>(null);
  
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<{
    face: VerificationResult | null;
    work: ClassificationResult | null;
  }>({ face: null, work: null });
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  const handleActionSelect = (type: 'check-in' | 'check-out' | 'work_update') => {
    const validation = useStore.getState().canRecordAttendance(currentUser.id, type);
    if (!validation.canProceed) {
      setError(validation.reason || 'Action temporarily restricted.');
      return;
    }
    setError(null);
    setAction(type);
    setStep('photo');
  };

  const startAnalysis = async (url: string) => {
    setPhotoUrl(url);
    setStep('analysis');

    try {
      const [faceResult, workResult] = await Promise.all([
        aiService.verifyFace(url, currentUser?.faceImageUrl),
        aiService.classifyWork(url)
      ]);

      setAnalysis({ face: faceResult, work: workResult });
      setStep('result');
    } catch (err) {
      console.error("AI Analysis failed", err);
    }
  };

  const handleComplete = () => {
    recordAttendance({
      userId: currentUser.id,
      companyId: currentUser.companyId,
      locationId: locationId,
      actionType: action!,
      metadata: {
        faceMatchScore: analysis.face?.score || 100,
        workTag: analysis.work?.tag || 'General Duty',
        confidenceScore: analysis.work?.confidence || 100,
        imageUrl: photoUrl
      }
    });
    setStep('action');
    setAction(null);
    setPhotoUrl(null);
    setAnalysis({ face: null, work: null });
  };

  const getStatusColor = () => {
    if (!analysis.face) return 'var(--warning)';
    return analysis.face.match ? 'var(--success)' : 'var(--error)';
  };

  return (
    <div className="attendance-terminal-container">
      <div className="terminal-card">
        <div className="terminal-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                 <LuShieldCheck size={24} />
              </div>
              <div>
                 <h2 style={{ fontWeight: 900, fontSize: '1.2rem' }}>SECURITY TERMINAL</h2>
                 <p className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '1px' }}>{location?.name?.toUpperCase() || 'NODE-01'} // {new Date().toLocaleDateString()}</p>
              </div>
           </div>
           <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{currentUser?.name}</div>
              <div className="text-muted" style={{ fontSize: '0.65rem' }}>ID: {currentUser?.id?.slice(0,8).toUpperCase()}</div>
           </div>
        </div>

        <div className="terminal-body">
          <AnimatePresence mode="wait">
            {step === 'action' && (
              <motion.div key="action" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 800 }}>Initialize Operational Action</h3>
                
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--error)', textAlign: 'center' }}>
                    {error.toUpperCase()}
                  </motion.div>
                )}

                <div className="security-action-grid">
                   <div className="action-btn-premium" onClick={() => handleActionSelect('check-in')}>
                      <LuLogIn size={32} color="var(--success)" />
                      <div style={{ textAlign: 'center' }}>
                         <div style={{ fontWeight: 900 }}>CHECK-IN</div>
                         <div className="text-muted" style={{ fontSize: '0.7rem' }}>ENTER LOCATION</div>
                      </div>
                   </div>
                   <div className="action-btn-premium" onClick={() => handleActionSelect('work_update')}>
                      <LuSignature size={32} color="var(--primary)" />
                      <div style={{ textAlign: 'center' }}>
                         <div style={{ fontWeight: 900 }}>WORK UPDATE</div>
                         <div className="text-muted" style={{ fontSize: '0.7rem' }}>LOG ACTIVITY</div>
                      </div>
                   </div>
                   <div className="action-btn-premium" onClick={() => handleActionSelect('check-out')}>
                      <LuLogOut size={32} color="var(--error)" />
                      <div style={{ textAlign: 'center' }}>
                         <div style={{ fontWeight: 900 }}>CHECK-OUT</div>
                         <div className="text-muted" style={{ fontSize: '0.7rem' }}>EXIT LOCATION</div>
                      </div>
                   </div>
                </div>
              </motion.div>
            )}

            {step === 'photo' && (
              <motion.div key="photo" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="scan-box-wrapper">
                 <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontWeight: 800 }}>Biometric Capture</h3>
                    <p className="text-muted">High-fidelity photo required for verification.</p>
                 </div>
                 
                 <div className="biometric-scanner-ring scanning">
                    <LuCamera size={48} className="text-muted" />
                 </div>

                 <div style={{ width: '100%', maxWidth: '400px' }}>
                    <PhotoUpload onUpload={startAnalysis} />
                 </div>

                 <Button variant="ghost" onClick={() => setStep('action')}>RESET TERMINAL</Button>
              </motion.div>
            )}

            {step === 'analysis' && (
              <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ai-analysis-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '2rem' }}>
                 <div className="biometric-scanner-ring scanning" style={{ width: '200px', height: '200px', border: '4px dashed var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 4s linear infinite', position: 'relative' }}>
                    <div style={{ position: 'absolute', width: '100%', height: '2px', background: 'var(--primary)', top: '50%', animation: 'scan 2s ease-in-out infinite' }} />
                    <LuScanLine size={64} className="text-primary" style={{ animation: 'pulse 1.5s infinite' }} />
                 </div>
                 <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontWeight: 900, letterSpacing: '2px', color: 'var(--primary)' }}>NEURAL MATCHING...</h3>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '0.5rem' }}>
                       PROCEEDING WITH MULTI-FACTOR BIOMETRIC CROSS-REFERENCE<br/>
                       CONFIDENCE THRESHOLD SET TO 80%
                    </div>
                 </div>
                 <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3.5 }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--primary-light))' }} />
                 </div>
              </motion.div>
            )}

            {step === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="scan-box-wrapper">
                 <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: getStatusColor(), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1rem' }}>
                    {analysis.face?.match ? <LuCheck size={48} /> : <LuTriangle size={48} />}
                 </div>

                 <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontWeight: 900, color: getStatusColor() }}>
                       {analysis.face?.match ? 'AUTHENTICATION SUCCESS' : 'VERIFICATION WARNING'}
                    </h2>
                    <p className="text-muted">Payload processed for {action?.replace('_', ' ').toUpperCase()}</p>
                 </div>

                 <div className="glass-surface" style={{ width: '100%', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>BIOMETRIC MATCH SCORE</span>
                          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: getStatusColor() }}>{analysis.face?.score}%</span>
                       </div>
                       <div className="score-progress">
                          <div className="score-fill" style={{ width: `${analysis.face?.score}%`, background: getStatusColor() }} />
                       </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                       <div className="glass-surface" style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.05)' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>AI CLASSIFICATION</div>
                          <select 
                              value={analysis.work?.tag || ''} 
                              onChange={(e) => setAnalysis(prev => ({ ...prev, work: prev.work ? { ...prev.work, tag: e.target.value } : null }))}
                              style={{ background: 'transparent', border: 'none', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', width: '100%', cursor: 'pointer' }}
                           >
                              <option value="Cleaning completed">Cleaning completed</option>
                              <option value="Stock arranged">Stock arranged</option>
                              <option value="Delivery completed">Delivery completed</option>
                              <option value="Maintenance activity">Maintenance activity</option>
                              <option value="Issue detected">Issue detected</option>
                              <option value="General Duty">General Duty</option>
                           </select>
                       </div>
                       <div className="glass-surface" style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.05)' }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.25rem' }}>CONFIDENCE</div>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{analysis.work?.confidence}%</div>
                       </div>
                    </div>
                 </div>

                 <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1.5rem' }}>
                    <Button variant="ghost" style={{ flex: 1 }} onClick={handleComplete}>DONE</Button>
                    <Button variant="primary" style={{ flex: 2 }} className="btn-premium" onClick={() => { handleComplete(); navigate('/portal/dashboard'); }}>
                       <LuZap size={18} /> CONFIRM & EXIT
                    </Button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ padding: '1rem', textAlign: 'center', background: 'var(--surface-hover)', fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '2px', borderTop: '1px solid var(--border)' }}>
          PYRAMID NEURAL QUANTUM AUTHENTICATION // v2.4.0
        </div>
      </div>
    </div>
  );
};

export default AttendanceTerminal;
