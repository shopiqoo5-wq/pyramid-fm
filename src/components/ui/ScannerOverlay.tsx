import React, { useState, useEffect } from 'react';
import { LuX, LuScanFace } from 'react-icons/lu';
import { Button } from './index';

interface ScannerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  scanDurationMs?: number;
  title?: string;
  subtitle?: string;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  scanDurationMs = 2500,
  title = "Scan QR Code",
  subtitle = "Align the QR code within the frame to scan"
}) => {
  const [scanning, setScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let timer: any;
    let initTimer: any;
    
    if (isOpen) {
      initTimer = setTimeout(() => {
        setScanning(true);
        setSuccess(false);
      }, 0);

      // Simulate a scan taking `scanDurationMs` time
      timer = setTimeout(() => {
        setScanning(false);
        setSuccess(true);
        
        // Wait just a moment to show the success state before calling back
        setTimeout(() => {
          onScanSuccess('demo-qr-token-123'); // In real app, this would be the actual decoded value
        }, 800);
      }, scanDurationMs);
    }
    
    return () => {
      clearTimeout(initTimer);
      clearTimeout(timer);
    };
  }, [isOpen, scanDurationMs, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      padding: '2rem'
    }}>
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
        <button 
          onClick={onClose}
          style={{ 
            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', 
            width: '40px', height: '40px', borderRadius: '50%', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <LuX size={24} />
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '3rem', zIndex: 10 }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem', fontWeight: 600 }}>{title}</h2>
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>
      </div>

      <div style={{
        position: 'relative',
        width: '280px',
        height: '280px',
        marginBottom: '3rem',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: success ? '0 0 0 4px #10b981' : '0 0 0 2px rgba(255,255,255,0.2)',
        transition: 'all 0.3s ease'
      }}>
        {/* Mock Camera Feed Background */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.5) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {success ? (
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: '#10b981', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'scaleIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          ) : (
             <LuScanFace size={64} color="rgba(255,255,255,0.2)" />
          )}
        </div>

        {/* Scanning Animation Line */}
        {scanning && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: '3px',
            background: '#3b82f6',
            boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.5)',
            animation: 'scanPattern 2s linear infinite'
          }} />
        )}
        
        {/* Frame Corners */}
        {!success && (
          <>
            <div style={{ position: 'absolute', top: '10px', left: '10px', width: '30px', height: '30px', borderTop: '3px solid white', borderLeft: '3px solid white', borderRadius: '4px 0 0 0' }} />
            <div style={{ position: 'absolute', top: '10px', right: '10px', width: '30px', height: '30px', borderTop: '3px solid white', borderRight: '3px solid white', borderRadius: '0 4px 0 0' }} />
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '30px', height: '30px', borderBottom: '3px solid white', borderLeft: '3px solid white', borderRadius: '0 0 0 4px' }} />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '30px', height: '30px', borderBottom: '3px solid white', borderRight: '3px solid white', borderRadius: '0 0 4px 0' }} />
          </>
        )}
      </div>

      <div style={{ zIndex: 10 }}>
        <Button variant="ghost" onClick={onClose} style={{ border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
          Cancel Scan
        </Button>
      </div>

      <style>{`
        @keyframes scanPattern {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(280px); opacity: 0; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
