import { type FC, useMemo, useState } from 'react';
import { LandPlot, LocationEstate, PlotStatus } from '../types/land';
import { Download, Search } from 'lucide-react';
import { formatNumber } from '../lib/numberFormat';

interface AllRecordsViewProps {
  plots: LandPlot[];
  locations: LocationEstate[];
  onSelectPlot: (plot: LandPlot) => void;
}

export const AllRecordsView: FC<AllRecordsViewProps> = ({
  plots,
  locations,
  onSelectPlot,
}) => {
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<PlotStatus | 'all'>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const agents = useMemo(() => {
    const set = new Set<string>();
    plots.forEach((p) => {
      if (p.soldBy?.trim()) set.add(p.soldBy.trim());
    });
    return Array.from(set).sort();
  }, [plots]);

  const getLocationName = (id: string) =>
    locations.find((l) => l.id === id)?.name || id;

  const filtered = useMemo(() => {
    return plots.filter((p) => {
      if (locationFilter !== 'all' && p.locationId !== locationFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (agentFilter !== 'all' && p.soldBy !== agentFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hit =
          p.plotNumber.toLowerCase().includes(q) ||
          p.buyerName.toLowerCase().includes(q) ||
          p.buyerPhone.toLowerCase().includes(q) ||
          p.soldBy.toLowerCase().includes(q) ||
          (p.receiptNumber || '').toLowerCase().includes(q) ||
          (p.notes || '').toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [plots, locationFilter, statusFilter, agentFilter, search]);

  const handleExportCsv = () => {
    const headers = [
      'Location',
      'Zone',
      'Plot Number',
      'Area',
      'Unit',
      'Status',
      'Total Price ($)',
      'Amount Paid ($)',
      'Balance ($)',
      'Sold By',
      'Buyer Name',
      'Buyer Phone',
      'Receipt Number',
      'Receipt Date',
      'Payment Method',
    ];
    const rows = filtered.map((p) => [
      getLocationName(p.locationId),
      p.zone,
      p.plotNumber,
      p.areaValue,
      p.areaUnit,
      p.status,
      p.totalPrice,
      p.amountPaid,
      Math.max(0, p.totalPrice - p.amountPaid),
      p.soldBy,
      p.buyerName,
      p.buyerPhone,
      p.receiptNumber || '',
      p.receiptDate || p.saleDate || '',
      p.paymentMethod || '',
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zanzibar-land-records-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PlotStatus | 'all')}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="sold">Sold (Crossed)</option>
            <option value="half_paid">Half Paid</option>
            <option value="installment">Installment</option>
          </select>

          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Sellers / Agents</option>
            {agents.map((agent) => (
              <option key={agent} value={agent}>
                {agent}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search plot, buyer, receipt #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                <th className="py-3 px-4">Location & Plot</th>
                <th className="py-3 px-4">Area</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Buyer</th>
                <th className="py-3 px-4">Sold By</th>
                <th className="py-3 px-4">Receipt</th>
                <th className="py-3 px-4 text-right">Paid / Total</th>
                <th className="py-3 px-4 text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-xs text-slate-500">
                    No records match your current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((plot) => {
                  const balance = Math.max(0, plot.totalPrice - plot.amountPaid);
                  const isSold = plot.status === 'sold';
                  const isPartial =
                    plot.status === 'installment' || plot.status === 'half_paid';

                  return (
                    <tr
                      key={plot.id}
                      onClick={() => onSelectPlot(plot)}
                      className="hover:bg-slate-50/90 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div
                          className={`font-medium text-slate-900 ${
                            isSold ? 'line-through decoration-red-600' : ''
                          }`}
                        >
                          {plot.plotNumber}
                        </div>
                        <div className="text-xs text-slate-500">
                          {getLocationName(plot.locationId)} · {plot.zone}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono-nums text-xs text-slate-700">
                        {plot.areaValue} {plot.areaUnit}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        {isSold ? (
                          <span className="font-semibold text-red-600">✕ Sold</span>
                        ) : isPartial ? (
                          <span className="font-medium text-amber-700">
                            {plot.status === 'half_paid' ? 'Half Paid' : 'Installment'}
                          </span>
                        ) : (
                          <span className="font-medium text-emerald-700">Available</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-slate-900">
                          {plot.buyerName || '—'}
                        </div>
                        {plot.buyerPhone && (
                          <div className="text-[11px] text-slate-500 font-mono-nums">
                            {plot.buyerPhone}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        {plot.soldBy || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-mono-nums text-slate-800">
                          {plot.receiptNumber || '—'}
                        </div>
                        {plot.paymentMethod && plot.status !== 'available' && (
                          <div className="text-[11px] text-slate-500">
                            {plot.paymentMethod}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums text-xs text-slate-700">
                        ${formatNumber(plot.amountPaid)} / ${formatNumber(plot.totalPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-nums text-xs font-semibold text-slate-900">
                        ${formatNumber(balance)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
