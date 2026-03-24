export interface GSTDetails {
  baseAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  netAmount: number;
  isInterState: boolean;
}

/**
 * Calculates Indian GST based on source and destination state codes.
 * If sourceState === destState, computes CGST (9%) and SGST (9%).
 * If sourceState !== destState, computes IGST (18%).
 * 
 * @param amount - The base pre-tax amount
 * @param sourceState - The state code of the warehouse (e.g., 'MH', 'KA')
 * @param destState - The state code of the delivery location
 * @param baseRate - The standard GST rate for the product (default 18%)
 */
export const calculateIndianGST = (
  amount: number,
  sourceState: string,
  destState: string,
  baseRate: number = 18
): GSTDetails => {
  const isInterState = sourceState.toUpperCase() !== destState.toUpperCase();
  
  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (isInterState) {
    igst = amount * (baseRate / 100);
  } else {
    cgst = amount * ((baseRate / 2) / 100);
    sgst = amount * ((baseRate / 2) / 100);
  }

  const totalGst = cgst + sgst + igst;

  return {
    baseAmount: amount,
    cgst,
    sgst,
    igst,
    totalGst,
    netAmount: amount + totalGst,
    isInterState
  };
};

/**
 * Common Indian State Codes map for reference UI
 */
export const INDIAN_STATES: Record<string, string> = {
  'MH': 'Maharashtra',
  'KA': 'Karnataka',
  'DL': 'Delhi',
  'GJ': 'Gujarat',
  'TN': 'Tamil Nadu',
  'TS': 'Telangana',
  'UP': 'Uttar Pradesh',
  'HR': 'Haryana'
};
