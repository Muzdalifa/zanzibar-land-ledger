import type { FC } from 'react';
import { LandPlot } from '../types/land';
import { formatNumber } from '../lib/numberFormat';

interface PlotBoxesGridProps {
  plots: LandPlot[];
  selectedPlotId: string | null;
  onSelectPlot: (plot: LandPlot) => void;
}

export const PlotBoxesGrid: FC<PlotBoxesGridProps> = ({
  plots,
  selectedPlotId,
  onSelectPlot,
}) => {
  if (plots.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <p className="text-sm font-medium text-slate-900 mb-1">No plots match your filter</p>
        <p className="text-xs text-slate-500">
          Try clearing your search or switching status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {plots.map((plot) => {
        const isSelected = plot.id === selectedPlotId;
        const isSold = plot.status === 'sold';
        const isPartial = plot.status === 'installment' || plot.status === 'half_paid';
        const percentPaid =
          plot.totalPrice > 0 ? Math.min(100, Math.round((plot.amountPaid / plot.totalPrice) * 100)) : 0;

        return (
          <button
            key={plot.id}
            type="button"
            onClick={() => onSelectPlot(plot)}
            className={`relative text-left rounded-xl border p-4 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
              isSelected
                ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                : isSold
                ? 'border-red-200 bg-red-50/40 hover:border-red-300'
                : isPartial
                ? 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            {/* Top row: Plot Number & Crossed X if sold */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3
                  className={`text-base font-semibold text-slate-900 ${
                    isSold ? 'line-through decoration-red-600 decoration-2' : ''
                  }`}
                >
                  {plot.plotNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {plot.zone} · <span className="font-mono-nums">{plot.areaValue} {plot.areaUnit}</span>
                </p>
              </div>

              {isSold ? (
                <span
                  className="w-7 h-7 rounded-md bg-red-600 text-white font-bold text-sm flex items-center justify-center shrink-0"
                  title="Sold"
                >
                  ✕
                </span>
              ) : isPartial ? (
                <span className="text-xs font-medium text-amber-700 shrink-0">
                  {plot.status === 'half_paid' ? 'Half Paid' : 'Installment'}
                </span>
              ) : (
                <span className="text-xs font-medium text-emerald-700 shrink-0">
                  Available
                </span>
              )}
            </div>

            {/* Price & Payment Progress */}
            <div className="mt-3 pt-3 border-t border-slate-200/70 space-y-2">
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500">Price</span>
                <span className="font-mono-nums font-semibold text-slate-900">
                  ${formatNumber(plot.totalPrice)}
                </span>
              </div>

              {plot.status !== 'available' && (
                <>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Buyer</span>
                    <span className="font-medium text-slate-800 truncate max-w-[140px]">
                      {plot.buyerName || '—'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500">Sold by</span>
                    <span className="text-slate-700 truncate max-w-[140px]">
                      {plot.soldBy || '—'}
                    </span>
                  </div>
                </>
              )}

              {isPartial && (
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                    <span className="font-mono-nums">
                      ${formatNumber(plot.amountPaid)} paid ({percentPaid}%)
                    </span>
                    {plot.installmentDayOfMonth && (
                      <span className="text-amber-700 font-medium">
                        Due {plot.installmentDayOfMonth}th
                      </span>
                    )}
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
