import { type FC, type MouseEvent, useState, useRef } from 'react';
import { LandPlot, LocationEstate } from '../types/land';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Plus, Pencil } from 'lucide-react';

interface SitePlanMapProps {
  location: LocationEstate;
  locations: LocationEstate[];
  onSelectLocation: (locationId: string) => void;
  onEditLocation: (location: LocationEstate) => void;
  isAdmin?: boolean;
  plots: LandPlot[];
  selectedPlotId: string | null;
  onSelectPlot: (plot: LandPlot) => void;
  onAddPlotAtCoords: (x: number, y: number) => void;
}

export const SitePlanMap: FC<SitePlanMapProps> = ({
  location,
  locations,
  onSelectLocation,
  onEditLocation,
  isAdmin = false,
  plots,
  selectedPlotId,
  onSelectPlot,
  onAddPlotAtCoords,
}) => {
  const [zoom, setZoom] = useState(1);
  const [pinMode, setPinMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mappedPlots = plots.filter(
    (p) => typeof p.mapX === 'number' && typeof p.mapY === 'number'
  );

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!pinMode || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPinMode(false);
    onAddPlotAtCoords(Number(x.toFixed(1)), Number(y.toFixed(1)));
  };

  return (
    <div className="h-full bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col">
      {/* Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <select
            value={location.id}
            onChange={(e) => onSelectLocation(e.target.value)}
            aria-label="Select site plan map"
            className="font-medium text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/15"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} Site Plan
              </option>
            ))}
          </select>
          {isAdmin && (
            <button
              type="button"
              onClick={() => onEditLocation(location)}
              title="Edit current site"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <Pencil className="w-3 h-3" />
              Edit
            </button>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-600 inline-block" />
            Installment / Half
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-red-600 font-bold leading-none">✕</span>
            Sold (Crossed)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPinMode(!pinMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
              pinMode
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            {pinMode ? 'Click on map to place plot...' : 'Pin Plot on Map'}
          </button>

          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
              className="p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono-nums text-slate-700 border-x border-slate-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
              className="p-1.5 text-slate-600 hover:bg-slate-100 transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1.5 text-slate-600 hover:bg-slate-100 border-l border-slate-200 transition-colors"
              title="Reset zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-height Map Canvas */}
      <div className="flex-1 min-h-0 overflow-hidden bg-white p-8 sm:p-14 lg:p-16 flex items-center justify-center">
        <div
          ref={containerRef}
          onClick={handleImageClick}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            ...(!location.mapImageUrl
              ? { aspectRatio: `${location.gridCols || 6} / ${location.gridRows || 4}` }
              : {}),
          }}
          className={`relative mx-auto ${
            !location.mapImageUrl ? 'w-full max-w-4xl max-h-[calc(100vh-13rem)] bg-white border border-slate-200 rounded-lg' : ''
          } ${
            pinMode ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {location.mapImageUrl ? (
            <img
              src={location.mapImageUrl}
              alt={`${location.name} Site Plan`}
              referrerPolicy="no-referrer"
              className="block max-w-full max-h-[calc(100vh-13rem)] w-auto h-auto bg-white select-none"
              draggable={false}
            />
          ) : (
            <div
              className="w-full h-full grid gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${location.gridCols || 6}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${location.gridRows || 4}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: (location.gridRows || 4) * (location.gridCols || 6) }).map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white hover:bg-slate-50 transition-colors"
                />
              ))}
            </div>
          )}

          {/* Interactive Plot Markers */}
          {mappedPlots.map((plot) => {
            const isSelected = plot.id === selectedPlotId;
            const isSold = plot.status === 'sold';
            const isPartial = plot.status === 'installment' || plot.status === 'half_paid';

            return (
              <button
                key={plot.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!pinMode) onSelectPlot(plot);
                }}
                style={{
                  left: `${plot.mapX}%`,
                  top: `${plot.mapY}%`,
                }}
                title={`${plot.plotNumber} · ${plot.areaValue} ${plot.areaUnit} · ${plot.status.replace('_', ' ')}`}
                className={`absolute -translate-x-1/2 -translate-y-1/2 group flex items-center justify-center transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                  isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                }`}
              >
                {isSold ? (
                  <div
                    className={`w-7 h-7 rounded-md bg-red-600/90 text-white font-bold text-sm flex items-center justify-center shadow-sm border ${
                      isSelected ? 'border-slate-900 ring-2 ring-red-400' : 'border-white'
                    }`}
                  >
                    ✕
                  </div>
                ) : isPartial ? (
                  <div
                    className={`px-1.5 py-0.5 rounded bg-amber-500/95 text-white font-mono-nums text-[10px] font-semibold shadow-sm border ${
                      isSelected ? 'border-slate-900 ring-2 ring-amber-300' : 'border-white'
                    }`}
                  >
                    {plot.plotNumber.replace('Plot ', '')}
                  </div>
                ) : (
                  <div
                    className={`px-1.5 py-0.5 rounded bg-emerald-600/95 text-white font-mono-nums text-[10px] font-semibold shadow-sm border ${
                      isSelected ? 'border-slate-900 ring-2 ring-emerald-300' : 'border-white'
                    }`}
                  >
                    {plot.plotNumber.replace('Plot ', '')}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
