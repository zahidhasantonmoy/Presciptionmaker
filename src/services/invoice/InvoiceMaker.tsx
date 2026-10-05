import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Receipt, Plus, Trash2, Download, Printer, CheckCircle2,
  Building, User, Calendar, CreditCard, DollarSign
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  currency: string;
  taxRate: number;
  discount: number;
  notes: string;
}

const DEFAULT_INVOICE: InvoiceData = {
  id: 'INV-' + Math.floor(1000 + Math.random() * 9000),
  invoiceNumber: 'INV-2026-001',
  senderName: 'Apex Studio & Solutions',
  senderEmail: 'billing@apexstudio.io',
  senderAddress: '450 Innovation Way, Suite 300\nSan Francisco, CA 94107',
  clientName: 'Acme Global Ventures',
  clientEmail: 'finance@acmeglobal.com',
  clientAddress: '100 Enterprise Blvd, Floor 12\nNew York, NY 10001',
  date: '2026-10-05',
  dueDate: '2026-10-25',
  currency: '$',
  taxRate: 10,
  discount: 0,
  notes: 'Thank you for your business! Payment is requested via wire transfer within 20 days.',
  items: [
    { id: '1', description: 'Full-Stack Software Architecture & Implementation', quantity: 1, rate: 2400 },
    { id: '2', description: 'Cloud Infrastructure & High-Availability Setup', quantity: 1, rate: 850 },
    { id: '3', description: 'Security Auditing & Code Verification', quantity: 1, rate: 650 },
  ],
};

