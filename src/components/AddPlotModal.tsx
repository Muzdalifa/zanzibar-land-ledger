import { type FC, type FormEvent, useState } from 'react';
import { AreaUnit, LandPlot, LocationEstate } from '../types/land';
import { X } from 'lucide-react';

interface AddPlotModalProps {
  isOpen: boolean;
  locations: LocationEstate[];
  defaultLocationId: string;
  initialCoords?: { x: number; y: number } | null;
  onClose: () => void;
  onAdd: (newPlot: LandPlot) => void;
}

export const AddPlotModal: FC<AddPlotModalProps> = ({
  isOpen,
  locations,
  defaultLocationId,
  initialCoords,
  onClose,
  onAdd,
}) => {
  const [locationId, setLocationId] = useState(defaultLocationId);
  const [plotNumber, setPlotNumber] = useState('');
  const [zone, setZone] = useState('Zone 1');
  const [areaValue, setAreaValue] = useState('400');
  const [areaUnit, setAreaUnit] = useState<AreaUnit>('m²');
  const [totalPrice, setTotalPrice] = useState('9000');

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!plotNumber.trim()) return;

    const newPlot: LandPlot = {
      id: `plot-${Date.now()}`,
      locationId,
      plotNumber: plotNumber.trim(),
      zone: zone.trim() || 'Main',
      areaValue: Number(areaValue) || 0,
      areaUnit,
      status: 'available',
      totalPrice: Number(totalPrice) || 0,
      amountPaid: 0,
      paymentType: 'none',
      soldBy: '',
      buyerName: '',
      buyerPhone: '',
      saleDate: '',
      mapX: initialCoords?.x,
      mapY: initialCoords?.y,
    };

    onAdd(newPlot);
    setPlotNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            {initialCoords ? 'Pin New Plot on Site Plan' : 'Add New Land Plot'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Location / Estate</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.region})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Plot Number / Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Plot 75"
                value={plotNumber}
                onChange={(e) => setPlotNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Zone / Block</label>
              <input
                type="text"
                placeholder="e.g. Zone 1"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Area Size</label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  step="any"
                  required
                  value={areaValue}
                  onChange={(e) => setAreaValue(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as AreaUnit)}
                  className="px-2 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="m²">m²</option>
                  <option value="ha">ha</option>
                  <option value="acres">acres</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Asking Price ($)</label>
              <input
                type="number"
                required
                min={0}
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono-nums focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Add Plot
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
