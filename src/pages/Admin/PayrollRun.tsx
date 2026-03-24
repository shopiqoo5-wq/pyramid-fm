import React, { useState } from 'react';
import { useStore } from '../../store';
import { Card, Badge, Button } from '../../components/ui';
import { 
  LuCalculator, LuDownload, LuFileText, 
  LuCalendar, LuCheck,
  LuBanknote, LuUsers
} from 'react-icons/lu';

// Default Daily Rates based on standard roles
const DAILY_RATES: Record<string, number> = {
  'Supervisor': 1200,
  'Delivery Staff': 800,
  'Stock Handler': 700,
  'Cleaner': 500,
};

const PayrollRun: React.FC = () => {
  const employees = useStore(state => state.employees);
  const attendanceRecords = useStore(state => state.attendanceRecords);
  
  const [reportPeriod, setReportPeriod] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);

  // Filter records by selected month/period
  const periodRecords = attendanceRecords.filter(r => r.checkIn.startsWith(reportPeriod));

  const payrollData = employees.map(emp => {
    const empRecords = periodRecords.filter(r => r.employeeId === emp.id);
    
    let presentDays = 0;
    let halfDays = 0;
    let lateDays = 0;
    let absentDays = 0;
    let anomalousPunches = 0;

    empRecords.forEach(r => {
      if (r.status === 'present') presentDays++;
      else if (r.status === 'half-day') halfDays++;
      else if (r.status === 'late') lateDays++;
      else if (r.status === 'absent') absentDays++;

      if (!r.geofenceVerified && !r.verified) anomalousPunches++;
    });

    const dailyRate = DAILY_RATES[emp.role as string] || 600; // default 600
    
    // Logic:
    // Present/Late = 1 day pay
    // Half-Day = 0.5 day pay
    // Absent = 0
    const totalPayableDays = presentDays + lateDays + (halfDays * 0.5);
    const grossEarnings = totalPayableDays * dailyRate;

    return {
      ...emp,
      dailyRate,
      presentDays,
      halfDays,
      lateDays,
      absentDays,
      anomalousPunches,
      totalPayableDays,
      grossEarnings,
      empRecords
    };
  }).filter(data => data.totalPayableDays > 0 || data.empRecords.length > 0);

  const totalPayout = payrollData.reduce((acc, curr) => acc + curr.grossEarnings, 0);

  const handleGenerate = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsGenerated(true);
    }, 1500);
  };

  const handleDownloadCSV = () => {
    if (!isGenerated) return;
    
    // Create CSV content
    const headers = ['Operative ID', 'Name', 'Role', 'Daily Rate', 'Total Payable Days', 'Gross Earnings'];
    const rows = payrollData.map(d => [
      d.id,
      d.name,
      d.role,
      d.dailyRate,
      d.totalPayableDays,
      d.grossEarnings
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll_matrix_${reportPeriod}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-container animate-fade-in" style={{ padding: '2rem' }}>
       <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <Badge variant="success" style={{ marginBottom: '1rem' }}>FINANCE & OPERATIONS</Badge>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            Payroll Run Matrix
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Synthesize verified field logs into automated compensation ledgers.</p>
        </div>
      </header>

      {/* Control Strip */}
      <Card style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', background: 'var(--surface)', border: '1px solid var(--border)' }}>
         <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-hover)', borderRadius: '0.75rem', padding: '0.25rem' }}>
            <span style={{ padding: '0 1rem', color: 'var(--text-muted)', fontWeight: 800, fontSize: '0.8rem' }}>
              <LuCalendar size={16} style={{ marginRight: '0.5rem', marginBottom: '-2px' }}/> Reporting Period
            </span>
            <input 
              type="month" 
              value={reportPeriod} 
              onChange={(e) => {
                setReportPeriod(e.target.value);
                setIsGenerated(false); // Reset synthesis on date change
              }} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', padding: '0.75rem', fontFamily: 'inherit', fontWeight: 700 }}
            />
         </div>

         <div style={{ flex: 1 }} />

         <Button 
           variant="primary" 
           disabled={isProcessing}
           onClick={handleGenerate}
           style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: isGenerated ? 'var(--surface-hover)' : 'var(--primary)', color: isGenerated ? 'var(--primary)' : '#fff' }}
         >
           {isProcessing ? (
             <>Processing Matrix...</>
           ) : isGenerated ? (
             <><LuCheck size={18} style={{ marginRight: '0.5rem' }} /> Matrix Generated</>
           ) : (
             <><LuCalculator size={18} style={{ marginRight: '0.5rem' }} /> Synthesize Payroll</>
           )}
         </Button>
         
         {isGenerated && (
           <Button 
             variant="ghost" 
             onClick={handleDownloadCSV}
             style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', background: 'var(--success)', color: '#000', fontWeight: 800 }}
           >
             <LuDownload size={18} style={{ marginRight: '0.5rem' }} /> Export Ledger (CSV)
           </Button>
         )}
      </Card>

      {/* Financial Overview Cards */}
      {isGenerated && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <Card style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--primary)' }}>
                <LuBanknote size={24} />
              </div>
              <div>
                 <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Net Gross Payout</span>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>₹{totalPayout.toLocaleString('en-IN')}</h2>
              </div>
            </div>
          </Card>
          <Card style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--info-light)', color: 'var(--info)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--info)' }}>
                <LuUsers size={24} />
              </div>
              <div>
                 <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Active Operatives</span>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>{payrollData.length}</h2>
              </div>
            </div>
          </Card>
          <Card style={{ padding: '1.5rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--warning-glow)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--warning)' }}>
                <LuFileText size={24} />
              </div>
              <div>
                 <span style={{ fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Analyzed Logs</span>
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>{periodRecords.length}</h2>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Roster Data Table */}
      <Card style={{ padding: 0, overflow: 'hidden', opacity: isGenerated ? 1 : 0.4, pointerEvents: isGenerated ? 'auto' : 'none', transition: 'all 0.4s ease', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Operative Details</th>
              <th style={{ textAlign: 'center' }}>Validated Shifts</th>
              <th style={{ textAlign: 'center' }}>Role Bracket</th>
              <th style={{ textAlign: 'center' }}>Anomalies</th>
              <th style={{ textAlign: 'right' }}>Calculated Net</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                  <div style={{ 
                    width: '64px', height: '64px', borderRadius: '50%', background: 'var(--surface-hover)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
                  }}>
                    <LuCalculator size={32} style={{ opacity: 0.3, color: 'var(--text-muted)' }} />
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Ledger Empty</h3>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>No attendance logs were synced for this temporal window.</p>
                </td>
              </tr>
            )}
            
            {payrollData.map(emp => (
              <tr key={emp.id} className="hover:bg-surface-hover/50 transition-colors">
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      <span>{emp.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{emp.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-sub)' }}>ID: {emp.id.split('-').shift()?.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <Badge variant="success" style={{ padding: '0.2rem 0.6rem', fontSize: '0.65rem', border: '1px solid var(--success)', background: 'transparent' }}>{emp.presentDays}P</Badge>
                    <Badge variant="warning" style={{ padding: '0.2rem 0.6rem', fontSize: '0.65rem', border: '1px solid var(--warning)', background: 'transparent' }}>{emp.lateDays}L</Badge>
                    <Badge variant="info" style={{ padding: '0.2rem 0.6rem', fontSize: '0.65rem', border: '1px solid var(--info)', background: 'transparent' }}>{emp.halfDays}H</Badge>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 800 }}>
                    <span style={{ color: 'var(--text-main)' }}>{emp.totalPayableDays}</span> Total Payable
                  </div>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontWeight: 800, color: 'var(--text-main)' }}>{emp.role}</span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-sub)' }}>₹{emp.dailyRate}/day</span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  {emp.anomalousPunches > 0 ? (
                    <Badge variant="danger" style={{ background: 'transparent', border: '1px solid var(--danger)' }}>{emp.anomalousPunches} Warnings</Badge>
                  ) : (
                    <Badge variant="neutral" style={{ background: 'transparent', border: '1px solid var(--border)' }}>Clear</Badge>
                  )}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 900, color: 'var(--success)', fontSize: '1.15rem' }}>
                  ₹{emp.grossEarnings.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default PayrollRun;
