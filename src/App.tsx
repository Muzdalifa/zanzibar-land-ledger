"use client";

import { useState, useEffect, useMemo } from 'react';
import { INITIAL_LOCATIONS, INITIAL_PLOTS } from './data/initialData';
import { LandPlot, LocationEstate } from './types/land';
import { SitePlanMap } from './components/SitePlanMap';
import { PlotDetailDrawer } from './components/PlotDetailDrawer';
import { InstallmentRemindersView } from './components/InstallmentRemindersView';
import { AllRecordsView } from './components/AllRecordsView';
import { AddPlotModal } from './components/AddPlotModal';
import { AgentsView, type AgentRecord } from './components/AgentsView';
import { Plus, Search } from 'lucide-react';
import { collection, deleteDoc, doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, db, googleProvider } from './lib/firebase';
import { formatNumber } from './lib/numberFormat';

const ADMIN_EMAILS = ['muzdalifa.ali01@gmail.com'];

type ActiveTab = 'map' | 'records' | 'reminders' | 'agents';
type StatusFilter = 'all' | 'available' | 'partial' | 'sold';

const stripUndefined = <T extends object>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T;

const normalizePlotToAvailable = (plot: LandPlot): LandPlot => ({
  ...plot,
  status: 'available',
});

const seedPlots = INITIAL_PLOTS.map(normalizePlotToAvailable);

const plotKey = (plot: LandPlot): string =>
  `${plot.locationId}|${plot.plotNumber.trim().toLowerCase()}`;

