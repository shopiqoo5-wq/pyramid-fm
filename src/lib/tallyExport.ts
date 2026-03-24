import type { Order, Company } from '../types';

export const generateTallyXML = (orders: Order[], companies: Company[]) => {
  // Group orders by company for Ledger creation
  const uniqueCompanyIds = [...new Set(orders.map(o => o.companyId))];
  const relevantCompanies = companies.filter(c => uniqueCompanyIds.includes(c.id));

  // XML Header
  let xml = `<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>All Masters</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Pyramid FM Services</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>\n`;

  // 1. Create Ledgers (Sundry Debtors & Sales Accounts)
  relevantCompanies.forEach(company => {
    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${company.name}" ACTION="Create">
            <NAME.LIST>
              <NAME>${company.name}</NAME>
            </NAME.LIST>
            <PARENT>Sundry Debtors</PARENT>
            <ISBILLWISEON>Yes</ISBILLWISEON>
            <PARTYGSTIN>${company.gstNumber}</PARTYGSTIN>
            <STATENAME>Karnataka</STATENAME> <!-- Default for demo -->
          </LEDGER>
        </TALLYMESSAGE>\n`;
  });

  // Base Sales & Tax Ledgers
  const standardLedgers = ['Sales Account', 'CGST @ 9%', 'SGST @ 9%', 'IGST @ 18%'];
  standardLedgers.forEach(ledger => {
    const parent = ledger.includes('GST') ? 'Duties & Taxes' : 'Sales Accounts';
    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <LEDGER NAME="${ledger}" ACTION="Create">
            <NAME.LIST>
              <NAME>${ledger}</NAME>
            </NAME.LIST>
            <PARENT>${parent}</PARENT>
          </LEDGER>
        </TALLYMESSAGE>\n`;
  });

  // 2. Create Vouchers (Sales Invoices)
  orders.forEach(order => {
    const company = companies.find(c => c.id === order.companyId);
    const companyName = company ? company.name : 'Unknown Client';
    
    // Format Date from ISO to Tally Format (YYYYMMDD)
    const orderDate = new Date(order.createdAt);
    const dateStr = `${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}`;
    const cleanAmount = (amount: number) => amount.toFixed(2);
    
    // Note: In Tally XML, Debits are negative, Credits are positive for party ledgers in Sales Voucher
    // Actually, Tally expects amount sign convention based on standard accounting rules.
    // For Sales: Party is Dr (-), Sales is Cr (+)
    const partyAmount = `-${cleanAmount(order.netAmount)}`; 
    const salesAmount = `${cleanAmount(order.totalAmount - order.gstAmount)}`;
    const cgstAmount = `${cleanAmount(order.gstAmount / 2)}`;
    const sgstAmount = `${cleanAmount(order.gstAmount / 2)}`;

    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${dateStr}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${order.customId}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${companyName}</PARTYLEDGERNAME>
            <NARRATION>System Order Ref: ${order.customId}</NARRATION>
            
            <!-- Dr Party Ledger -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${companyName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>${partyAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <!-- Cr Sales Ledger -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${salesAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <!-- Cr CGST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>CGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${cgstAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <!-- Cr SGST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>SGST @ 9%</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${sgstAmount}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>\n`;
  });

  // XML Footer
  xml += `      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;

  return xml;
};

export const downloadTallyXML = (orders: Order[], companies: Company[], filename: string = 'tally_export') => {
  const xmlString = generateTallyXML(orders, companies);
  const blob = new Blob([xmlString], { type: 'text/xml' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${filename}_${dateStr}.xml`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
