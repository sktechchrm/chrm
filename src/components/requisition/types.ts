// ── Requisition line item ──────────────────────────────────────────────────────
//
// Two requisition types, switched via `quantityType` at the requisition level:
//
//  Type A — 'quantity' (📦 Item/Material Requisition)
//    Columns: Sl No | Particulars | Quantity | Unit Price (৳) | Remarks
//    Total = Σ (parsed numeric qty × unitPrice)
//
//  Type B — 'taka' (💰 Direct Money / Fee Requisition)
//    Columns: Sl No | Particulars/Purpose | Amount (৳) | Payment To/Vendor | Remarks
//    Total = Σ amount
//
// Both unitPrice/amount and paymentTo are kept on every item so toggling
// between Type A <-> Type B does not discard data the user already entered.
export interface RequisitionItem {
  slNo: number;
  particulars: string;
  /** Type A: quantity text, e.g. "10 Ream", "2 Pcs" */
  quantity: string;
  /** Type A: unit price in taka — numeric string */
  unitPrice: string;
  /** Type B: direct amount in taka — numeric string */
  amount: string;
  /** Type B: who/where the payment goes to */
  paymentTo: string;
  remarks: string;
}

export interface RequisitionData {
  subject: string;
  date: string;
  /** 'quantity' = Type A (Item/Material) · 'taka' = Type B (Direct Money/Fee) */
  quantityType: 'quantity' | 'taka';
  items: RequisitionItem[];

  factoryName: string;
  factoryAddress: string;
}

export interface RequisitionFormProps {
  requisition: RequisitionData;
  setRequisition: (data: RequisitionData) => void;
}

export interface RequisitionViewProps {
  requisition: RequisitionData;
}

// ── Total calculation ────────────────────────────────────────────────────────
// Type A: sum of (numeric portion of quantity x unitPrice)
// Type B: sum of amount
export function calculateRequisitionTotal(requisition: RequisitionData): number {
  if (requisition.quantityType === 'taka') {
    return requisition.items.reduce((sum, item) => {
      const amt = parseFloat(item.amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }
  return requisition.items.reduce((sum, item) => {
    const qtyNum  = parseFloat(item.quantity);   // "10 Ream" -> 10
    const unitNum = parseFloat(item.unitPrice);
    if (isNaN(qtyNum) || isNaN(unitNum)) return sum;
    return sum + qtyNum * unitNum;
  }, 0);
}

// ── Initial / blank state ──────────────────────────────────────────────────────
export const INITIAL_REQUISITION_STATE: RequisitionData = {
  subject: "",
  date: new Date().toISOString().split('T')[0],
  quantityType: "quantity",
  items: [
    {
      slNo: 1,
      particulars: "",
      quantity: "",
      unitPrice: "",
      amount: "",
      paymentTo: "",
      remarks: "",
    },
  ],
  factoryName: "",
  factoryAddress: "",
};