export function InvoiceMaker() {
  const [invoice, setInvoice] = useState<InvoiceData>(DEFAULT_INVOICE);
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>(() => {
    try {
      const stored = localStorage.getItem('personal_invoices_db');
      return stored ? JSON.parse(stored) : [DEFAULT_INVOICE];
    } catch {
      return [DEFAULT_INVOICE];
    }
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Calculations
  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
  const taxAmount = (subtotal * invoice.taxRate) / 100;
  const total = Math.max(0, subtotal + taxAmount - invoice.discount);

  // Line item handlers
  const addItem = () => {
    setInvoice({
      ...invoice,
      items: [
        ...invoice.items,
        { id: Math.random().toString(), description: 'New Service Item', quantity: 1, rate: 100 },
      ],
    });
  };

  const updateItem = (id: string, updates: Partial<InvoiceItem>) => {
    setInvoice({
      ...invoice,
      items: invoice.items.map(it => it.id === id ? { ...it, ...updates } : it),
    });
  };

  const removeItem = (id: string) => {
    setInvoice({
      ...invoice,
      items: invoice.items.filter(it => it.id !== id),
    });
  };

  const saveCurrentInvoice = () => {
    const updated = [invoice, ...savedInvoices.filter(i => i.id !== invoice.id)];
    setSavedInvoices(updated);
    localStorage.setItem('personal_invoices_db', JSON.stringify(updated));
    alert('Invoice saved to your local database!');
  };

  const createNewInvoice = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setInvoice({
      ...DEFAULT_INVOICE,
      id: 'INV-' + num,
      invoiceNumber: `INV-2026-${num}`,
      items: [{ id: '1', description: 'Consulting Services', quantity: 1, rate: 150 }],
    });
  };

  const handleDownloadPdf = async () => {
    if (!invoiceRef.current) return;
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${invoice.invoiceNumber}.pdf`);
    } catch (err) {
      console.error('Invoice PDF error:', err);
      alert('Could not export PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#090d16',
      color: '#f8fafc',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Top Header */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0f172a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <Receipt size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Invoice Maker</h1>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Create, calculate, and export client invoices</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={createNewInvoice}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#f1f5f9', padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
            }}
          >
            <Plus size={16} /> New Invoice
          </button>
          <button
            onClick={saveCurrentInvoice}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#f1f5f9', padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={16} /> Save
          </button>
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#f1f5f9', padding: '8px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer'
            }}
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Download size={16} /> {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor Form */}
        <div style={{
          width: 400,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          background: '#0b1120',
          padding: 20,
          overflowY: 'auto'
        }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: 14 }}>
            Invoice Configuration
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Invoice #</label>
                <input
                  type="text"
                  value={invoice.invoiceNumber}
                  onChange={e => setInvoice({ ...invoice, invoiceNumber: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Currency</label>
                <select
                  value={invoice.currency}
                  onChange={e => setInvoice({ ...invoice, currency: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                >
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                  <option value="৳">BDT (৳)</option>
                  <option value="₹">INR (₹)</option>
                  <option value="C$">CAD (C$)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Issue Date</label>
                <input
                  type="date"
                  value={invoice.date}
                  onChange={e => setInvoice({ ...invoice, date: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Due Date</label>
                <input
                  type="date"
                  value={invoice.dueDate}
                  onChange={e => setInvoice({ ...invoice, dueDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Your Business / Name</label>
              <input
                type="text"
                value={invoice.senderName}
                onChange={e => setInvoice({ ...invoice, senderName: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Your Address / Contact</label>
              <textarea
                rows={2}
                value={invoice.senderAddress}
                onChange={e => setInvoice({ ...invoice, senderAddress: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Client / Billed To</label>
              <input
                type="text"
                value={invoice.clientName}
                onChange={e => setInvoice({ ...invoice, clientName: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Client Address</label>
              <textarea
                rows={2}
                value={invoice.clientAddress}
                onChange={e => setInvoice({ ...invoice, clientAddress: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Tax (%)</label>
                <input
                  type="number"
                  value={invoice.taxRate}
                  onChange={e => setInvoice({ ...invoice, taxRate: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Discount</label>
                <input
                  type="number"
                  value={invoice.discount}
                  onChange={e => setInvoice({ ...invoice, discount: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Line Items Editor */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>LINE ITEMS</span>
                <button
                  type="button"
                  onClick={addItem}
                  style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#10b981', padding: '3px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Plus size={13} /> Add
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {invoice.items.map(item => (
                  <div key={item.id} style={{ display: 'flex', gap: 6, background: '#1e293b', padding: 8, borderRadius: 6 }}>
                    <input
                      type="text"
                      value={item.description}
                      onChange={e => updateItem(item.id, { description: e.target.value })}
                      placeholder="Description"
                      style={{ flex: 1, background: '#0f172a', border: 'none', color: '#fff', fontSize: 12, padding: 6, borderRadius: 4 }}
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      style={{ width: 45, background: '#0f172a', border: 'none', color: '#fff', fontSize: 12, padding: 6, borderRadius: 4, textAlign: 'center' }}
                      title="Qty"
                    />
                    <input
                      type="number"
                      value={item.rate}
                      onChange={e => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })}
                      style={{ width: 65, background: '#0f172a', border: 'none', color: '#fff', fontSize: 12, padding: 6, borderRadius: 4, textAlign: 'right' }}
                      title="Rate"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 2 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 4 }}>Notes / Wire Instructions</label>
              <textarea
                rows={3}
                value={invoice.notes}
                onChange={e => setInvoice({ ...invoice, notes: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', background: '#1e293b', border: '1px solid #334155', borderRadius: 6, color: '#fff', fontSize: 12, boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>

        {/* Live Document Preview */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          padding: 40,
          background: '#020617',
          overflowY: 'auto'
        }}>
          {/* Invoice Document Paper */}
          <div
            ref={invoiceRef}
            style={{
              width: 700,
              minHeight: 850,
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: 8,
              padding: '48px 56px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
            }}
          >
            {/* Invoice Header */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #f1f5f9', paddingBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    {invoice.senderName}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'pre-line', marginTop: 4 }}>
                    {invoice.senderAddress}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#10b981', letterSpacing: '-0.03em' }}>
                    INVOICE
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginTop: 4 }}>
                    #{invoice.invoiceNumber}
                  </div>
                </div>
              </div>

              {/* Billed To & Dates */}
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '28px 0' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Billed To</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>{invoice.clientName}</div>
                  <div style={{ fontSize: 12, color: '#64748b', whiteSpace: 'pre-line', marginTop: 2 }}>{invoice.clientAddress}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Date Issued</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{invoice.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Due Date</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>{invoice.dueDate}</div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', width: 60 }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', width: 90 }}>Rate</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', width: 100 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 12px', fontSize: 13, color: '#1e293b' }}>{it.description}</td>
                      <td style={{ padding: '12px 12px', fontSize: 13, color: '#64748b', textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ padding: '12px 12px', fontSize: 13, color: '#64748b', textAlign: 'right' }}>{invoice.currency}{it.rate.toFixed(2)}</td>
                      <td style={{ padding: '12px 12px', fontSize: 13, fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>
                        {invoice.currency}{(it.quantity * it.rate).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation Area */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <div style={{ width: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                    <span>Subtotal</span>
                    <span>{invoice.currency}{subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.taxRate > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#64748b' }}>
                      <span>Tax ({invoice.taxRate}%)</span>
                      <span>{invoice.currency}{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#10b981' }}>
                      <span>Discount</span>
                      <span>-{invoice.currency}{invoice.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 16, fontWeight: 900, color: '#0f172a',
                    borderTop: '2px solid #0f172a', paddingTop: 10, marginTop: 4
                  }}>
                    <span>Total Due</span>
                    <span style={{ color: '#10b981' }}>{invoice.currency}{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer / Notes */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16, marginTop: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Notes & Instructions</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, whiteSpace: 'pre-line' }}>{invoice.notes}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
