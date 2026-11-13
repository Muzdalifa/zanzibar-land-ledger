import { type FC, type FormEvent, useState, useEffect } from 'react';
import { LocationEstate } from '../types/land';
import { X } from 'lucide-react';

interface AddPlotModalProps {
  isOpen: boolean;
  editingLocation?: LocationEstate | null;
  onClose: () => void;
  onAdd: (location: LocationEstate) => void;
}

export const AddPlotModal: FC<AddPlotModalProps> = ({
  isOpen,
  editingLocation,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [region, setRegion] = useState('Unguja');
  const [description, setDescription] = useState('');
  const [mapImageUrl, setMapImageUrl] = useState('');
  const [gridRows, setGridRows] = useState('4');
  const [gridCols, setGridCols] = useState('6');

  useEffect(() => {
    if (editingLocation) {
      setName(editingLocation.name);
      setRegion(editingLocation.region || 'Unguja');
      setDescription(editingLocation.description || '');
      setMapImageUrl(editingLocation.mapImageUrl || '');
      setGridRows(String(editingLocation.gridRows || 4));
      setGridCols(String(editingLocation.gridCols || 6));
    } else {
      setName('');
      setRegion('Unguja');
      setDescription('');
      setMapImageUrl('');
      setGridRows('4');
      setGridCols('6');
    }
  }, [editingLocation, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newLocation: LocationEstate = {
      id: editingLocation ? editingLocation.id : `${slug || 'site'}-${Date.now()}`,
      name: name.trim(),
      region: region.trim() || 'Unguja',
      description: description.trim() || `${name.trim()} land estate`,
      mapImageUrl: mapImageUrl || undefined,
      gridRows: !mapImageUrl ? Math.max(1, Number(gridRows) || 4) : undefined,
      gridCols: !mapImageUrl ? Math.max(1, Number(gridCols) || 6) : undefined,
    };

    onAdd(newLocation);
    setName('');
    setDescription('');
    setMapImageUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-900">
            {editingLocation ? 'Edit Site / Map' : 'Add New Site / Map'}
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
            <label className="block text-xs font-medium text-slate-700 mb-1">Site / Estate Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Fumba Town"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Country / Island</label>
            <input
              type="text"
              required
              placeholder="e.g. Unguja"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Description (optional)</label>
            <input
              type="text"
              placeholder="e.g. Residential plots near the coast"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Site Plan Map Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) {
                  setMapImageUrl('');
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setMapImageUrl(reader.result);
                  }
                };
                reader.readAsDataURL(file);
              }}
              className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-200 file:text-xs file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
            />
          </div>

          {!mapImageUrl && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Map Grid Rows</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={gridRows}
                  onChange={(e) => setGridRows(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Map Grid Columns</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={gridCols}
                  onChange={(e) => setGridCols(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

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
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
            >
              {editingLocation ? 'Save Changes' : 'Add Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