export default function App() {
  const [locations, setLocations] = useState<LocationEstate[]>(INITIAL_LOCATIONS);
  const [plots, setPlots] = useState<LandPlot[]>(() => seedPlots);

  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('chwaka-kijindu');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationEstate | null>(null);
  const [pinCoords, setPinCoords] = useState<{ x: number; y: number } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [agents, setAgents] = useState<AgentRecord[]>([]);

  const isOwner = Boolean(
    user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase())
  );
  const isAdmin =
    isOwner ||
    Boolean(
      user?.email &&
        agents.some((a) => a.email.toLowerCase() === user.email!.toLowerCase())
    );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const loaded: AgentRecord[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          email: ((data.email as string | undefined) || d.id).toLowerCase(),
          name: data.name as string | undefined,
          phone: data.phone as string | undefined,
          role: (data.role as string | undefined) || 'agent',
          addedAt: data.addedAt as string | undefined,
        };
      });
      setAgents(loaded);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const locationsRef = collection(db, 'locations');
    const unsubscribe = onSnapshot(locationsRef, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_LOCATIONS.forEach((loc) => {
          batch.set(doc(db, 'locations', loc.id), stripUndefined(loc));
        });
        await batch.commit();
        return;
      }
      const loaded = snapshot.docs.map((d) => d.data() as LocationEstate);
      setLocations(loaded);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const plotsRef = collection(db, 'plots');
    const unsubscribe = onSnapshot(plotsRef, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        INITIAL_PLOTS.forEach((p) => {
          batch.set(doc(db, 'plots', p.id), stripUndefined(normalizePlotToAvailable(p)));
        });
        await batch.commit();
        return;
      }
      const loaded = snapshot.docs
        .map((d) => d.data() as LandPlot)
        .map(normalizePlotToAvailable);

      // Keep the latest local seed model as source-of-truth for map coordinates/labels.
      const merged = new Map<string, LandPlot>();
      loaded.forEach((plot) => merged.set(plotKey(plot), plot));
      seedPlots.forEach((plot) => merged.set(plotKey(plot), plot));

      setPlots(Array.from(merged.values()));
    });
    return () => unsubscribe();
  }, []);

  const currentLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId) || locations[0],
    [locations, selectedLocationId]
  );

  const filteredPlots = useMemo(() => {
    return plots.filter((p) => {
      if (selectedLocationId !== 'all' && p.locationId !== selectedLocationId) {
        return false;
      }
      if (statusFilter === 'available' && p.status !== 'available') return false;
      if (statusFilter === 'sold' && p.status !== 'sold') return false;
      if (
        statusFilter === 'partial' &&
        p.status !== 'installment' &&
        p.status !== 'half_paid'
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.plotNumber.toLowerCase().includes(q) ||
          p.buyerName.toLowerCase().includes(q) ||
          p.soldBy.toLowerCase().includes(q) ||
          p.zone.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [plots, selectedLocationId, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const scope =
      selectedLocationId === 'all'
        ? plots
        : plots.filter((p) => p.locationId === selectedLocationId);
    const total = scope.length;
    const sold = scope.filter((p) => p.status === 'sold').length;
    const partial = scope.filter(
      (p) => p.status === 'installment' || p.status === 'half_paid'
    ).length;
    const collected = scope.reduce((sum, p) => sum + p.amountPaid, 0);
    const outstanding = scope.reduce(
      (sum, p) => (p.status !== 'available' ? sum + Math.max(0, p.totalPrice - p.amountPaid) : sum),
      0
    );
    return { total, sold, partial, collected, outstanding };
  }, [plots, selectedLocationId]);

  const selectedPlot = useMemo(
    () => plots.find((p) => p.id === selectedPlotId) || null,
    [plots, selectedPlotId]
  );

  const handleSavePlot = async (updated: LandPlot) => {
    setPlots((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelectedPlotId(null);
    await setDoc(doc(db, 'plots', updated.id), stripUndefined(updated));
  };

  const handleDeletePlot = async (plotId: string) => {
    setPlots((prev) => prev.filter((p) => p.id !== plotId));
    setSelectedPlotId(null);
    await deleteDoc(doc(db, 'plots', plotId));
  };

  const handleAddLocation = async (newLocation: LocationEstate) => {
    setLocations((prev) =>
      prev.some((l) => l.id === newLocation.id)
        ? prev.map((l) => (l.id === newLocation.id ? newLocation : l))
        : [...prev, newLocation]
    );
    setSelectedLocationId(newLocation.id);
    await setDoc(doc(db, 'locations', newLocation.id), stripUndefined(newLocation));
  };

  const handleQuickLogPayment = async (plot: LandPlot) => {
    const payment = plot.monthlyInstallmentAmount || 500;
    const newPaid = Math.min(plot.totalPrice, plot.amountPaid + payment);
    const isNowFull = newPaid >= plot.totalPrice;
    const updated: LandPlot = {
      ...plot,
      amountPaid: newPaid,
      status: isNowFull ? 'sold' : plot.status,
      paymentType: isNowFull ? 'cash' : plot.paymentType,
      lastPaymentDate: new Date().toISOString().slice(0, 10),
    };
    setPlots((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    await setDoc(doc(db, 'plots', updated.id), stripUndefined(updated));
    const paymentId = `pay-${Date.now()}`;
    await setDoc(
      doc(db, 'plots', updated.id, 'payments', paymentId),
      stripUndefined({
        id: paymentId,
        plotId: updated.id,
        locationId: updated.locationId,
        amount: payment,
        buyerName: updated.buyerName,
        paidAt: updated.lastPaymentDate,
        statusAfterPayment: updated.status,
      })
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Bar Contract: 3 zones */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('map');
            }}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Zanzibar Land Ledger
          </a>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('map')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'map'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Site Plan Map
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('records')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'records'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              All Records
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reminders')}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'reminders'
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              Installment Reminders
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={() => setActiveTab('agents')}
                className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  activeTab === 'agents'
                    ? 'border-slate-900 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Agents
              </button>
            )}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setPinCoords(null);
                  setIsAddModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Site
              </button>
            )}
            {user ? (
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
                title={user.email || 'Signed in'}
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => signInWithPopup(auth, googleProvider)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                Admin Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`flex-1 min-h-0 max-w-7xl w-full mx-auto px-4 sm:px-6 ${
          activeTab === 'map' ? 'py-4 flex flex-col' : 'py-6 space-y-6 overflow-y-auto'
        }`}
      >
        {/* KPI Strip */}
        {activeTab !== 'map' && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Total Plots</p>
            <p className="text-2xl font-semibold font-mono-nums text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Sold (Crossed)</p>
            <p className="text-2xl font-semibold font-mono-nums text-red-600">{stats.sold}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Active Installments</p>
            <p className="text-2xl font-semibold font-mono-nums text-amber-600">{stats.partial}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Collected / Balance</p>
            <p className="text-lg font-semibold font-mono-nums text-slate-900">
              ${formatNumber(stats.collected)}
              <span className="text-xs font-normal text-slate-500 ml-1.5">
                (${formatNumber(stats.outstanding)} due)
              </span>
            </p>
          </div>
          </div>
        )}

        {/* Workspace Toolbar */}
        {activeTab !== 'reminders' && activeTab !== 'records' && activeTab !== 'map' && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(e.target.value)}
                className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >

                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} · {loc.region}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'available', label: 'Available' },
                    { id: 'partial', label: 'Installments' },
                    { id: 'sold', label: 'Sold' },
                  ] as { id: StatusFilter; label: string }[]
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      statusFilter === tab.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plot, buyer, seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>
        )}

        {/* Active View */}
        {activeTab === 'map' && (
          <div className="flex-1 min-h-0">
            <SitePlanMap
              location={currentLocation}
              locations={locations}
              onSelectLocation={setSelectedLocationId}
              onEditLocation={(loc) => {
                setEditingLocation(loc);
                setIsAddModalOpen(true);
              }}
              isAdmin={isAdmin}
              plots={filteredPlots}
              selectedPlotId={selectedPlotId}
              onSelectPlot={(plot) => setSelectedPlotId(plot.id)}
              onAddPlotAtCoords={(x, y) => {
                setPinCoords({ x, y });
                setIsAddModalOpen(true);
              }}
            />
          </div>
        )}

        {activeTab === 'records' && (
          <AllRecordsView
            plots={plots}
            locations={locations}
            onSelectPlot={(plot) => setSelectedPlotId(plot.id)}
          />
        )}

        {activeTab === 'reminders' && (
          <InstallmentRemindersView
            plots={plots}
            locations={locations}
            onSelectPlot={(plot) => setSelectedPlotId(plot.id)}
            onLogPayment={handleQuickLogPayment}
          />
        )}

        {activeTab === 'agents' && isOwner && (
          <AgentsView
            agents={agents}
            ownerEmail={ADMIN_EMAILS[0]}
            onAddAgent={async ({ email, name, phone }) => {
              await setDoc(
                doc(db, 'users', email),
                stripUndefined({
                  email,
                  name: name || undefined,
                  phone: phone || undefined,
                  role: 'agent',
                  addedAt: new Date().toISOString(),
                })
              );
            }}
            onRemoveAgent={async (id) => {
              await deleteDoc(doc(db, 'users', id));
            }}
          />
        )}
      </main>

      {/* Plot Detail / Sale Drawer */}
      <PlotDetailDrawer
        plot={selectedPlot}
        locationName={
          locations.find((l) => l.id === selectedPlot?.locationId)?.name || 'Zanzibar'
        }
        onClose={() => setSelectedPlotId(null)}
        onSave={handleSavePlot}
        onDelete={handleDeletePlot}
      />

      {/* Add / Edit Site Modal */}
      <AddPlotModal
        isOpen={isAddModalOpen}
        editingLocation={editingLocation}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingLocation(null);
          setPinCoords(null);
        }}
        onAdd={handleAddLocation}
      />
    </div>
  );
}
