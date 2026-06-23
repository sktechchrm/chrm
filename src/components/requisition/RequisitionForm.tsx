// ─────────────────────────────────────────────────────────────────────────────
// RequisitionForm.tsx
// Path: src/components/requisition/RequisitionForm.tsx
//
// Two requisition types via the Materials / Taka toggle at the requisition level:
//
//  Type A — Materials mode (📦 Item/Material Requisition)
//    Columns: SL | বিবরণ (Particulars) | পরিমাণ (Quantity) | একক মূল্য (Unit Price ৳) | মন্তব্য
//    Total row removed for this type per spec.
//
//  Type B — Taka mode (💰 Direct Money / Fee Requisition)
//    Columns: SL | বিবরণ/উদ্দেশ্য | পরিমাণ (Amount ৳) | প্রাপক (Payment To) | মন্তব্য
//    Footer total = Σ amount (kept — this is the requisition's payable amount)
//
// All fields are <textarea> EXCEPT পরিমাণ (Amount ৳) in Taka mode, which is a
// plain number input (no spinner arrows) limited to max 2 decimal places.
//
// Switching the toggle changes the visible columns only — both unitPrice/amount
// and paymentTo are preserved on every item, so toggling back and forth never
// discards data already entered.
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { RequisitionFormProps, RequisitionItem, calculateRequisitionTotal } from './types';

const font = "'Noto Sans Bengali', Arial, sans-serif";

