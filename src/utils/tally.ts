/**
 * Utility to generate a Tally Prime compliant XML string for Sales Vouchers.
 * This XML can be imported directly into Tally ERP 9 / Tally Prime.
 */

export interface TallyVoucherData {
  voucherNumber: string;
  date: string; // Format: YYYYMMDD
  partyLedgerName: string; // The Customer's Ledger Name in Tally
  salesLedgerName: string; // The Sales Account Ledger
  baseAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  netAmount: number;
  narration: string;
}

export const generateTallySalesXML = (data: TallyVoucherData): string => {
  // Ensure precise formatting for accounting
  const formatAmt = (amt: number) => amt.toFixed(2);

  return `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Pyramid FM Services</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create" OBJVIEW="Accounting Voucher View">
            <DATE>${data.date}</DATE>
            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
            <VOUCHERNUMBER>${data.voucherNumber}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>${data.partyLedgerName}</PARTYLEDGERNAME>
            <NARRATION>${data.narration}</NARRATION>
            
            <!-- Buyer Entry (Debit) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${data.partyLedgerName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-${formatAmt(data.netAmount)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- Sales Entry (Credit) -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>${data.salesLedgerName}</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${formatAmt(data.baseAmount)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>

            <!-- CGST Entry (Credit) -->
            ${data.cgstAmount > 0 ? `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${formatAmt(data.cgstAmount)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            ` : ''}

            <!-- SGST Entry (Credit) -->
            ${data.sgstAmount > 0 ? `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${formatAmt(data.sgstAmount)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            ` : ''}

            <!-- IGST Entry (Credit) -->
            ${data.igstAmount > 0 ? `
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output IGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>${formatAmt(data.igstAmount)}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            ` : ''}

          </VOUCHER>
        </TALLYMESSAGE>
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>
  `.trim();
};

/**
 * Triggers a browser download of the generated XML string
 */
export const downloadTallyXML = (xmlString: string, filename: string) => {
  const blob = new Blob([xmlString], { type: 'application/xml' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};
