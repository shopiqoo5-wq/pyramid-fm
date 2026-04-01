import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useStore } from '../store';
import { LuShieldCheck, LuLoader } from 'react-icons/lu';

const PunchRedirect: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { currentUser, employees } = useStore();

    const token = searchParams.get('t');
    const locationId = searchParams.get('l');

    useEffect(() => {
        if (!token || !locationId) {
             navigate('/', { replace: true });
             return;
        }

        if (!currentUser) {
            // Not logged in: Redirect to login with the full punch path as redirect parameter
            const redirectUrl = encodeURIComponent(`/punch?t=${token}&l=${locationId}`);
            navigate(`/login?redirect=${redirectUrl}`, { replace: true });
            return;
        }

        const employee = employees.find(e => e.userId === currentUser.id);
        if (!employee) {
            // Logged in but not an employee: Go to home page
            navigate('/', { replace: true });
            return;
        }

        // Logged in as employee: Go to dashboard and pass the token/id
        navigate(`/employee/dashboard?punch_token=${token}&location_id=${locationId}`, { replace: true });

    }, [currentUser, employees, token, locationId, navigate]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--text-main)' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 2.5rem' }}>
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: 0 }}>
                       <LuShieldCheck size={100} style={{ color: 'var(--primary)', opacity: 0.2 }} />
                    </motion.div>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <LuLoader size={48} className="animate-spin text-primary" />
                    </div>
                </div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 950, letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>Site Authenticating</h1>
                <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1.1rem' }}>Synchronizing your presence with the Digital Nexus...</p>
            </div>
        </div>
    );
};

export default PunchRedirect;
