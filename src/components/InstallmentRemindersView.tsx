import { type FC, useState } from 'react';
import { LandPlot, LocationEstate } from '../types/land';
import { Copy, Check, DollarSign } from 'lucide-react';
import { formatNumber } from '../lib/numberFormat';

interface InstallmentRemindersViewProps {
  plots: LandPlot[];
  locations: LocationEstate[];
  onSelectPlot: (plot: LandPlot) => void;
  onLogPayment: (plot: LandPlot) => void;
}

export const InstallmentRemindersView: FC<InstallmentRemindersViewProps> = ({
  plots,
  locations,
  onSelectPlot,
  onLogPayment,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const todayDay = new Date().getDate();

  const installmentPlots = plots
    .filter((p) => (p.status === 'installment' || p.status === 'half_paid') && p.totalPrice > p.amountPaid)
    .sort((a, b) => (a.installmentDayOfMonth || 28) - (b.installmentDayOfMonth || 28));

  const getLocationName = (locationId: string) =>
    locations.find((l) => l.id === locationId)?.name || locationId;

  const handleCopyReminder = (plot: LandPlot) => {
    const locName = getLocationName(plot.locationId);
    const due = plot.monthlyInstallmentAmount || plot.totalPrice - plot.amountPaid;
    const balance = plot.totalPrice - plot.amountPaid;
    const message = `Habari ${plot.buyerName}, huu ni ukumbusho wa malipo ya kila mwezi ya kiwanja chako (${plot.plotNumber}, ${locName}). Kiasi cha mwezi huu: $${formatNumber(due)}. Salio lililobaki: $${formatNumber(balance)}. Asante.`;

    navigator.clipboard.writeText(message);
    setCopiedId(plot.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (installmentPlots.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <p className="text-sm font-medium text-slate-900 mb-1">No active installment plans</p>
        <p className="text-xs text-slate-500">
          Plots sold on monthly installments or half-payment will appear here for monthly reminders.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
              <th className="py-3 px-4">Buyer</th>
              <th className="py-3 px-4">Location & Plot</th>
              <th className="py-3 px-4">Sold By</th>
              <th className="py-3 px-4 text-right">Paid / Total</th>
              <th className="py-3 px-4 text-right">Balance</th>
              <th className="py-3 px-4">Monthly Due</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {installmentPlots.map((plot) => {
              const balance = Math.max(0, plot.totalPrice - plot.amountPaid);
              const dueDay = plot.installmentDayOfMonth || 1;
              const isDueSoon = Math.abs(dueDay - todayDay) <= 3 || dueDay === todayDay;

              return (
                <tr key={plot.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onSelectPlot(plot)}
                      className="font-medium text-slate-900 hover:underline text-left"
                    >
                      {plot.buyerName || 'Unnamed Buyer'}
                    </button>
                    <div className="text-xs text-slate-500 font-mono-nums">
                      {plot.buyerPhone || 'No phone'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{plot.plotNumber}</div>
                    <div className="text-xs text-slate-500">
                      {getLocationName(plot.locationId)} · {plot.areaValue} {plot.areaUnit}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-xs">{plot.soldBy || '—'}</td>
                  <td className="py-3 px-4 text-right font-mono-nums text-xs text-slate-700">
                    ${formatNumber(plot.amountPaid)} / ${formatNumber(plot.totalPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono-nums font-semibold text-slate-900">
                    ${formatNumber(balance)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs font-medium text-slate-900">
                      Every {dueDay}th
                      {isDueSoon && (
                        <span className="ml-2 text-amber-700 font-semibold">· Due Soon</span>
                      )}
                    </div>
                    {plot.monthlyInstallmentAmount ? (
                      <div className="text-xs text-slate-500 font-mono-nums">
                        ${formatNumber(plot.monthlyInstallmentAmount)} / mo
                      </div>
                    ) : null}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyReminder(plot)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        {copiedId === plot.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy SMS
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onLogPayment(plot)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        Log Payment
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
