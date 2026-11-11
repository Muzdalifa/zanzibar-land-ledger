import { type FC, type FormEvent, useState, useEffect } from 'react';
import { LandPlot, PaymentType, PlotStatus } from '../types/land';
import { X, Check, Trash2, DollarSign } from 'lucide-react';
import { formatNumber } from '../lib/numberFormat';

interface PlotDetailDrawerProps {
  plot: LandPlot | null;
  locationName: string;
  onClose: () => void;
  onSave: (updated: LandPlot) => void;
  onDelete: (plotId: string) => void;
}

export const PlotDetailDrawer: FC<PlotDetailDrawerProps> = ({
  plot,
  locationName,
  onClose,
  onSave,
  onDelete,
}) => {
  const [form, setForm] = useState<LandPlot | null>(null);

  useEffect(() => {
    setForm(plot ? { ...plot } : null);
  }, [plot]);

  if (!form) return null;

  const balance = Math.max(0, form.totalPrice - form.amountPaid);

  const handlePaymentTypeChange = (type: PaymentType) => {
    let status: PlotStatus = 'available';
    let amountPaid = form.amountPaid;

    if (type === 'cash') {
      status = 'sold';
      amountPaid = form.totalPrice;
    } else if (type === 'half') {
      status = 'half_paid';
      amountPaid = Math.round(form.totalPrice * 0.5);
    } else if (type === 'installment') {
      status = 'installment';
      if (amountPaid >= form.totalPrice) amountPaid = 0;
    } else {
      status = 'available';
      amountPaid = 0;
    }

    setForm({
      ...form,
      paymentType: type,
      status,
      amountPaid,
      saleDate: type === 'none' ? '' : form.saleDate || new Date().toISOString().slice(0, 10),
    });
  };

  const handleRecordInstallment = () => {
    const payment = form.monthlyInstallmentAmount || 500;
    const newPaid = Math.min(form.totalPrice, form.amountPaid + payment);
    const isNowFull = newPaid >= form.totalPrice;
    const updated: LandPlot = {
      ...form,
      amountPaid: newPaid,
      status: isNowFull ? 'sold' : form.status,
      paymentType: isNowFull ? 'cash' : form.paymentType,
      lastPaymentDate: new Date().toISOString().slice(0, 10),
    };
    setForm(updated);
    onSave(updated);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const isNowFull = form.paymentType !== 'none' && form.amountPaid >= form.totalPrice;
    onSave({
      ...form,
      status: isNowFull ? 'sold' : form.status,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px]">
      <div className="w-full max-w-md bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              {locationName} · {form.zone}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">{form.plotNumber}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Area & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Area Size</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="any"
                  required
                  value={form.areaValue}
                  onChange={(e) => setForm({ ...form, areaValue: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <select
                  value={form.areaUnit}
                  onChange={(e) => setForm({ ...form, areaUnit: e.target.value as LandPlot['areaUnit'] })}
                  className="px-2 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="m²">m²</option>
                  <option value="ha">ha</option>
                  <option value="acres">acres</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Total Price ($)</label>
              <input
                type="number"
                required
                min={0}
                value={form.totalPrice}
                onChange={(e) => setForm({ ...form, totalPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Payment Type Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Sale & Payment Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: 'none', label: 'Available (Unsold)' },
                  { id: 'cash', label: 'Full Cash (Sold)' },
                  { id: 'half', label: 'Half Payment (50%)' },
                  { id: 'installment', label: 'Monthly Installment' },
                ] as { id: PaymentType; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handlePaymentTypeChange(opt.id)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors ${
                    form.paymentType === opt.id
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {form.paymentType !== 'none' && (
            <>
              {/* Sold By & To Whom */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Sold By (Agent / Seller)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Salim Juma"
                    value={form.soldBy}
                    onChange={(e) => setForm({ ...form, soldBy: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Buyer Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Fatma Ali"
                      value={form.buyerName}
                      onChange={(e) => setForm({ ...form, buyerName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Buyer Phone
                    </label>
                    <input
                      type="text"
                      placeholder="+255 7..."
                      value={form.buyerPhone}
                      onChange={(e) => setForm({ ...form, buyerPhone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Amounts */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Amount Paid ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={form.totalPrice}
                    value={form.amountPaid}
                    onChange={(e) => setForm({ ...form, amountPaid: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Remaining Balance
                  </label>
                  <div className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono-nums text-slate-700">
                    ${formatNumber(balance)}
                  </div>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="block text-xs font-semibold text-slate-900">
                  Receipt Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Receipt Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. RCT-2026-001"
                      value={form.receiptNumber || ''}
                      onChange={(e) => setForm({ ...form, receiptNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Receipt Date
                    </label>
                    <input
                      type="date"
                      value={form.receiptDate || form.saleDate || ''}
                      onChange={(e) => setForm({ ...form, receiptDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentMethod || 'Cash'}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentMethod: e.target.value as NonNullable<LandPlot['paymentMethod']>,
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Mobile Money">Mobile Money (M-Pesa / Tigo Pesa)</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              {/* Installment Reminder Schedule */}
              {(form.paymentType === 'installment' || form.paymentType === 'half') && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-900">
                      Monthly Reminder Schedule
                    </span>
                    {balance > 0 && (
                      <button
                        type="button"
                        onClick={handleRecordInstallment}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                      >
                        <DollarSign className="w-3 h-3" />
                        Log Payment
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-amber-900 mb-1">
                        Remind Day of Month
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={28}
                        value={form.installmentDayOfMonth || 1}
                        onChange={(e) =>
                          setForm({ ...form, installmentDayOfMonth: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-amber-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-amber-900 mb-1">
                        Monthly Amount ($)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={form.monthlyInstallmentAmount || 0}
                        onChange={(e) =>
                          setForm({ ...form, monthlyInstallmentAmount: Number(e.target.value) })
                        }
                        className="w-full px-2.5 py-1.5 text-sm bg-white border border-amber-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-amber-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
            <textarea
              rows={2}
              value={form.notes || ''}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Title deed status, boundary notes..."
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onDelete(form.id)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
