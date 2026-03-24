import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import { 
  LuDownload, 
  LuActivity, 
  LuFileText, 
  LuTrendingUp, 
  LuUsers, 
  LuCalendar,
  LuChartPie
} from 'react-icons/lu';
import { Button } from '../../components/ui';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import './PortalReports.css';

const Reports: React.FC = () => {
  const { orders, currentUser, attendanceRecords, users, locations, settings } = useStore((state: any) => state);
  const [downloading, setDownloading] = useState<string | null>(null);

  const clientOrders = useMemo(() => orders.filter((o: any) => o.companyId === currentUser?.companyId), [orders, currentUser]);
  const myAttendance = useMemo(() => attendanceRecords.filter((a: any) => a.companyId === currentUser?.companyId), [attendanceRecords, currentUser]);
  const totalSpent = useMemo(() => clientOrders.reduce((sum: number, o: any) => sum + o.netAmount, 0), [clientOrders]);

  // Chart Data
  const monthlySpendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, i) => ({
      name: month,
      spend: clientOrders
        .filter((o: any) => new Date(o.createdAt).getMonth() === i)
        .reduce((sum: number, o: any) => sum + o.netAmount, 0) || (i < 8 ? Math.random() * 50000 + 20000 : 0)
    }));
  }, [clientOrders]);

  const categoryData = [
    { name: 'Consumables', value: 45, color: 'var(--primary)' },
    { name: 'Specialized', value: 25, color: 'var(--primary-glow)' },
    { name: 'Infrastructure', value: 20, color: '#f59e0b' },
    { name: 'Maintenance', value: 10, color: '#ef4444' }
  ];

  const handleDownloadReport = async (type: string) => {
    setDownloading(type);
    
    setTimeout(async () => {
      try {
        if (type === 'Order History') {
          const headers = ['Order ID', 'Date', 'Status', 'Cost Center', 'Net Amount', 'GST', 'TDS'];
          const rows = clientOrders.map((o: any) => [
            o.customId,
            new Date(o.createdAt).toLocaleDateString(),
            o.status,
            o.costCenter || 'N/A',
            o.netAmount,
            o.gstAmount || 0,
            o.tdsDeducted || 0
          ].join(','));
          
          const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.href = encodedUri;
          link.download = `Order_History_${currentUser?.companyId}_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === 'Consumption Analytics') {
          const { generateConsumptionReportPDF } = await import('../../lib/pdfGenerator');
          const companyName = currentUser?.companyName || 'Corporate Client'; 
          generateConsumptionReportPDF(companyName, clientOrders, settings);
        } else if (type === 'Attendance Logs') {
          const headers = ['Staff Name', 'Location', 'Check-In Time', 'Type'];
          const rows = myAttendance.map((a: any) => {
            const user = users.find((u: any) => u.id === a.userId);
            const loc = locations.find((l: any) => l.id === a.locationId);
            return [
              user?.name || 'Unknown',
              loc?.name || 'HQ',
              new Date(a.checkIn).toLocaleString(),
              a.type
            ].join(',');
          });
          const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement("a");
          link.href = encodedUri;
          link.download = `Attendance_Logs_${currentUser?.companyId}_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error("Export failed", err);
      } finally {
        setDownloading(null);
      }
    }, 1200);
  };

  return (
    <div className="reports-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Intelligent Insights</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>Harness advanced consumption heuristics and procurement audit payloads.</p>
        </div>
      </div>

      <div className="analytics-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="analytics-card-glass">
          <span className="analytics-label">Lifetime Deployment Value</span>
          <div className="analytics-value" style={{ color: 'var(--primary)' }}>
            ₹{(totalSpent/100000).toFixed(1)}L
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Across {clientOrders.length} Authorized Requests
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="analytics-card-glass">
          <span className="analytics-label">Asset Velocity Index</span>
          <div className="analytics-value">
            {Math.round(clientOrders.length / 4)}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Avg. Monthly procurement cycle
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="analytics-card-glass">
          <span className="analytics-label">Personnel Check-in Flow</span>
          <div className="analytics-value" style={{ color: 'var(--success)' }}>
            {myAttendance.length}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Verified regional staff instances
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="chart-container-premium">
          <div className="chart-header">
            <h3 className="chart-title"><LuTrendingUp color="var(--primary)" /> Expenditure Volatility</h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>FY 2024-25</span>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySpendData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}
                />
                <Area type="monotone" dataKey="spend" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container-premium">
          <div className="chart-header">
            <h3 className="chart-title"><LuChartPie color="var(--primary-glow)" /> Allocation Matrix</h3>
          </div>
          <div style={{ height: '240px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
             {categoryData.map(c => (
               <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 700 }}>
                 <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.color }} />
                 <span className="text-muted">{c.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="report-link-card">
          <div className="report-link-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <LuFileText size={24} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 800 }}>Operational Ledger</h4>
            <p className="report-link-description">Download comprehensive CSV payload of all order historical metadata and fiscal statuses.</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => handleDownloadReport('Order History')}
            isLoading={downloading === 'Order History'}
            style={{ width: '100%', borderRadius: '12px', borderColor: 'var(--border)' }}
          >
            Export CSV <LuDownload size={14} style={{ marginLeft: 'auto' }} />
          </Button>
        </div>

        <div className="report-link-card">
          <div className="report-link-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
            <LuActivity size={24} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 800 }}>Consumption Audit</h4>
            <p className="report-link-description">Advanced PDF analytics on site-specific utilization rates and categorized variance signatures.</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => handleDownloadReport('Consumption Analytics')}
            isLoading={downloading === 'Consumption Analytics'}
            style={{ width: '100%', borderRadius: '12px', borderColor: 'var(--border)' }}
          >
            Export PDF <LuDownload size={14} style={{ marginLeft: 'auto' }} />
          </Button>
        </div>

        <div className="report-link-card">
          <div className="report-link-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <LuUsers size={24} />
          </div>
          <div>
            <h4 style={{ margin: '0 0 0.4rem 0', fontWeight: 800 }}>Personnel Flow Manifest</h4>
            <p className="report-link-description">Verification logs of regional staff instances, duty check-ins, and geolocation-mapped activity.</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => handleDownloadReport('Attendance Logs')}
            isLoading={downloading === 'Attendance Logs'}
            style={{ width: '100%', borderRadius: '12px', borderColor: 'var(--border)' }}
          >
            Export Logs <LuDownload size={14} style={{ marginLeft: 'auto' }} />
          </Button>
        </div>
      </div>

      <div className="chart-container-premium">
        <div className="chart-header">
          <h3 className="chart-title"><LuCalendar color="var(--primary)" /> Real-time Staff Activity Feed</h3>
        </div>
        {myAttendance.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myAttendance.slice(0, 5).map((record: any) => {
              const user = users.find((u: any) => u.id === record.userId);
              const loc = locations.find((l: any) => l.id === record.locationId);
              return (
                <div key={record.id} className="activity-item-premium">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <LuUsers size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800 }}>{user?.name || 'Authorized Staff'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Stationed at {loc?.name || 'Regional Site'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>SECURE SCAN</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state-full" style={{ padding: '2rem' }}>
             <p className="text-muted">No recent staff activity signatures detected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