export default function RequisitionFormComponent({ requisition, setRequisition }: RequisitionFormProps) {

  const handleItemChange = (index: number, field: keyof RequisitionItem, value: string) => {
    const newItems = [...requisition.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setRequisition({ ...requisition, items: newItems });
  };

  // Amount field: allow any number, max 2 decimal places if a decimal is used
  const handleAmountChange = (index: number, raw: string) => {
    // Allow empty string (clearing the field)
    if (raw === '') { handleItemChange(index, 'amount', ''); return; }
    // Reject anything that isn't digits with an optional single '.' and up to 2 decimals
    if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
    handleItemChange(index, 'amount', raw);
  };

  const handleQuantityTypeChange = (type: 'quantity' | 'taka') => {
    // Switch column-set only — item data (quantity/unitPrice/amount/paymentTo)
    // is preserved so the user doesn't lose anything by toggling back and forth.
    setRequisition({ ...requisition, quantityType: type });
  };

  const addItem = () => {
    const newItem: RequisitionItem = { slNo: 1, particulars: '', quantity: '', unitPrice: '', amount: '', paymentTo: '', remarks: '' };
    const reNumbered = [newItem, ...requisition.items].map((item, i) => ({ ...item, slNo: i + 1 }));
    setRequisition({
      ...requisition,
      items: reNumbered,
    });
  };

  const removeItem = (index: number) => {
    if (requisition.items.length <= 1) return;
    const newItems = requisition.items
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, slNo: i + 1 }));
    setRequisition({ ...requisition, items: newItems });
  };

  const isTaka = requisition.quantityType === 'taka';
  const total  = calculateRequisitionTotal(requisition);

  // ── shared textarea style (used for ALL fields except Amount ৳) ───────────
  const ta: React.CSSProperties = {
    width: '100%', padding: '6px 9px',
    border: '1px solid #e2e8f0', borderRadius: 6,
    fontSize: 13, fontFamily: font, color: '#1e293b',
    background: '#fff', outline: 'none',
    boxSizing: 'border-box',
    resize: 'vertical', minHeight: 36, lineHeight: 1.4,
  };

  // ── Amount (৳) input — plain number, no spinners, max 2 decimals ──────────
  const amountInp: React.CSSProperties = {
    width: '100%', padding: '6px 9px 6px 22px',
    border: '1px solid #a7f3d0', borderRadius: 6,
    fontSize: 13, fontFamily: font, color: '#1e293b',
    background: '#fff', outline: 'none',
    boxSizing: 'border-box', textAlign: 'right',
  };

  // ── table cell styles ─────────────────────────────────────────────────────
  const thS: React.CSSProperties = {
    padding: '9px 12px', fontSize: 12, fontWeight: 700, fontFamily: font,
    color: '#374151', background: '#f8fafc',
    borderBottom: '1.5px solid #e2e8f0',
    borderRight: '1px solid #f1f5f9',
    textAlign: 'left',
  };
  const tdS: React.CSSProperties = {
    padding: '8px 10px',
    borderBottom: '1px solid #f1f5f9',
    borderRight: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  };

  // ── reusable ৳ prefixed Amount field (Taka mode only) ─────────────────────
  const AmountField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <div style={{ position: 'relative' }}>
      <span style={{
        position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
        color: '#059669', fontWeight: 700, fontSize: 13, pointerEvents: 'none',
        fontFamily: font,
      }}>৳</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="0.00"
        style={amountInp}
      />
    </div>
  );

  return (
    <div style={{ background: '#fff', maxWidth: '100%' }}>

      <div style={{ padding: '20px 24px' }}>

        {/* ── Subject (Date now lives in the ModuleShell header) ─────── */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 6, fontFamily: font }}>
            Sub: Requisition For *
          </label>
          <textarea
            value={requisition.subject}
            onChange={e => setRequisition({ ...requisition, subject: e.target.value })}
            placeholder="e.g., Ammending office Documents"
            rows={1}
            style={{ ...ta, padding: '9px 12px' }}
          />
        </div>

        {/* ── Items table ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>

          {/* Table toolbar — Bengali label left, toggle + add right */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10, flexWrap: 'wrap', gap: 8,
          }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', fontFamily: font }}>
                Items
              </span>
              <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: font, marginTop: 2 }}>
                {isTaka
                  ? 'For direct money / fee payments'
                  : 'For materials / supplies requisition'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {/* Materials / Taka toggle — switches requisition TYPE */}
              <div style={{
                display: 'flex', border: '1px solid #d1d5db',
                borderRadius: 20, overflow: 'hidden',
              }}>
                <button
                  onClick={() => handleQuantityTypeChange('quantity')}
                  title="Materials / Supplies Requisition"
                  style={{
                    padding: '4px 14px', fontSize: 12, fontWeight: 700,
                    border: 'none', cursor: 'pointer', fontFamily: font,
                    background: !isTaka ? '#1d4ed8' : '#fff',
                    color:      !isTaka ? '#fff'    : '#6b7280',
                    transition: 'all .12s',
                  }}
                >
                  Materials
                </button>
                <button
                  onClick={() => handleQuantityTypeChange('taka')}
                  title="Direct Money / Fee Requisition"
                  style={{
                    padding: '4px 14px', fontSize: 12, fontWeight: 700,
                    border: 'none', borderLeft: '1px solid #d1d5db',
                    cursor: 'pointer', fontFamily: font,
                    background: isTaka ? '#1d4ed8' : '#fff',
                    color:      isTaka ? '#fff'    : '#6b7280',
                    transition: 'all .12s',
                  }}
                >
                  Taka
                </button>
              </div>

              {/* + Add Item */}
              <button
                onClick={addItem}
                style={{
                  padding: '5px 14px', fontSize: 12, fontWeight: 700,
                  border: '1px solid #34d399', borderRadius: 20,
                  background: '#f0fdf4', color: '#065f46',
                  cursor: 'pointer', fontFamily: font,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thS, width: 44, textAlign: 'center' }}>SL</th>

                  {!isTaka && (
                    <>
                      <th style={{ ...thS }}>Particulars</th>
                      <th style={{ ...thS, width: 110 }}>Quantity</th>
                      <th style={{ ...thS, width: 130 }}>Unit Price (৳)</th>
                    </>
                  )}

                  {isTaka && (
                    <>
                      <th style={{ ...thS }}>Particulars / Purpose</th>
                      <th style={{ ...thS, width: 130 }}>Amount (৳)</th>
                      <th style={{ ...thS, width: 160 }}>Payment To</th>
                    </>
                  )}

                  <th style={{ ...thS, width: 160 }}>Remarks</th>
                  <th style={{ ...thS, width: 44, borderRight: 'none', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {requisition.items.map((item, index) => (
                  <tr key={index} style={{ background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ ...tdS, textAlign: 'center', fontWeight: 700, fontSize: 13, color: '#374151', width: 44 }}>
                      {item.slNo}
                    </td>

                    {!isTaka && (
                      <>
                        {/* Particulars */}
                        <td style={tdS}>
                          <textarea
                            value={item.particulars}
                            onChange={e => handleItemChange(index, 'particulars', e.target.value)}
                            placeholder="Enter particulars..."
                            rows={1}
                            style={ta}
                          />
                        </td>
                        {/* Quantity (free text e.g. "10 Ream") */}
                        <td style={{ ...tdS, width: 110 }}>
                          <textarea
                            value={item.quantity}
                            onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                            placeholder="e.g. 10 Ream"
                            rows={1}
                            style={ta}
                          />
                        </td>
                        {/* Unit Price */}
                        <td style={{ ...tdS, width: 130 }}>
                          <textarea
                            value={item.unitPrice}
                            onChange={e => handleItemChange(index, 'unitPrice', e.target.value)}
                            placeholder="৳ 0.00"
                            rows={1}
                            style={{ ...ta, textAlign: 'right' }}
                          />
                        </td>
                      </>
                    )}

                    {isTaka && (
                      <>
                        {/* Particulars / Purpose */}
                        <td style={tdS}>
                          <textarea
                            value={item.particulars}
                            onChange={e => handleItemChange(index, 'particulars', e.target.value)}
                            placeholder="e.g. Trade License Fee"
                            rows={1}
                            style={ta}
                          />
                        </td>
                        {/* Amount — plain number input, max 2 decimals, no spinners */}
                        <td style={{ ...tdS, width: 130 }}>
                          <AmountField
                            value={item.amount}
                            onChange={v => handleAmountChange(index, v)}
                          />
                        </td>
                        {/* Payment To */}
                        <td style={{ ...tdS, width: 160 }}>
                          <textarea
                            value={item.paymentTo}
                            onChange={e => handleItemChange(index, 'paymentTo', e.target.value)}
                            placeholder="e.g. City Corporation"
                            rows={1}
                            style={ta}
                          />
                        </td>
                      </>
                    )}

                    {/* Remarks (common to both types) */}
                    <td style={{ ...tdS, width: 160 }}>
                      <textarea
                        value={item.remarks}
                        onChange={e => handleItemChange(index, 'remarks', e.target.value)}
                        placeholder="Remarks..."
                        rows={1}
                        style={ta}
                      />
                    </td>

                    {/* Remove row */}
                    <td style={{ ...tdS, borderRight: 'none', textAlign: 'center', width: 44 }}>
                      {requisition.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          title="Remove"
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: '#ef4444', fontSize: 16, lineHeight: 1,
                            padding: '2px 4px', borderRadius: 4,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* Total row — Taka mode only. Materials mode has no total row per spec. */}
              {isTaka && (
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{
                      padding: '9px 12px', fontSize: 13, fontWeight: 700, fontFamily: font,
                      color: '#1e293b', background: '#f8fafc', textAlign: 'right',
                      borderRight: '1px solid #f1f5f9', borderTop: '1.5px solid #e2e8f0',
                    }}>
                      Total
                    </td>
                    <td style={{
                      padding: '9px 12px', fontSize: 14, fontWeight: 800, fontFamily: font,
                      color: '#065f46', background: '#f0fdf4', textAlign: 'right',
                      borderRight: '1px solid #f1f5f9', borderTop: '1.5px solid #e2e8f0',
                    }}>
                      ৳ {total.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td colSpan={2} style={{
                      background: '#f8fafc', borderTop: '1.5px solid #e2e8f0', borderRight: 'none',
                    }} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}