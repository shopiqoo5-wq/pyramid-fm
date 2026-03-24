import React, { useState } from 'react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LuDownload, 
  LuFileText, 
  LuCode, 
  LuWallet, 
  LuCalendarClock, 
  LuActivity,
  LuCircleCheck,
  LuClock,
  LuArrowUpRight
} from 'react-icons/lu';
import { Button, Table } from '../../components/ui';
import { generateTallySalesXML, downloadTallyXML } from '../../utils/tally';
import './PortalInvoices.css';

const ClientInvoices: React.FC = () => {
  const { orders, currentUser, companies, products, payOutstandingInvoices, addNotification, settings } = useStore((state: any) => state);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

  const invoicedOrders = orders.filter(
    (o: any) => o.companyId === currentUser?.companyId && ['dispatched', 'delivered'].includes(o.status)
  );

  let totalOutstanding = 0;
  invoicedOrders.forEach((o: any) => {
    if (!o.isPaid) totalOutstanding += o.netAmount;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const handleDownloadPDF = async (orderId: string) => {
    setDownloading(orderId);
    try {
      const order = orders.find((o: any) => o.id === orderId);
      if (order) {
        const { generateInvoicePDF } = await import('../../lib/pdfGenerator');
        const company = companies.find((c: any) => c.id === (order.companyId || currentUser?.companyId));
        generateInvoicePDF(order, company, products, settings);
      }
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadStatement = async () => {
    setDownloading('statement');
    try {
      const { generateStatementPDF } = await import('../../lib/pdfGenerator');
      const company = companies.find((c: any) => c.id === currentUser?.companyId);
      if (company) {
        generateStatementPDF(company, invoicedOrders, settings);
      }
    } catch (error) {
      console.error('Failed to generate Statement', error);
    } finally {
      setDownloading(null);
    }
  };

  const handlePayment = () => {
    setIsPaying(true);
    setTimeout(() => {
      payOutstandingInvoices(currentUser!.companyId!);
      addNotification({
        userId: currentUser!.id,
        title: 'Payment Successful',
        message: 'Your outstanding balance has been cleared via Corporate Net Banking.',
        type: 'success'
      });
      setIsPaying(false);
    }, 1500);
  };

  const handleDownloadTally = (row: any) => {
    const xmlString = generateTallySalesXML({
      voucherNumber: `INV-${row.customId}`,
      date: new Date(row.createdAt).toISOString().slice(0, 10).replace(/-/g, ''),
      partyLedgerName: currentUser?.name || 'Client A',
      salesLedgerName: 'Sales Account - Facility Supplies',
      baseAmount: row.netAmount / 1.18,
      cgstAmount: (row.netAmount - (row.netAmount / 1.18)) / 2,
      sgstAmount: (row.netAmount - (row.netAmount / 1.18)) / 2,
      igstAmount: 0,
      netAmount: row.netAmount,
      narration: `Order ${row.customId} generated from Pyramid FM Portal`
    });
    downloadTallyXML(xmlString, `Tally_INV_${row.customId}.xml`);
  };

  const columns = [
    { 
      key: 'invoiceNumber', 
      header: 'Invoice Reference', 
      render: (row: any) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>INV-{row.customId.split('-')[1]}-{row.customId.split('-')[2]}</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ID: {row.id.slice(0, 8)}</span>
        </div>
      )
    },
    { 
      key: 'date', 
      header: 'Filing Date', 
      render: (row: any) => (
        <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
          {new Date(row.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    { 
      key: 'amount', 
      header: 'Total Value', 
      render: (row: any) => <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{formatCurrency(row.netAmount)}</span> 
    },
    { 
      key: 'status', 
      header: 'Financial Status', 
      render: (row: any) => (
        <span className={`payment-badge ${row.isPaid ? 'payment-paid' : 'payment-pending'}`}>
          {row.isPaid ? <LuCircleCheck size={10} /> : <LuClock size={10} />}
          {row.isPaid ? 'Paid' : 'Awaiting Payment'}
        </span>
      ) 
    },
    {
      key: 'actions',
      header: '',
      render: (row: any) => (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="btn-finance-action btn-tally" onClick={() => handleDownloadTally(row)} title="Export to Tally ERP">
            <LuCode size={14} /> Tally XML
          </button>
          <button className="btn-finance-action" onClick={() => handleDownloadPDF(row.id)} title="Download PDF Invoice">
            {downloading === row.id ? <LuActivity className="animate-spin" size={14} /> : <LuDownload size={14} />} PDF
          </button>
        </div>
      )
    }
  ];

  const company = companies.find((c: any) => c.id === currentUser?.companyId);
  const limit = company?.creditLimit || 0;
  const avail = company?.availableCredit ?? limit;
  const usedPct = limit > 0 ? Math.round(((limit - avail) / limit) * 100) : 0;
  const healthColor = usedPct > 80 ? 'var(--danger)' : usedPct > 60 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="invoices-container animate-fade-in">
      <div className="page-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', fontWeight: 800 }}>Financial Operations</h2>
          <p className="text-muted" style={{ fontSize: '1.1rem', marginTop: '0.4rem' }}>Download tax assets and track institutional billing cycles.</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={handleDownloadStatement} 
          isLoading={downloading === 'statement'}
          style={{ borderRadius: '12px' }}
        >
          <LuFileText size={18} /> Account Statement
        </Button>
      </div>

      <div className="finance-stats-grid">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="finance-card">
          <div className="card-label"><LuWallet size={16} /> Total Outstanding</div>
          <div className="card-amount" style={{ color: totalOutstanding > 0 ? 'var(--warning)' : 'var(--success)' }}>
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="card-subtitle">Payable balance for delivered supplies</div>
          {totalOutstanding > 0 && (
            <Button variant="primary" style={{ marginTop: '0.5rem', width: '100%', borderRadius: '12px' }} onClick={handlePayment} isLoading={isPaying}>
              Clear Balance <LuArrowUpRight size={14} />
            </Button>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="finance-card">
          <div className="card-label"><LuCalendarClock size={16} /> Next Billing Cycle</div>
          <div className="card-amount">
            {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </div>
          <div className="card-subtitle">Scheduled automated reconciliation</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="finance-card">
          <div className="card-label"><LuActivity size={16} /> Institutional Credit Health</div>
          <div className="health-meter-container">
            <div className="health-bar-bg">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${100 - usedPct}%` }}
                className="health-bar-fill" 
                style={{ background: healthColor }} 
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Avail: {formatCurrency(avail)}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: healthColor }}>Used: {usedPct}%</span>
          </div>
        </motion.div>
      </div>

      <div className="ledger-card">
        <div className="ledger-header">
          <h3 className="ledger-title">Institutional Invoice Ledger</h3>
          <div className="text-muted" style={{ fontSize: '0.8rem', fontWeight: 600 }}>Showing {invoicedOrders.length} records</div>
        </div>
        <div className="ledger-body">
          <AnimatePresence mode="wait">
            {invoicedOrders.length > 0 ? (
              <Table columns={columns as any} data={invoicedOrders} />
            ) : (
              <div style={{ padding: '5rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--surface-hover)', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--text-muted)' }}>
                  <LuFileText size={40} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>No Current Invoices</h3>
                <p className="text-muted" style={{ maxWidth: '300px', margin: '0.5rem auto' }}>Invoices are generated automatically once orders are dispatched or delivered.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ClientInvoices;
